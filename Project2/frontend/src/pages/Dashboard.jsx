import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import {
  UnorderedListOutlined,
  InboxOutlined,
  UsergroupAddOutlined,
  DeleteOutlined,
  DollarOutlined,
  FallOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import request from '../utils/request';

const AntdTitle = Typography.Title;

export default function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await request.get('/assets/statistics');
      setStats(res.data);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const statusChartOption = {
    tooltip: { trigger: 'item' },
    legend: { top: '5%', left: 'center' },
    series: [
      {
        name: '资产状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold' },
        },
        labelLine: { show: false },
        data: [
          { value: stats.stored || 0, name: '在库', itemStyle: { color: '#52c41a' } },
          { value: stats.inUse || 0, name: '使用中', itemStyle: { color: '#1890ff' } },
          { value: stats.scrapped || 0, name: '报废', itemStyle: { color: '#ff4d4f' } },
        ],
      },
    ],
  };

  const valueChartOption = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['资产总价值', '累计折旧'],
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value} 元' },
    },
    series: [
      {
        name: '金额',
        type: 'bar',
        data: [
          { value: stats.totalValue || 0, itemStyle: { color: '#1890ff' } },
          { value: stats.totalDepreciation || 0, itemStyle: { color: '#faad14' } },
        ],
        label: { show: true, position: 'top', formatter: '{c} 元' },
      },
    ],
  };

  return (
    <div>
      <AntdTitle level={4}>数据概览</AntdTitle>
      
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="资产总数"
              value={stats.total || 0}
              prefix={<UnorderedListOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="在库数量"
              value={stats.stored || 0}
              prefix={<InboxOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="使用中"
              value={stats.inUse || 0}
              prefix={<UsergroupAddOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="已报废"
              value={stats.scrapped || 0}
              prefix={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={12} sm={12}>
          <Card>
            <Statistic
              title="资产总价值"
              value={stats.totalValue || 0}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={12} sm={12}>
          <Card>
            <Statistic
              title="累计折旧"
              value={stats.totalDepreciation || 0}
              precision={2}
              prefix={<FallOutlined style={{ color: '#faad14' }} />}
              suffix="元"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12}>
          <Card title="资产状态分布">
            <ReactECharts option={statusChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="资产价值分析">
            <ReactECharts option={valueChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
