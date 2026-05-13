import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { chatAPI } from '../utils/api'
import { useUserStore } from '../store/userStore'
import { Navbar, useToast, Loading, Empty } from '../components/common'

export default function ChatRoomPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { show, Toast } = useToast()
  const messagesEndRef = useRef(null)
  const wsRef = useRef(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    try {
      const data = await chatAPI.getMessages(id, { page_size: 100 })
      setMessages(data.items || [])
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      console.error(err)
      show('获取消息失败')
    } finally {
      setLoading(false)
    }
  }

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const token = localStorage.getItem('token')
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/chat/${id}?token=${token}`

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'message') {
            setMessages((prev) => [...prev, data.data])
            setTimeout(scrollToBottom, 100)
          }
        } catch (err) {
          console.error('Parse message error:', err)
        }
      }

      ws.onclose = () => {
        setTimeout(connectWebSocket, 3000)
      }

      ws.onerror = (err) => {
        console.error('WebSocket error:', err)
      }
    } catch (err) {
      console.error('Connect error:', err)
    }
  }

  useEffect(() => {
    fetchMessages()
    const timer = setTimeout(connectWebSocket, 500)
    return () => {
      clearTimeout(timer)
      wsRef.current?.close()
    }
  }, [id])

  const sendMessage = () => {
    if (!input.trim()) return
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      show('连接中，请稍后...')
      return
    }

    const messageData = {
      content: input.trim(),
      message_type: 'text',
    }
    wsRef.current.send(JSON.stringify(messageData))
    setInput('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar title="聊天" onBack={() => navigate(-1)} />
        <Loading />
      </div>
    )
  }

  return (
    <div className="chat-container">
      <Navbar title="聊天" onBack={() => navigate(-1)} />

      <div className="chat-messages">
        {messages.length === 0 ? (
          <Empty description="暂无消息，开始聊天吧" />
        ) : (
          <>
            {messages.map((msg) => {
              const isSelf = msg.sender_id === user?.id
              return (
                <div key={msg.id} className={`chat-message ${isSelf ? 'self' : ''}`}>
                  <div className="avatar">
                    {isSelf ? user?.nickname?.charAt(0) || '我' : '对'}
                  </div>
                  <div className="content">{msg.content}</div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="chat-input-bar">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
          onKeyDown={handleKeyPress}
        />
        <button className="btn btn-primary" onClick={sendMessage}>
          发送
        </button>
      </div>

      <Toast />
    </div>
  )
}
