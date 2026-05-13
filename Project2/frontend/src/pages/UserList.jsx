import React, { useEffect, useState, useRef } from 'react';
import {
  ProTable,
  ProFormText,
  ProFormSelect,
  ModalForm,
} from '@ant-design/pro-components';
import { Button, Tag, message, Popconfirm, Space, Switch, Form, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import request from '../utils/request';

const roleMap = {
  ADMIN: { text: '管理员', color: 'gold' },
  EMPLOYEE: { text: '普通员工', color: 'blue' },
};

export default function UserList() {
  const [form] = Form.useForm();
  const actionRef = useRef();
  const [departments, setDepartments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await request.get('/departments');
      setDepartments(res.data.map(item => ({ label: item.deptName, value: item.id })));
    } catch (error) {
      console.error('获取部门失败:', error);
    }
  };

  const columns = [
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: '真实姓名', dataIndex: 'realName', width: 120 },
    { title: '手机号', dataIndex: 'phone', width: 140 },
    { title: '邮箱', dataIndex: 'email', width: 180 },
    {
      title: '部门',
      dataIndex: 'deptId',
      width: 120,
      render: (_, record) => {
        const dept = departments.find(d => d.value === record.deptId);
        return dept?.label || '-';
      },
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 100,
      render: (val) => {
        const role = roleMap[val] || { text: val, color: 'default' };
        return <Tag color={role.color}>{role.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (val, record) => (
        <Switch
          checked={val === 1}
          onChange={(checked) => handleStatusChange(record.id, checked ? 1 : 0)}
        />
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      width: 160,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      width: 180,
      valueType: 'option',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          {record.username !== 'admin' && (
            <Popconfirm title="确认删除该用户吗？" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const handleCreate = () => {
    form.resetFields();
    setCurrentUser(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
      password: undefined,
    });
    setCurrentUser(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await request.delete(`/users/${id}`);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await request.put(`/users/${id}/status?status=${status}`);
      message.success('状态更新成功');
    } catch (error) {
      console.error('状态更新失败:', error);
      actionRef.current?.reload();
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (currentUser) {
        await request.put('/users', { ...currentUser, ...values });
        message.success('更新成功');
      } else {
        await request.post('/users', values);
        message.success('创建成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ProTable
        headerTitle="用户管理"
        actionRef={actionRef}
        rowKey="id"
        search={{ defaultCollapsed: false }}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新增用户</Button>,
        ]}
        columns={columns}
        request={async (params) => {
          const res = await request.get('/users', {
            params: {
              pageNum: params.current,
              pageSize: params.pageSize,
              keyword: params.keyword,
              deptId: params.deptId,
              role: params.role,
              status: params.status,
            },
          });
          return {
            data: res.data.records,
            success: true,
            total: res.data.total,
          };
        }}
      />

      <ModalForm
        title={currentUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        form={form}
        onOpenChange={setModalVisible}
        onFinish={handleSubmit}
        submitTimeout={2000}
        modalProps={{ confirmLoading: loading, destroyOnClose: true }}
        layout="vertical"
      >
        <ProFormText name="username" label="用户名" placeholder="请输入用户名" rules={[{ required: true }]} disabled={!!currentUser} />
        {!currentUser && (
          <Form.Item name="password" label="密码" rules={[{ required: !currentUser }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        )}
        {currentUser && (
          <Form.Item name="password" label="新密码 (留空则不修改)">
            <Input.Password placeholder="留空则不修改密码" />
          </Form.Item>
        )}
        <ProFormText name="realName" label="真实姓名" placeholder="请输入真实姓名" rules={[{ required: true }]} />
        <ProFormText name="phone" label="手机号" placeholder="请输入手机号" />
        <ProFormText name="email" label="邮箱" placeholder="请输入邮箱" />
        <ProFormSelect name="deptId" label="部门" options={departments} placeholder="请选择部门" />
        <ProFormSelect
          name="role"
          label="角色"
          options={[
            { label: '管理员', value: 'ADMIN' },
            { label: '普通员工', value: 'EMPLOYEE' },
          ]}
          placeholder="请选择角色"
          rules={[{ required: true }]}
        />
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
