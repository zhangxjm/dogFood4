import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Switch, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { serviceApi } from '../api';

function Services() {
  const [services, setServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const res = await serviceApi.getAll();
      setServices(res.data);
    } catch (error) {
      message.error('加载服务列表失败');
    }
  };

  const handleAdd = () => {
    setEditingService(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingService(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await serviceApi.delete(id);
      message.success('删除成功');
      loadServices();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingService) {
        await serviceApi.update(editingService._id, values);
        message.success('更新成功');
      } else {
        await serviceApi.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadServices();
    } catch (error) {
      message.error(editingService ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    { title: '服务名称', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v) => `¥${v}` },
    { title: '时长(分钟)', dataIndex: 'duration', key: 'duration' },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v) => (v ? '启用' : '禁用'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginBottom: 16 }}>
        添加服务
      </Button>
      <Table columns={columns} dataSource={services} rowKey="_id" />

      <Modal
        title={editingService ? '编辑服务' : '添加服务'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="服务名称" rules={[{ required: true, message: '请输入服务名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="服务分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select>
              <Select.Option value="清洁">清洁</Select.Option>
              <Select.Option value="保姆">保姆</Select.Option>
              <Select.Option value="月嫂">月嫂</Select.Option>
              <Select.Option value="育儿嫂">育儿嫂</Select.Option>
              <Select.Option value="护工">护工</Select.Option>
              <Select.Option value="其他">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="服务描述" rules={[{ required: true, message: '请输入描述' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="price" label="价格(元)" rules={[{ required: true, message: '请输入价格' }]}>
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="duration" label="时长(分钟)" rules={[{ required: true, message: '请输入时长' }]}>
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item name="isActive" label="启用状态" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Services;
