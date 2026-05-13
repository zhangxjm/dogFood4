import React, { useState, useRef } from 'react';
import {
  ProTable,
  ProFormText,
  ProFormDigit,
  ProFormSelect,
  ModalForm,
} from '@ant-design/pro-components';
import { Button, Tag, message, Popconfirm, Space, Form, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import request from '../utils/request';

export default function DepartmentList() {
  const [form] = Form.useForm();
  const actionRef = useRef();
  const [departments, setDepartments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDept, setCurrentDept] = useState(null);
  const [loading, setLoading] = useState(false);

  const columns = [
    { title: '部门名称', dataIndex: 'deptName', width: 180 },
    { title: '部门编码', dataIndex: 'deptCode', width: 120 },
    {
      title: '上级部门',
      dataIndex: 'parentId',
      width: 150,
      render: (val, record) => {
        if (!val || val === 0) return <Tag color="default">顶级</Tag>;
        const parent = departments.find(d => d.id === val);
        return parent?.deptName || '-';
      },
    },
    { title: '描述', dataIndex: 'description', width: 200, ellipsis: true },
    { title: '排序', dataIndex: 'sortOrder', width: 80 },
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
          <Popconfirm title="确认删除该部门吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const fetchData = async () => {
    try {
      const res = await request.get('/departments');
      setDepartments(res.data);
    } catch (error) {
      console.error('获取部门失败:', error);
    }
  };

  const handleCreate = () => {
    form.resetFields();
    setCurrentDept(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setCurrentDept(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await request.delete(`/departments/${id}`);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (currentDept) {
        await request.put('/departments', { ...currentDept, ...values });
        message.success('更新成功');
      } else {
        await request.post('/departments', values);
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

  const parentOptions = [{ label: '顶级', value: 0 }, ...departments.filter(d => d.deptCode !== 'HQ').map(d => ({ label: d.deptName, value: d.id }))];

  return (
    <div>
      <ProTable
        headerTitle="部门管理"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新增部门</Button>,
        ]}
        columns={columns}
        request={async () => {
          const res = await request.get('/departments');
          setDepartments(res.data);
          return {
            data: res.data,
            success: true,
            total: res.data.length,
          };
        }}
      />

      <ModalForm
        title={currentDept ? '编辑部门' : '新增部门'}
        open={modalVisible}
        form={form}
        onOpenChange={setModalVisible}
        onFinish={handleSubmit}
        submitTimeout={2000}
        modalProps={{ confirmLoading: loading, destroyOnClose: true }}
        layout="vertical"
      >
        <ProFormText name="deptName" label="部门名称" placeholder="请输入部门名称" rules={[{ required: true }]} />
        <ProFormText name="deptCode" label="部门编码" placeholder="请输入部门编码" rules={[{ required: true }]} disabled={!!currentDept} />
        <ProFormSelect name="parentId" label="上级部门" options={parentOptions} placeholder="请选择上级部门" />
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
