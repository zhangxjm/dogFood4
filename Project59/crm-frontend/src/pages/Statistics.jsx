import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Progress, Statistic } from 'antd'
import { DollarOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons'
import axios from 'axios'

function Statistics() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalContractsAmount: 0,
    customerSources: [],
    salesFunnel: []
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

  const funnelStages = [
    { name: '初步接触', color: '#1890ff' },
    { name: '需求确认', color: '#36cfc9' },
    { name: '方案报价', color: '#73d13d' },
    { name: '商务谈判', color: '#faad14' },
    { name: '签约成交', color: '#ff4d4f' }
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>统计分析</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="客户总数"
              value={stats.totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
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
        <Col span={8}>
          <Card>
            <Statistic
              title="合同数"
              value={0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="销售漏斗" style={{ marginBottom: 16 }}>
            <div style={{ padding: '20px 0' }}>
              {funnelStages.map((stage, index) => (
                <div key={stage.name} style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>{stage.name}</span>
                    <span style={{ color: stage.color, fontWeight: 'bold' }}>
                      {Math.round(100 * (1 - index * 0.15))}%
                    </span>
                  </div>
                  <Progress
                    percent={Math.round(100 * (1 - index * 0.15))}
                    showInfo={false}
                    strokeColor={stage.color}
                    strokeWidth={30}
                    style={{
                      marginLeft: `${index * 25}px`,
                      width: `${100 - index * 25}%`
                    }}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="客户来源统计" style={{ marginBottom: 16 }}>
            <div style={{ padding: '20px 0' }}>
              {stats.customerSources && stats.customerSources.length > 0 ? (
                stats.customerSources.map((source, index) => (
                  <div key={source[0]} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span>{source[0]}</span>
                      <span>{source[1]} 人</span>
                    </div>
                    <Progress
                      percent={(source[1] / stats.totalCustomers) * 100 || 0}
                      showInfo={false}
                      strokeColor={['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'][index % 5]}
                    />
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#999' }}>暂无数据</p>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Statistics
