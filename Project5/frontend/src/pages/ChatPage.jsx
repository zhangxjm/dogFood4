import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatAPI } from '../utils/api'
import { Navbar, useToast, Loading, Empty } from '../components/common'

function parseTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
  } else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }
}

export default function ChatPage() {
  const navigate = useNavigate()
  const { show, Toast } = useToast()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const data = await chatAPI.getConversations()
      setConversations(data || [])
    } catch (err) {
      console.error(err)
      show('获取会话列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  if (loading) {
    return (
      <div>
        <Navbar title="消息" showBack={false} />
        <Loading />
      </div>
    )
  }

  return (
    <div className="page-container">
      <Navbar title="消息" showBack={false} />

      {conversations.length === 0 ? (
        <Empty description="暂无消息" />
      ) : (
        <div className="cell-group" style={{ margin: 0, borderRadius: 0 }}>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="cell"
              onClick={() => navigate(`/chat/${conv.id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginRight: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#1989fa',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}
                >
                  💬
                </div>
              </div>
              <div className="cell-content" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="cell-title" style={{ fontWeight: '500' }}>
                    会话 #{conv.id}
                  </span>
                  <span style={{ fontSize: '12px', color: '#969799' }}>
                    {parseTime(conv.last_message_time)}
                  </span>
                </div>
                <div className="cell-label" style={{ marginTop: '4px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {conv.last_message || '暂无消息'}
                </div>
              </div>
              <span className="cell-value">›</span>
            </div>
          ))}
        </div>
      )}

      <Toast />
    </div>
  )
}
