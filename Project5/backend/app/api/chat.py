from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, update
from typing import Optional
from datetime import datetime
from ..database import get_db
from ..models.models import Conversation, Message, User, Product
from ..schemas.schemas import ConversationResponse, MessageResponse
from .deps import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/conversations")
async def create_or_get_conversation(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    other_user_id = data.get("other_user_id")
    product_id = data.get("product_id")

    if not other_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="需要指定对方用户"
        )

    if other_user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能和自己聊天"
        )

    other_user = await db.get(User, other_user_id)
    if not other_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    conditions = [
        or_(
            and_(Conversation.user1_id == current_user.id, Conversation.user2_id == other_user_id),
            and_(Conversation.user1_id == other_user_id, Conversation.user2_id == current_user.id)
        )
    ]
    if product_id:
        conditions.append(Conversation.product_id == product_id)

    stmt = select(Conversation).where(and_(*conditions))
    conversation = await db.scalar(stmt)

    if not conversation:
        conversation = Conversation(
            user1_id=current_user.id,
            user2_id=other_user_id,
            product_id=product_id
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)

    other_user_data = {
        "id": other_user.id,
        "username": other_user.username,
        "nickname": other_user.nickname,
        "avatar": other_user.avatar,
        "school": other_user.school,
        "is_verified": other_user.is_verified
    }

    return {
        "id": conversation.id,
        "user1_id": conversation.user1_id,
        "user2_id": conversation.user2_id,
        "product_id": conversation.product_id,
        "last_message": conversation.last_message,
        "last_message_time": conversation.last_message_time,
        "created_at": conversation.created_at,
        "other_user": other_user_data
    }


@router.get("/conversations")
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Conversation).where(
        or_(
            Conversation.user1_id == current_user.id,
            Conversation.user2_id == current_user.id
        )
    ).order_by(Conversation.last_message_time.desc().nullslast(), Conversation.created_at.desc())

    result = await db.execute(stmt)
    conversations = result.scalars().all()

    items = []
    for conv in conversations:
        other_user_id = conv.user2_id if conv.user1_id == current_user.id else conv.user1_id
        other_user = await db.get(User, other_user_id)
        product = await db.get(Product, conv.product_id) if conv.product_id else None

        unread_stmt = select(Message).where(
            and_(
                Message.conversation_id == conv.id,
                Message.sender_id != current_user.id,
                Message.is_read == False
            )
        )
        unread_result = await db.execute(unread_stmt)
        unread_count = len(unread_result.scalars().all())

        items.append({
            "id": conv.id,
            "product_id": conv.product_id,
            "last_message": conv.last_message,
            "last_message_time": conv.last_message_time,
            "created_at": conv.created_at,
            "other_user": {
                "id": other_user.id,
                "username": other_user.username,
                "nickname": other_user.nickname,
                "avatar": other_user.avatar,
                "school": other_user.school,
                "is_verified": other_user.is_verified
            } if other_user else None,
            "product": {
                "id": product.id,
                "title": product.title,
                "price": product.price,
                "images": product.images
            } if product else None,
            "unread_count": unread_count
        })

    return {"items": items}


@router.get("/conversations/{conversation_id}/messages")
async def list_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200)
):
    conv = await db.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="会话不存在"
        )

    if conv.user1_id != current_user.id and conv.user2_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权访问"
        )

    count_stmt = select(Message).where(Message.conversation_id == conversation_id)
    count_result = await db.execute(count_stmt)
    total = len(count_result.scalars().all())

    stmt = select(Message).where(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.desc()).offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    messages = list(reversed(result.scalars().all()))

    await db.execute(
        update(Message).where(
            and_(
                Message.conversation_id == conversation_id,
                Message.sender_id != current_user.id,
                Message.is_read == False
            )
        ).values(is_read=True)
    )
    await db.commit()

    return {
        "total": total,
        "items": [MessageResponse.model_validate(m) for m in messages]
    }


@router.post("/conversations/{conversation_id}/messages/read")
async def mark_messages_read(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    conv = await db.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="会话不存在"
        )

    await db.execute(
        update(Message).where(
            and_(
                Message.conversation_id == conversation_id,
                Message.sender_id != current_user.id,
                Message.is_read == False
            )
        ).values(is_read=True)
    )
    await db.commit()

    return {"message": "已标记为已读"}
