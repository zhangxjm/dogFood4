import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, List, Alert } from 'antd'
import { UserOutlined, DollarOutlined, FileTextOutlined, PhoneOutlined } from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'

function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalContractsAmount: 0,
    upcomingFollowUps: []
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await axios.get('/api/statistics/dashboard')
      setStats(res.data)
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>仪表盘</h2>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="客户总数"
              value={stats.totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="合同总金额"
              value={stats.totalContractsAmount}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待跟进提醒"
              value={stats.upcomingFollowUps?.length || 0}
              prefix={<PhoneOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="销售机会"
              value={0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {stats.upcomingFollowUps?.length > 0 && (
        <Alert
          message="客户跟进提醒"
          description={
            <List
              dataSource={stats.upcomingFollowUps}
              renderItem={customer => (
                <List.Item>
                  <List.Item.Meta
                    title={customer.name}
                    description={`下次跟进时间: ${dayjs(customer.nextFollowUp).format('YYYY-MM-DD HH:mm')}`}
                  />
                </List.Item>
              )}
            />
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={16}>
        <Col span={24}>
          <Card title="欢迎使用CRM系统">
            <p>这是一个简易的客户关系管理系统，包含以下功能：</p>
            <ul>
              <li>客户信息管理</li>
              <li>跟进记录管理</li>
              <li>销售机会管理</li>
              <li>合同管理</li>
              <li>统计分析</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
