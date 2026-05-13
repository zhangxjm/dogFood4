import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Input,
  Button,
  Space,
  Modal,
  Form,
  InputNumber,
  Select,
  DatePicker,
  Message,
  Popconfirm,
  Tag,
  Typography,
  Grid,
} from '@arco-design/web-react';
import { booksApi } from '../api';

const FormItem = Form.Item;
const Option = Select.Option;
const Search = Input.Search;
const Row = Grid.Row;
const Col = Grid.Col;
const TextArea = Input.TextArea;

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState({
    search: '',
    category: '',
    available_only: false,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [isbnModalVisible, setIsbnModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isbnForm] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadBooks();
    loadCategories();
  }, []);

  useEffect(() => {
    loadBooks();
  }, [pagination.current, pagination.pageSize]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ...searchParams,
      };
      const response = await booksApi.getAll(params);
      setBooks(response.data.items || []);
      setPagination((prev) => ({ ...prev, total: response.data.total || 0 }));
    } catch (error) {
      console.error('Failed to load books:', error);
      Message.error('加载图书列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await booksApi.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSearch = (value) => {
    setSearchParams((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
    setTimeout(loadBooks, 0);
  };

  const handleCategoryChange = (value) => {
    setSearchParams((prev) => ({ ...prev, category: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
    setTimeout(loadBooks, 0);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await booksApi.delete(record.id);
      Message.success('删除成功');
      loadBooks();
    } catch (error) {
      console.error('Failed to delete book:', error);
      Message.error(error.response?.data?.detail || '删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await booksApi.update(editingRecord.id, values);
        Message.success('更新成功');
      } else {
        await booksApi.create(values);
        Message.success('添加成功');
      }
      setModalVisible(false);
      loadBooks();
      loadCategories();
    } catch (error) {
      console.error('Failed to save book:', error);
      Message.error(error.response?.data?.detail || '保存失败');
    }
  };

  const handleIsbnSubmit = async (values) => {
    try {
      await booksApi.createByIsbn(values.isbn);
      Message.success('通过 ISBN 录入成功');
      setIsbnModalVisible(false);
      isbnForm.resetFields();
      loadBooks();
      loadCategories();
    } catch (error) {
      console.error('Failed to create by ISBN:', error);
      Message.error(error.response?.data?.detail || 'ISBN 录入失败');
    }
  };

  const columns = [
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      width: 140,
    },
    {
      title: '书名',
      dataIndex: 'title',
      width: 200,
    },
    {
      title: '作者',
      dataIndex: 'author',
      width: 120,
    },
    {
      title: '出版社',
      dataIndex: 'publisher',
      width: 150,
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 100,
    },
    {
      title: '库存',
      dataIndex: 'total_quantity',
      width: 80,
    },
    {
      title: '可借',
      dataIndex: 'available_quantity',
      width: 80,
      render: (value) => {
        if (value > 0) {
          return <Tag color="green">{value}</Tag>;
        }
        return <Tag color="red">{value}</Tag>;
      },
    },
    {
      title: '馆藏位置',
      dataIndex: 'location',
      width: 100,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这本图书吗？"
            onOk={() => handleDelete(record)}
          >
            <Button type="text" size="small" status="danger">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div className="page-header">
        <Typography.Title heading={5} className="page-title">
          图书管理
        </Typography.Title>
        <Space>
          <Button onClick={() => setIsbnModalVisible(true)}>
            📱 ISBN 录入
          </Button>
          <Button type="primary" onClick={handleAdd}>
            ➕ 添加图书
          </Button>
        </Space>
      </div>

      <div className="search-form">
        <Row gutter={16}>
          <Col span={8}>
            <Search
              placeholder="搜索书名、作者或 ISBN"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="选择分类"
              allowClear
              style={{ width: '100%' }}
              onChange={handleCategoryChange}
            >
              {categories.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Button onClick={loadBooks}>
              🔄 刷新
            </Button>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        data={books}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) =>
            setPagination((prev) => ({ ...prev, current: page, pageSize })),
        }}
        rowKey="id"
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingRecord ? '编辑图书' : '添加图书'}
        visible={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        style={{ width: 700 }}
      >
        <Form form={form} layout="vertical" onSubmit={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <FormItem
                label="ISBN"
                field="isbn"
                rules={[{ required: true, message: '请输入 ISBN' }]}
              >
                <Input placeholder="请输入 ISBN" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="书名"
                field="title"
                rules={[{ required: true, message: '请输入书名' }]}
              >
                <Input placeholder="请输入书名" />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <FormItem
                label="作者"
                field="author"
                rules={[{ required: true, message: '请输入作者' }]}
              >
                <Input placeholder="请输入作者" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="出版社" field="publisher">
                <Input placeholder="请输入出版社" />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <FormItem label="分类" field="category">
                <Select
                  placeholder="请选择分类"
                  allowCreate
                  style={{ width: '100%' }}
                >
                  {categories.map((cat) => (
                    <Option key={cat} value={cat}>
                      {cat}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="出版日期" field="publish_date">
                <DatePicker placeholder="请选择出版日期" style={{ width: '100%' }} />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <FormItem
                label="总数量"
                field="total_quantity"
                rules={[{ required: true, message: '请输入总数量' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="可借数量"
                field="available_quantity"
                rules={[{ required: true, message: '请输入可借数量' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </FormItem>
            </Col>
          </Row>
          <FormItem label="馆藏位置" field="location">
            <Input placeholder="请输入馆藏位置" />
          </FormItem>
          <FormItem label="封面 URL" field="cover_url">
            <Input placeholder="请输入封面图片 URL" />
          </FormItem>
          <FormItem label="描述" field="description">
            <TextArea placeholder="请输入图书描述" rows={3} />
          </FormItem>
        </Form>
      </Modal>

      <Modal
        title="通过 ISBN 录入图书"
        visible={isbnModalVisible}
        onOk={() => isbnForm.submit()}
        onCancel={() => setIsbnModalVisible(false)}
      >
        <Form form={isbnForm} layout="vertical" onSubmit={handleIsbnSubmit}>
          <FormItem
            label="ISBN"
            field="isbn"
            rules={[{ required: true, message: '请输入 ISBN' }]}
          >
            <Input placeholder="请输入图书的 ISBN 号" />
          </FormItem>
          <Typography.Paragraph type="secondary">
            系统将自动从 Open Library 获取图书信息。
          </Typography.Paragraph>
        </Form>
      </Modal>
    </Card>
  );
}

export default Books;
