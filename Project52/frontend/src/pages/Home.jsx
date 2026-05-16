import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Input, Select, Tag, Pagination, Empty, Image, Typography, Space, Button } from 'antd'
import { LikeOutlined, MessageOutlined, EyeOutlined, FireOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { guideAPI, categoryAPI } from '../services/api'
import dayjs from 'dayjs'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

export default function Home() {
  const navigate = useNavigate()
  const [guides, setGuides] = useState([])
  const [hotGuides, setHotGuides] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 12, total: 0 })
  const [filters, setFilters] = useState({ category_id: null, sort: 'latest', search: '' })

  useEffect(() => {
    fetchCategories()
    fetchHotGuides()
  }, [])

  useEffect(() => {
    fetchGuides()
  }, [filters, pagination.current])

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getCategories()
      setCategories(res.data)
    } catch (error) {
      console.error('获取分类失败', error)
    }
  }

  const fetchHotGuides = async () => {
    try {
      const res = await guideAPI.getHotGuides(5)
      setHotGuides(res.data)
    } catch (error) {
      console.error('获取热门攻略失败', error)
    }
  }

  const fetchGuides = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        per_page: pagination.pageSize,
        ...(filters.category_id && { category_id: filters.category_id }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.search && { search: filters.search })
      }
      const res = await guideAPI.getGuides(params)
      setGuides(res.data.guides)
      setPagination(prev => ({ ...prev, total: res.data.total }))
    } catch (error) {
      console.error('获取攻略失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (value) => {
    setFilters(prev => ({ ...prev, category_id: value || null }))
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleSortChange = (value) => {
    setFilters(prev => ({ ...prev, sort: value }))
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }))
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={18}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
              <Space wrap size="large">
                <Search
                  placeholder="搜索攻略..."
                  allowClear
                  enterButton
                  size="large"
                  onSearch={handleSearch}
                  style={{ width: 300 }}
                />
                <Select
                  placeholder="选择分类"
                  allowClear
                  size="large"
                  style={{ width: 150 }}
                  onChange={handleCategoryChange}
                >
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</Option>
                  ))}
                </Select>
                <Select
                  defaultValue="latest"
                  size="large"
                  style={{ width: 120 }}
                  onChange={handleSortChange}
                >
                  <Option value="latest">最新发布</Option>
                  <Option value="hot">🔥 热门</Option>
                </Select>
              </Space>
            </Card>

            {guides.length === 0 ? (
              <Card>
                <Empty description="暂无攻略" />
              </Card>
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  {guides.map(guide => (
                    <Col key={guide.id} xs={24} sm={12} md={8} lg={6}>
                      <Card
                        className="guide-card"
                        hoverable
                        cover={
                          <div style={{ height: 180, overflow: 'hidden' }}>
                            <Image
                              src={guide.cover_image || 'https://picsum.photos/400/180?random=' + guide.id}
                              alt={guide.title}
                              preview={false}
                              style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                            />
                          </div>
                        }
                        onClick={() => navigate(`/guide/${guide.id}`)}
                      >
                        <Card.Meta
                          title={<div style={{ fontSize: 16, fontWeight: 600 }}>{guide.title}</div>}
                          description={
                            <div>
                              <Tag color="blue">{guide.category.name}</Tag>
                              <div style={{ marginTop: 8 }}>
                                <Space>
                                  <span><EyeOutlined /> {guide.view_count}</span>
                                  <span><LikeOutlined /> {guide.like_count}</span>
                                  <span><MessageOutlined /> {guide.comment_count}</span>
                                </Space>
                              </div>
                              <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                                {dayjs(guide.created_at).format('YYYY-MM-DD')}
                              </div>
                            </div>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={(page) => setPagination(prev => ({ ...prev, current: page }))}
                  />
                </div>
              </>
            )}
          </Space>
        </Col>

        <Col span={6}>
          <Card title={<><FireOutlined style={{ color: '#faad14' }} /> 热门攻略</>}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {hotGuides.map((guide, index) => (
                <div
                  key={guide.id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    cursor: 'pointer',
                    padding: 8,
                    borderRadius: 8,
                    transition: 'background 0.3s'
                  }}
                  onClick={() => navigate(`/guide/${guide.id}`)}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: index < 3 ? '#faad14' : '#d9d9d9',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {guide.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      <LikeOutlined /> {guide.like_count} 点赞
                    </div>
                  </div>
                </div>
              ))}
            </Space>
          </Card>

          <Card title="分类导航" style={{ marginTop: 24 }}>
            <Space wrap>
              {categories.map(cat => (
                <Tag
                  key={cat.id}
                  color="blue"
                  style={{ cursor: 'pointer', fontSize: 14, padding: '4px 12px' }}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.icon} {cat.name}
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
