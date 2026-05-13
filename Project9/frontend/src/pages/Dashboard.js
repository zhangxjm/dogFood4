import React, { useEffect, useState } from 'react';
import { Card, Grid, Statistic, Typography, Space } from '@arco-design/web-react';
import { statsApi } from '../api';

const Row = Grid.Row;
const Col = Grid.Col;

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await statsApi.getOverview();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats({
        total_books: 0,
        total_readers: 0,
        total_borrowed: 0,
        total_overdue: 0,
        total_reservations: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography.Title heading={4} style={{ marginBottom: 24 }}>
        系统概览
      </Typography.Title>
      
      <Row gutter={24}>
        <Col span={6}>
          <Card style={{ marginBottom: 24 }}>
            <Statistic
              title="📚 馆藏图书"
              value={stats?.total_books || 0}
              loading={loading}
              suffix="本"
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card style={{ marginBottom: 24 }}>
            <Statistic
              title="👥 注册读者"
              value={stats?.total_readers || 0}
              loading={loading}
              suffix="人"
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card style={{ marginBottom: 24 }}>
            <Statistic
              title="📅 借出图书"
              value={stats?.total_borrowed || 0}
              loading={loading}
              suffix="本"
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card style={{ marginBottom: 24 }}>
            <Statistic
              title="⚠️ 超期图书"
              value={stats?.total_overdue || 0}
              loading={loading}
              suffix="本"
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={24}>
        <Col span={12}>
          <Card title="快速操作">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Typography.Paragraph>
                欢迎使用图书馆管理系统！您可以：
              </Typography.Paragraph>
              <ul style={{ paddingLeft: 20 }}>
                <li>通过 ISBN 快速录入图书</li>
                <li>管理读者信息和借阅记录</li>
                <li>处理预约和超期计费</li>
                <li>查看统计报表</li>
                <li>批量导入导出数据</li>
              </ul>
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="待处理事项">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {stats?.total_overdue > 0 && (
                <Typography.Paragraph type="error">
                  有 {stats.total_overdue} 本图书超期未还
                </Typography.Paragraph>
              )}
              {stats?.total_reservations > 0 && (
                <Typography.Paragraph>
                  有 {stats.total_reservations} 个待处理的预约请求
                </Typography.Paragraph>
              )}
              {(!stats || (stats.total_overdue === 0 && stats.total_reservations === 0)) && (
                <Typography.Paragraph type="success">
                  当前没有待处理事项
                </Typography.Paragraph>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
