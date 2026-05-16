import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Avatar, Space, Button, Image, Input, List, message, Tag, Popconfirm } from 'antd'
import { LikeOutlined, LikeFilled, EditOutlined, DeleteOutlined, SendOutlined, EnvironmentOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons'
import { guideAPI, commentAPI } from '../services/api'
import { getUser, isAuthenticated } from '../utils/auth'
import dayjs from 'dayjs'

const { Title, Paragraph } = Typography
const { TextArea } = Input

export default function GuideDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [guide, setGuide] = useState(null)
  const [comments, setComments] = useState([])
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(false)
  const currentUser = getUser()

  useEffect(() => {
    fetchGuide()
    fetchComments()
    if (isAuthenticated()) {
      fetchLikeStatus()
    }
  }, [id])

  const fetchGuide = async () => {
    try {
      const res = await guideAPI.getGuide(id)
      setGuide(res.data)
      setLikeCount(res.data.like_count)
    } catch (error) {
      message.error('获取攻略失败')
    }
  }

  const fetchComments = async () => {
    try {
      const res = await commentAPI.getGuideComments(id)
      setComments(res.data)
    } catch (error) {
      message.error('获取评论失败')
    }
  }

  const fetchLikeStatus = async () => {
    try {
      const res = await guideAPI.getLikeStatus(id)
      setLiked(res.data.liked)
    } catch (error) {
      console.error('获取点赞状态失败', error)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated()) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    try {
      const res = await guideAPI.toggleLike(id)
      setLiked(res.data.liked)
      setLikeCount(res.data.like_count)
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleComment = async () => {
    if (!commentText.trim()) {
      message.warning('请输入评论内容')
      return
    }
    setLoading(true)
    try {
      await commentAPI.createComment({
        guide_id: id,
        content: commentText
      })
      message.success('评论成功')
      setCommentText('')
      fetchComments()
    } catch (error) {
      message.error('评论失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await guideAPI.deleteGuide(id)
      message.success('删除成功')
      navigate('/')
    } catch (error) {
      message.error('删除失败')
    }
  }

  if (!guide) {
    return <div style={{ textAlign: 'center', padding: 50 }}>加载中...</div>
  }

  const isOwner = currentUser && currentUser.id === guide.author.id

  return (
    <div>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={2} style={{ marginBottom: 16 }}>{guide.title}</Title>
              <Space wrap size="large">
                <Tag icon={<EnvironmentOutlined />} color="blue">{guide.location || '未填写'}</Tag>
                <Tag icon={<CalendarOutlined />} color="green">{guide.days} 天</Tag>
                <Tag icon={<DollarOutlined />} color="orange">预算 {guide.budget} 元</Tag>
                <Tag color="purple">{guide.category.icon} {guide.category.name}</Tag>
              </Space>
            </div>
            {isOwner && (
              <Space>
                <Button icon={<EditOutlined />} onClick={() => navigate(`/edit/${id}`)}>编辑</Button>
                <Popconfirm title="确定删除这篇攻略吗？" onConfirm={handleDelete}>
                  <Button danger icon={<DeleteOutlined />}>删除</Button>
                </Popconfirm>
              </Space>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar size={48}>{guide.author.username[0]}</Avatar>
            <div>
              <div style={{ fontWeight: 500, fontSize: 16, cursor: 'pointer' }} onClick={() => navigate(`/user/${guide.author.id}`)}>
                {guide.author.username}
              </div>
              <div style={{ color: '#999', fontSize: 14 }}>
                发布于 {dayjs(guide.created_at).format('YYYY年MM月DD日')}
              </div>
            </div>
          </div>

          {guide.cover_image && (
            <Image src={guide.cover_image} alt={guide.title} style={{ maxHeight: 400, objectFit: 'cover' }} />
          )}

          {guide.images.length > 0 && (
            <div>
              <Title level={4}>📸 图片展示</Title>
              <Image.PreviewGroup>
                <Space wrap>
                  {guide.images.map((img, idx) => (
                    <Image key={idx} width={200} src={img.image_url} style={{ borderRadius: 8 }} />
                  ))}
                </Space>
              </Image.PreviewGroup>
            </div>
          )}

          <div>
            <Title level={4}>📝 攻略内容</Title>
            <Paragraph style={{ fontSize: 16, lineHeight: 2 }}>
              {guide.content.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </Paragraph>
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
            <Space size="large">
              <Button
                type={liked ? 'primary' : 'default'}
                icon={liked ? <LikeFilled /> : <LikeOutlined />}
                onClick={handleLike}
              >
                {likeCount} 点赞
              </Button>
              <span>💬 {comments.length} 评论</span>
              <span>👁️ {guide.view_count} 浏览</span>
            </Space>
          </div>
        </Space>
      </Card>

      <Card title={`💬 评论 (${comments.length})`} style={{ marginTop: 24 }}>
        {isAuthenticated() && (
          <div style={{ marginBottom: 24 }}>
            <TextArea
              rows={4}
              placeholder="写下你的评论..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleComment}
              loading={loading}
            >
              发表评论
            </Button>
          </div>
        )}

        <List
          dataSource={comments}
          itemLayout="horizontal"
          renderItem={comment => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{comment.author.username[0]}</Avatar>}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate(`/user/${comment.author.id}`)}>
                      {comment.author.username}
                    </span>
                    <span style={{ fontSize: 12, color: '#999' }}>
                      {dayjs(comment.created_at).format('YYYY-MM-DD HH:mm')}
                    </span>
                  </div>
                }
                description={comment.content}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}
