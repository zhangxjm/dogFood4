import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Avatar, message, List, Tag, Empty, Space, Typography, Button } from 'antd'
import { UserOutlined, BookOutlined } from '@ant-design/icons'
import { authAPI, guideAPI } from '../services/api'
import dayjs from 'dayjs'

const { Title } = Typography

export default function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [guides, setGuides] = useState([])

  useEffect(() => {
    fetchUserProfile()
    fetchUserGuides()
  }, [id])

  const fetchUserProfile = async () => {
    try {
      const res = await authAPI.getUserProfile(id)
      setUser(res.data)
    } catch (error) {
      message.error('获取用户信息失败')
    }
  }

  const fetchUserGuides = async () => {
    try {
      const res = await guideAPI.getUserGuides(id, { page: 1, per_page: 100 })
      setGuides(res.data.guides)
    } catch (error) {
      message.error('获取用户攻略失败')
    }
  }

  if (!user) {
    return <div style={{ textAlign: 'center', padding: 50 }}>加载中...</div>
  }

  return (
    <div>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Avatar size={80} icon={<UserOutlined />} />
          <Title level={3} style={{ marginTop: 16 }}>{user.username}</Title>
          <p style={{ color: '#666', marginTop: 8 }}>{user.bio || '这个人很懒，什么都没写~'}</p>
          <p style={{ fontSize: 14, color: '#999' }}>
            加入于 {dayjs(user.created_at).format('YYYY年MM月DD日')}
          </p>
        </div>
      </Card>

      <Card title={<><BookOutlined /> TA的攻略 ({guides.length})</>} style={{ marginTop: 24 }}>
        {guides.length === 0 ? (
          <Empty description="暂无攻略" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={guides}
            renderItem={guide => (
              <List.Item
                actions={[
                  <Button type="link" onClick={() => navigate(`/guide/${guide.id}`)}>查看</Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={guide.cover_image} shape="square" size={64} />}
                  title={
                    <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/guide/${guide.id}`)}>
                      {guide.title}
                    </span>
                  }
                  description={
                    <div>
                      <Space>
                        <Tag color="blue">{guide.category.name}</Tag>
                        <span>👁️ {guide.view_count}</span>
                        <span>👍 {guide.like_count}</span>
                        <span>💬 {guide.comment_count}</span>
                        <span style={{ color: '#999' }}>{dayjs(guide.created_at).format('YYYY-MM-DD')}</span>
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}
