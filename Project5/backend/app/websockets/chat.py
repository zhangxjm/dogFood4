from fastapi import WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import Dict, Set
import json
from datetime import datetime
from ..database import AsyncSessionLocal
from ..models.models import Conversation, Message, User
from ..core.security import decode_access_token


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Dict[int, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, conversation_id: int, user_id: int):
        await websocket.accept()
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = {}
        self.active_connections[conversation_id][user_id] = websocket

    def disconnect(self, conversation_id: int, user_id: int):
        if conversation_id in self.active_connections:
            if user_id in self.active_connections[conversation_id]:
                del self.active_connections[conversation_id][user_id]
            if not self.active_connections[conversation_id]:
                del self.active_connections[conversation_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, conversation_id: int, message: dict, exclude_user_id: int = None):
        if conversation_id in self.active_connections:
            for user_id, connection in self.active_connections[conversation_id].items():
                if exclude_user_id and user_id == exclude_user_id:
                    continue
                try:
                    await connection.send_json(message)
                except:
                    pass


manager = ConnectionManager()


async def get_user_from_token(token: str) -> User:
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None

    async with AsyncSessionLocal() as db:
        user = await db.get(User, int(user_id))
        return user


async def get_conversation_user_ids(db: AsyncSession, conversation_id: int) -> tuple:
    conv = await db.get(Conversation, conversation_id)
    if not conv:
        return None, None
    return conv.user1_id, conv.user2_id


async def save_message(db: AsyncSession, conversation_id: int, sender_id: int, content: str, message_type: str = "text") -> Message:
    message = Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        content=content,
        message_type=message_type,
        is_read=False
    )
    db.add(message)

    conv = await db.get(Conversation, conversation_id)
    if conv:
        conv.last_message = content[:500]
        conv.last_message_time = datetime.utcnow()

    await db.commit()
    await db.refresh(message)
    return message


async def chat_websocket_endpoint(websocket: WebSocket, conversation_id: int, token: str):
    user = await get_user_from_token(token)
    if not user:
        await websocket.close(code=1008)
        return

    async with AsyncSessionLocal() as db:
        user1_id, user2_id = await get_conversation_user_ids(db, conversation_id)
        if not user1_id or user.id not in [user1_id, user2_id]:
            await websocket.close(code=1008)
            return

    await manager.connect(websocket, conversation_id, user.id)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
            except:
                continue

            content = message_data.get("content", "")
            message_type = message_data.get("message_type", "text")

            if not content:
                continue

            async with AsyncSessionLocal() as db:
                message = await save_message(db, conversation_id, user.id, content, message_type)

                message_response = {
                    "type": "message",
                    "data": {
                        "id": message.id,
                        "conversation_id": message.conversation_id,
                        "sender_id": message.sender_id,
                        "content": message.content,
                        "message_type": message.message_type,
                        "is_read": message.is_read,
                        "created_at": message.created_at.isoformat()
                    }
                }

                await manager.broadcast(conversation_id, message_response)

    except WebSocketDisconnect:
        manager.disconnect(conversation_id, user.id)
        await manager.broadcast(
            conversation_id,
            {"type": "user_left", "data": {"user_id": user.id}}
        )
    except Exception as e:
        manager.disconnect(conversation_id, user.id)
