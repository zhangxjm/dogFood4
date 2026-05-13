import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Select,
  Message,
  Tag,
  Typography,
  Grid,
} from '@arco-design/web-react';
import { reservationsApi, booksApi, readersApi } from '../api';

const FormItem = Form.Item;
const Option = Select.Option;

function Reservations() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [books, setBooks] = useState([]);
  const [readers, setReaders] = useState([]);

  useEffect(() => {
    loadRecords();
    loadBooks();
    loadReaders();
  }, []);

  useEffect(() => {
    loadRecords();
  }, [pagination.current, pagination.pageSize]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
      };
      const response = await reservationsApi.getAll(params);
      setRecords(response.data.items || []);
      setPagination((prev) => ({ ...prev, total: response.data.total || 0 }));
    } catch (error) {
      console.error('Failed to load reservations:', error);
      Message.error('加载预约记录失败');
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      const response = await booksApi.getAll({ page_size: 100 });
      setBooks(response.data.items || []);
    } catch (error) {
      console.error('Failed to load books:', error);
    }
  };

  const loadReaders = async () => {
    try {
      const response = await readersApi.getAll({ page_size: 100 });
      setReaders(response.data.items || []);
    } catch (error) {
      console.error('Failed to load readers:', error);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      await reservationsApi.create(values);
      Message.success('预约成功');
      setModalVisible(false);
      loadRecords();
    } catch (error) {
      console.error('Failed to create reservation:', error);
      Message.error(error.response?.data?.detail || '预约失败');
    }
  };

  const handleCancel = async (record) => {
    try {
      await reservationsApi.cancel(record.id);
      Message.success('取消成功');
      loadRecords();
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      Message.error(error.response?.data?.detail || '取消失败');
    }
  };

  const handleComplete = async (record) => {
    try {
      await reservationsApi.complete(record.id);
      Message.success('完成预约');
      loadRecords();
    } catch (error) {
      console.error('Failed to complete reservation:', error);
      Message.error(error.response?.data?.detail || '完成失败');
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <Tag color="orange">待处理</Tag>;
      case 'completed':
        return <Tag color="green">已完成</Tag>;
      case 'cancelled':
        return <Tag color="red">已取消</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: '图书',
      dataIndex: 'book',
      width: 200,
      render: (book) => book?.title || '-',
    },
    {
      title: '读者',
      dataIndex: 'reader',
      width: 150,
      render: (reader) => reader?.name || '-',
    },
    {
      title: '预约日期',
      dataIndex: 'reservation_date',
      width: 120,
    },
    {
      title: '到期日期',
      dataIndex: 'expiry_date',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: getStatusTag,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
          <Button type="primary" size="small" onClick={() => handleComplete(record)}>
            完成
          </Button>
        )}
        {record.status === 'pending' && (
          <Button size="small" status="danger" onClick={() => handleCancel(record)}>
            取消
          </Button>
        )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div className="page-header">
        <Typography.Title heading={5} className="page-title">
          预约管理
        </Typography.Title>
        <Space>
          <Button type="primary" onClick={handleAdd}>
            ➕ 新增预约
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        data={records}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) =>
            setPagination((prev) => ({ ...prev, current: page, pageSize })),
        }}
        rowKey="id"
        scroll={{ x: 1000 }}
      />

      <Modal
        title="新增预约"
        visible={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical" onSubmit={handleSubmit}>
          <FormItem
            label="选择图书"
            field="book_id"
            rules={[{ required: true, message: '请选择图书' }]}
          >
            <Select placeholder="请选择图书" style={{ width: '100%' }}>
              {books
                .filter((book) => book.available_quantity === 0)
                .map((book) => (
                  <Option key={book.id} value={book.id}>
                    {book.title}
                  </Option>
                ))}
            </Select>
          </FormItem>
          <FormItem
            label="选择读者"
            field="reader_id"
            rules={[{ required: true, message: '请选择读者' }]}
          >
            <Select placeholder="请选择读者" style={{ width: '100%' }}>
              {readers.map((reader) => (
                <Option key={reader.id} value={reader.id}>
                  {reader.name} ({reader.card_number})
                </Option>
              ))}
            </Select>
          </FormItem>
          <Typography.Paragraph type="secondary">
            只能预约当前不可借的图书，预约有效期为7天。
          </Typography.Paragraph>
        </Form>
      </Modal>
    </Card>
  );
}

export default Reservations;
