import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag } from 'antd';
import { statsApi, bookingApi } from '../api';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  MoneyCollectOutlined,
} from '@ant-design/icons';

function Dashboard() {
  const [stats, setStats] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [topWorkers, setTopWorkers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, bookingsRes, workersRes] = await Promise.all([
        statsApi.getOverview(),
        bookingApi.getAll(),
        statsApi.getTopWorkers(),
      ]);
      setStats(statsRes.data);
      setRecentBookings(bookingsRes.data.slice(0, 5));
      setTopWorkers(workersRes.data);
    } catch (error) {
      console.error('加载数据失败', error);
    }
  };

  const bookingColumns = [
    { title: '客户', dataIndex: 'customerName', key: 'customerName' },
    { title: '服务', dataIndex: ['service', 'name'], key: 'service' },
    { title: '服务人员', dataIndex: ['worker', 'name'], key: 'worker' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = {
          '待确认': 'orange',
          '已确认': 'blue',
          '已完成': 'green',
          '已取消': 'red',
        }[status];
        return <Tag color={color}>{status}</Tag>;
      },
    },
    { title: '金额', dataIndex: 'totalPrice', key: 'totalPrice', render: (v) => `¥${v}` },
  ];

  const workerColumns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '评分', dataIndex: 'rating', key: 'rating' },
    { title: '评价数', dataIndex: 'reviewCount', key: 'reviewCount' },
    {
      title: '技能',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills) => skills.map((s) => <Tag key={s}>{s}</Tag>),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总预约数"
              value={stats.totalBookings || 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已确认预约"
              value={stats.confirmedBookings || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="服务人员"
              value={stats.activeWorkers || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收入"
              value={stats.totalRevenue || 0}
              prefix={<MoneyCollectOutlined />}
              precision={2}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={14}>
          <Card title="最近预约">
            <Table
              columns={bookingColumns}
              dataSource={recentBookings}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="优秀服务人员">
            <Table
              columns={workerColumns}
              dataSource={topWorkers}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
