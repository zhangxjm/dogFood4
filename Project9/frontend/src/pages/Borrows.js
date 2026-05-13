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
  Tabs,
} from '@arco-design/web-react';
import { borrowsApi, booksApi, readersApi } from '../api';

const FormItem = Form.Item;
const Option = Select.Option;
const Row = Grid.Row;
const Col = Grid.Col;
const TabPane = Tabs.TabPane;

function Borrows() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [status, setStatus] = useState('');
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
  }, [pagination.current, pagination.pageSize, status]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        status: status || undefined,
      };
      const response = await borrowsApi.getAll(params);
      setRecords(response.data.items || []);
      setPagination((prev) => ({ ...prev, total: response.data.total || 0 }));
    } catch (error) {
      console.error('Failed to load borrow records:', error);
      Message.error('加载借阅记录失败');
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
      await borrowsApi.create(values);
      Message.success('借阅成功');
      setModalVisible(false);
      loadRecords();
      loadBooks();
    } catch (error) {
      console.error('Failed to create borrow:', error);
      Message.error(error.response?.data?.detail || '借阅失败');
    }
  };

  const handleReturn = async (record) => {
    try {
      await borrowsApi.returnBook(record.id);
      Message.success('归还成功');
      loadRecords();
      loadBooks();
    } catch (error) {
      console.error('Failed to return book:', error);
      Message.error(error.response?.data?.detail || '归还失败');
    }
  };

  const handlePayFine = async (record) => {
    try {
      await borrowsApi.payFine(record.id);
      Message.success('缴费成功');
      loadRecords();
    } catch (error) {
      console.error('Failed to pay fine:', error);
      Message.error(error.response?.data?.detail || '缴费失败');
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'borrowed':
        return <Tag color="blue">借阅中</Tag>;
      case 'returned':
        return <Tag color="green">已归还</Tag>;
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
      title: '归还日期',
      dataIndex: 'return_date',
      width: 120,
      render: (value) => value || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: getStatusTag,
    },
    {
      title: '罚款金额',
      dataIndex: 'fine_amount',
      width: 120,
      render: (value, record) => {
        if (!value || value === '0') return '-';
        return (
          <div>
            <span style={{ color: '#ff4d4f' }}>¥{value}</span>
            {record.fine_paid ? (
              <Tag color="green" style={{ marginLeft: 8 }}>已缴</Tag>
            ) : (
              <Tag color="orange" style={{ marginLeft: 8 }}>未缴</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.status === 'borrowed' && (
          <Button type="primary" size="small" onClick={() => handleReturn(record)}>
            归还
          </Button>
        )}
        {record.fine_amount > 0 && !record.fine_paid && (
          <Button size="small" type="outline" status="warning" onClick={() => handlePayFine(record)}>
            缴费
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
          借阅管理
        </Typography.Title>
        <Space>
          <Button type="primary" onClick={handleAdd}>
            ➕ 新增借阅
          </Button>
        </Space>
      </div>

      <Tabs defaultActiveTab="all">
        <TabPane key="all" title="全部">
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
            scroll={{ x: 1200 }}
          />
        </TabPane>
        <TabPane key="borrowed" title="借阅中">
          <Button onClick={() => setStatus('borrowed')}>
            查看借阅中的记录
          </Button>
        </TabPane>
        <TabPane key="returned" title="已归还">
          <Button onClick={() => setStatus('returned')}>
            查看已归还的记录
          </Button>
        </TabPane>
      </Tabs>

      <Modal
        title="新增借阅"
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
                .filter((book) => book.available_quantity > 0)
                .map((book) => (
                  <Option key={book.id} value={book.id}>
                    {book.title} (可借: {book.available_quantity})
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
            借阅期限为30天，超期每天罚款0.5元。
          </Typography.Paragraph>
        </Form>
      </Modal>
    </Card>
  );
}

export default Borrows;
