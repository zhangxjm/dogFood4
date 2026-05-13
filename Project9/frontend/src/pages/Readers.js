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
  Message,
  Popconfirm,
  Tag,
  Typography,
  Grid,
} from '@arco-design/web-react';
import { readersApi } from '../api';

const FormItem = Form.Item;
const Option = Select.Option;
const Search = Input.Search;
const Row = Grid.Row;
const Col = Grid.Col;

function Readers() {
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchValue, setSearchValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);

  useEffect(() => {
    loadReaders();
  }, []);

  useEffect(() => {
    loadReaders();
  }, [pagination.current, pagination.pageSize]);

  const loadReaders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        search: searchValue || undefined,
      };
      const response = await readersApi.getAll(params);
      setReaders(response.data.items || []);
      setPagination((prev) => ({ ...prev, total: response.data.total || 0 }));
    } catch (error) {
      console.error('Failed to load readers:', error);
      Message.error('加载读者列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    setTimeout(loadReaders, 0);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active', max_borrow_count: 5 });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await readersApi.delete(record.id);
      Message.success('删除成功');
      loadReaders();
    } catch (error) {
      console.error('Failed to delete reader:', error);
      Message.error(error.response?.data?.detail || '删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await readersApi.update(editingRecord.id, values);
        Message.success('更新成功');
      } else {
        await readersApi.create(values);
        Message.success('添加成功');
      }
      setModalVisible(false);
      loadReaders();
    } catch (error) {
      console.error('Failed to save reader:', error);
      Message.error(error.response?.data?.detail || '保存失败');
    }
  };

  const columns = [
    {
      title: '卡号',
      dataIndex: 'card_number',
      width: 140,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      width: 140,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 180,
    },
    {
      title: '部门',
      dataIndex: 'department',
      width: 140,
    },
    {
      title: '最大借阅数',
      dataIndex: 'max_borrow_count',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value) => {
        if (value === 'active') {
          return <Tag color="green">正常</Tag>;
        }
        return <Tag color="red">禁用</Tag>;
      },
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
            title="确定要删除这个读者吗？"
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
          读者管理
        </Typography.Title>
        <Space>
          <Button type="primary" onClick={handleAdd}>
            ➕ 添加读者
          </Button>
        </Space>
      </div>

      <div className="search-form">
        <Row gutter={16}>
          <Col span={8}>
            <Search
              placeholder="搜索姓名、卡号或电话"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Button onClick={loadReaders}>
              🔄 刷新
            </Button>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        data={readers}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) =>
            setPagination((prev) => ({ ...prev, current: page, pageSize })),
        }}
        rowKey="id"
        scroll={{ x: 1100 }}
      />

      <Modal
        title={editingRecord ? '编辑读者' : '添加读者'}
        visible={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        style={{ width: 600 }}
      >
        <Form form={form} layout="vertical" onSubmit={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <FormItem
                label="姓名"
                field="name"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="卡号"
                field="card_number"
                rules={[{ required: true, message: '请输入卡号' }]}
              >
                <Input placeholder="请输入卡号" />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <FormItem label="电话" field="phone">
                <Input placeholder="请输入电话" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="邮箱" field="email">
                <Input placeholder="请输入邮箱" />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <FormItem label="部门" field="department">
                <Input placeholder="请输入部门" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="最大借阅数" field="max_borrow_count">
                <InputNumber min={1} max={20} style={{ width: '100%' }} />
              </FormItem>
            </Col>
          </Row>
          <FormItem label="状态" field="status">
            <Select style={{ width: '100%' }}>
              <Option value="active">正常</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </FormItem>
        </Form>
      </Modal>
    </Card>
  );
}

export default Readers;
