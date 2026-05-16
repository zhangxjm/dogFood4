import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag } from 'antd';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { statsApi } from '../api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function Statistics() {
  const [overview, setOverview] = useState({});
  const [statusData, setStatusData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [topWorkers, setTopWorkers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overviewRes, statusRes, serviceRes, trendRes, workersRes] = await Promise.all([
        statsApi.getOverview(),
        statsApi.getBookingsByStatus(),
        statsApi.getRevenueByService(),
        statsApi.getRevenueTrend(30),
        statsApi.getTopWorkers(),
      ]);
      
      setOverview(overviewRes.data);
      setStatusData(statusRes.data.map(d => ({ name: d.status, value: d.count, revenue: d.revenue })));
      setServiceData(serviceRes.data.map(d => ({ name: d.service, count: d.count, revenue: d.revenue })));
      setTrendData(trendRes.data.map(d => ({ date: d.date, revenue: d.revenue, count: d.count })));
      setTopWorkers(workersRes.data);
    } catch (error) {
      console.error('加载统计数据失败', error);
    }
  };

  const workerColumns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '评分', dataIndex: 'rating', key: 'rating' },
    { title: '评价数', dataIndex: 'reviewCount', key: 'reviewCount' },
    {
      title: '技能',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills) => skills?.map((s) => <Tag key={s}>{s}</Tag>),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card title="总预约数" size="small">
            <h2 style={{ fontSize: 24 }}>{overview.totalBookings || 0}</h2>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="已完成" size="small">
            <h2 style={{ fontSize: 24, color: '#52c41a' }}>{overview.completedBookings || 0}</h2>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="总收入(元)" size="small">
            <h2 style={{ fontSize: 24, color: '#faad14' }}>¥{overview.totalRevenue || 0}</h2>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="平均评分" size="small">
            <h2 style={{ fontSize: 24, color: '#1890ff' }}>{overview.avgRating || 0}</h2>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="收入趋势（近30天）" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="收入" />
                <Line yAxisId="right" type="monotone" dataKey="count" stroke="#82ca9d" name="订单数" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="各服务收入排行" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="收入(元)" />
                <Bar dataKey="count" fill="#82ca9d" name="订单数" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card title="订单状态分布" size="small">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="优秀服务人员" size="small">
            <Table columns={workerColumns} dataSource={topWorkers} rowKey="_id" pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Statistics;
