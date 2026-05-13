import React, { useState, useRef } from 'react';
import {
  ProTable,
  ProFormText,
  ProFormDigit,
  ProFormSelect,
  ModalForm,
} from '@ant-design/pro-components';
import { Button, Tag, message, Popconfirm, Space, Form, Input, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import request from '../utils/request';

export default function CategoryList() {
  const [form] = Form.useForm();
  const actionRef = useRef();
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const columns = [
    { title: '分类名称', dataIndex: 'categoryName', width: 180 },
    { title: '分类编码', dataIndex: 'categoryCode', width: 120 },
    {
      title: '上级分类',
      dataIndex: 'parentId',
      width: 150,
      render: (val) => {
        if (!val || val === 0) return <Tag color="default">顶级</Tag>;
        const parent = categories.find(c => c.id === val);
        return parent?.categoryName || '-';
      },
    },
    { title: '年折旧率(%)', dataIndex: 'depreciationRate', width: 120 },
    { title: '使用寿命(月)', dataIndex: 'usefulLife', width: 120 },
    { title: '描述', dataIndex: 'description', width: 200, ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (val) => val === 1 ? <Tag color="success">启用</Tag> : <Tag color="error">禁用</Tag>,
    },
    {
      title: '操作',
      width: 180,
      valueType: 'option',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除该分类吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const fetchData = async () => {
    try {
      const res = await request.get('/asset-categories');
      setCategories(res.data);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const handleCreate = () => {
    form.resetFields();
    setCurrentCategory(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setCurrentCategory(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await request.delete(`/asset-categories/${id}`);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (currentCategory) {
        await request.put('/asset-categories', { ...currentCategory, ...values });
        message.success('更新成功');
      } else {
        await request.post('/asset-categories', values);
        message.success('创建成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
      fetchData();
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const parentOptions = [{ label: '顶级', value: 0 }, ...categories.map(c => ({ label: c.categoryName, value: c.id }))];

  return (
    <div>
      <ProTable
        headerTitle="资产分类管理"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新增分类</Button>,
        ]}
        columns={columns}
        request={async () => {
          const res = await request.get('/asset-categories');
          setCategories(res.data);
          return {
            data: res.data,
            success: true,
            total: res.data.length,
          };
        }}
      />

      <ModalForm
        title={currentCategory ? '编辑分类' : '新增分类'}
        open={modalVisible}
        form={form}
        onOpenChange={setModalVisible}
        onFinish={handleSubmit}
        submitTimeout={2000}
        modalProps={{ confirmLoading: loading, destroyOnClose: true }}
        layout="vertical"
      >
        <ProFormText name="categoryName" label="分类名称" placeholder="请输入分类名称" rules={[{ required: true }]} />
        <ProFormText name="categoryCode" label="分类编码" placeholder="请输入分类编码" rules={[{ required: true }]} disabled={!!currentCategory} />
        <ProFormSelect name="parentId" label="上级分类" options={parentOptions} placeholder="请选择上级分类" />
        <Form.Item name="depreciationRate" label="年折旧率(%)">
          <InputNumber style={{ width: '100%' }} placeholder="请输入年折旧率" min={0} max={100} precision={2} />
        </Form.Item>
        <ProFormDigit name="usefulLife" label="使用寿命(月)" placeholder="请输入使用寿命" min={0} />
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={3} placeholder="请输入描述" />
        </Form.Item>
        <ProFormDigit name="sortOrder" label="排序" placeholder="请输入排序" initialValue={0} />
        <ProFormSelect
          name="status"
          label="状态"
          options={[
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ]}
          placeholder="请选择状态"
          initialValue={1}
        />
      </ModalForm>
    </div>
  );
}
