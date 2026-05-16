import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Avatar, message, List, Tag, Empty, Space, Typography } from 'antd'
import { UserOutlined, EditOutlined, BookOutlined } from '@ant-design/icons'
import { authAPI, guideAPI } from '../services/api'
import { getUser, setAuth } from '../utils/auth'
import dayjs from 'dayjs'

const { Title } = Typography

export default function Profile() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [user, setUser] = useState(null)
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchMyGuides()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await authAPI.getCurrentUser()
      setUser(res.data)
      form.setFieldsValue({
        bio: res.data.bio || ''
      })
    } catch (error) {
      message.error('获取用户信息失败')
    }
  }

  const fetchMyGuides = async () => {
    try {
      const currentUser = getUser()
      if (currentUser) {
        const res = await guideAPI.getUserGuides(currentUser.id, { page: 1, per_page: 100 })
        setGuides(res.data.guides)
      }
    } catch (error) {
      message.error('获取我的攻略失败')
    }
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const res = await authAPI.updateProfile(values)
      setUser(res.data)
      const token = localStorage.getItem('token')
      setAuth(token, res.data)
      message.success('更新成功')
    } catch (error) {
      message.error('更新失败')
    } finally {
      setLoading(false)
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
          <p style={{ color: '#999' }}>{user.email}</p>
          <p style={{ color: '#666', marginTop: 8 }}>{user.bio || '这个人很懒，什么都没写~'}</p>
          <p style={{ fontSize: 14, color: '#999' }}>
            加入于 {dayjs(user.created_at).format('YYYY年MM月DD日')}
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 500, margin: '0 auto' }}
        >
          <Form.Item name="bio" label="个人简介">
            <Input.TextArea rows={4} placeholder="介绍一下自己吧..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<EditOutlined />}>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title={<><BookOutlined /> 我的攻略 ({guides.length})</>} style={{ marginTop: 24 }}>
        {guides.length === 0 ? (
          <Empty
            description="还没有发布攻略"
            extra={
              <Button type="primary" onClick={() => navigate('/create')}>
                发布第一篇攻略
              </Button>
            }
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={guides}
            renderItem={guide => (
              <List.Item
                actions={[
                  <Button type="link" onClick={() => navigate(`/guide/${guide.id}`)}>查看</Button>,
                  <Button type="link" onClick={() => navigate(`/edit/${guide.id}`)}>编辑</Button>
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
