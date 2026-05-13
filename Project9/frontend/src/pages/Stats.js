import React, { useEffect, useState } from 'react';
import {
  Card,
  Grid,
  Statistic,
  Table,
  Typography,
  Space,
  Tag,
  Message,
  Button,
} from '@arco-design/web-react';
import { statsApi, borrowsApi } from '../api';

const Row = Grid.Row;
const Col = Grid.Col;

function Stats() {
  const [overview, setOverview] = useState(null);
  const [overdueStats, setOverdueStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [overviewResponse, overdueResponse] = await Promise.all([
        statsApi.getOverview(),
        statsApi.getOverdueStats(),
      ]);
      setOverview(overviewResponse.data);
      setOverdueStats(overdueResponse.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      Message.error('加载统计数据失败');
      setOverview({
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

  const handleReturn = async (record) => {
    try {
      await borrowsApi.returnBook(record.id);
      Message.success('归还成功');
      loadStats();
    } catch (error) {
      console.error('Failed to return book:', error);
      Message.error(error.response?.data?.detail || '归还失败');
    }
  };

  const handlePayFine = async (record) => {
    try {
      await borrowsApi.payFine(record.id);
      Message.success('缴费成功');
      loadStats();
    } catch (error) {
      console.error('Failed to pay fine:', error);
      Message.error(error.response?.data?.detail || '缴费失败');
    }
  };

  const overdueColumns = [
    {
      title: '图书',
      dataIndex: 'book_title',
      width: 200,
    },
    {
      title: '读者',
      dataIndex: 'reader_name',
      width: 120,
    },
    {
      title: '借阅日期',
      dataIndex: 'borrow_date',
      width: 120,
    },
    {
      title: '应还日期',
      dataIndex: 'due_date',
      width: 120,
    },
    {
      title: '超期天数',
      dataIndex: 'overdue_days',
      width: 100,
      render: (value) => (
        <span style={{ color: '#ff4d4f' }}>{value} 天</span>
      ),
    },
    {
      title: '当前罚款',
      dataIndex: 'current_fine',
      width: 120,
      render: (value) => (
        <span style={{ color: '#ff4d4f' }}>¥{value}</span>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Typography.Title heading={5} className="page-title">
          统计报表
        </Typography.Title>
        <Button onClick={loadStats}>
          🔄 刷新
        </Button>
      </div>

      <Row gutter={24}>
        <Col span={6}>
          <Card style={{ marginBottom: 24 }}>
            <Statistic
              title={<Space>📚 馆藏图书</Space>}
              value={overview?.total_books || 0}
              loading={loading}
              suffix="本"
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card style={{ marginBottom: 24 }}>
            <Statistic
              title={<Space>👥 注册读者</Space>}
              value={overview?.total_readers || 0}
              loading={loading}
              suffix="人"
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card style={{ marginBottom: 24 }}>
            <Statistic
              title={<Space>📅 借出图书</Space>}
              value={overview?.total_borrowed || 0}
              loading={loading}
              suffix="本"
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card style={{ marginBottom: 24 }}>
            <Statistic
              title={<Space>⚠️ 超期图书</Space>}
              value={overview?.total_overdue || 0}
              loading={loading}
              suffix="本"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Card
            title={<Space>⏰ 超期提醒</Space>}
            extra={
              <Tag color="red">
                总计罚款: ¥{overdueStats?.total_fine_amount || 0}
              </Tag>
            }
          >
            <Table
              columns={overdueColumns}
              data={overdueStats?.overdue_list || []}
              loading={loading}
              pagination={false}
              rowKey="id"
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="系统状态">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>待处理预约:</span>
                <Tag color="orange">
                  {overview?.total_reservations || 0} 个
                </Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>超期未还:</span>
                <Tag color="red">
                  {overview?.total_overdue || 0} 本
                </Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>累计罚款:</span>
                <Tag color="red">
                  ¥{overdueStats?.total_fine_amount || 0}
                </Tag>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Stats;
