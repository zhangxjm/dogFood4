import React, { useEffect, useState, useRef } from 'react';
import {
  ProTable,
  ProFormText,
  ProFormSelect,
  ModalForm,
} from '@ant-design/pro-components';
import { Button, Tag, message, Popconfirm, Space, Modal, Form, Select, Input, DatePicker, InputNumber } from 'antd';
import { PlusOutlined, ExportOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import request from '../utils/request';
import { useUserStore } from '../store/userStore';

const statusMap = {
  STORED: { text: '在库', color: 'success' },
  IN_USE: { text: '使用中', color: 'processing' },
  SCRAPPED: { text: '报废', color: 'error' },
};

const operationMap = {
  OUT: '领用',
  RETURN: '归还',
  SCRAP: '报废',
};

export default function AssetList() {
  const [form] = Form.useForm();
  const [recordForm] = Form.useForm();
  const actionRef = useRef();
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchCategories();
    fetchDepartments();
    fetchUsers();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await request.get('/asset-categories');
      setCategories(res.data.map(item => ({ label: item.categoryName, value: item.id })));
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await request.get('/departments');
      setDepartments(res.data.map(item => ({ label: item.deptName, value: item.id })));
    } catch (error) {
      console.error('获取部门失败:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await request.get('/users/list');
      setUsers(res.data.map(item => ({ label: item.realName, value: item.id })));
    } catch (error) {
      console.error('获取用户失败:', error);
    }
  };

  const columns = [
    { title: '资产编号', dataIndex: 'assetCode', width: 150 },
    { title: '资产名称', dataIndex: 'assetName', width: 150 },
    {
      title: '分类',
      dataIndex: 'categoryId',
      width: 120,
      render: (_, record) => {
        const cat = categories.find(c => c.value === record.categoryId);
        return cat?.label || '-';
      },
    },
    { title: '品牌', dataIndex: 'brand', width: 100 },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true },
    {
      title: '购买价格',
      dataIndex: 'purchasePrice',
      width: 120,
      render: (val) => val ? `¥${val}` : '-',
    },
    {
      title: '当前价值',
      dataIndex: 'currentValue',
      width: 120,
      render: (val) => val ? `¥${val}` : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (val) => {
        const status = statusMap[val] || { text: val, color: 'default' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '操作',
      width: 280,
      valueType: 'option',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>详情</Button>
          {record.status === 'STORED' && (
            <Button type="link" size="small" onClick={() => handleReceive(record)}>领用</Button>
          )}
          {record.status === 'IN_USE' && (
            <Button type="link" size="small" onClick={() => handleReturn(record)}>归还</Button>
          )}
          {isAdmin && record.status !== 'SCRAPPED' && (
            <Button type="link" size="small" danger onClick={() => handleScrap(record)}>报废</Button>
          )}
          {isAdmin && (
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          )}
          {isAdmin && (
            <Popconfirm title="确认删除该资产吗？" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetail = async (record) => {
    try {
      const res = await request.get(`/assets/${record.id}`);
      setCurrentAsset(res.data);
      setDetailModalVisible(true);
      setRecordModalVisible(true);
    } catch (error) {
      console.error('获取资产详情失败:', error);
    }
  };

  const handleCreate = () => {
    form.resetFields();
    setCurrentAsset(null);
    setCreateModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
      purchaseDate: record.purchaseDate ? dayjs(record.purchaseDate) : null,
    });
    setCurrentAsset(record);
    setCreateModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await request.delete(`/assets/${id}`);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleReceive = (record) => {
    Modal.confirm({
      title: '领用资产',
      content: (
        <Form initialValues={{ targetUserId: user.id }} layout="vertical">
          <Form.Item name="targetUserId" label="领用人" rules={[{ required: true }]}>
            <Select options={users} placeholder="请选择领用人" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        const values = Modal.confirm._instance?.getFieldsValue?.() || { targetUserId: user.id };
        try {
          await request.post('/assets/receive', { assetId: record.id, ...values });
          message.success('领用成功');
          actionRef.current?.reload();
        } catch (error) {
          console.error('领用失败:', error);
        }
      },
    });
  };

  const handleReturn = (record) => {
    Modal.confirm({
      title: '归还资产',
      content: (
        <Form layout="vertical">
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          await request.post('/assets/return', { assetId: record.id });
          message.success('归还成功');
          actionRef.current?.reload();
        } catch (error) {
          console.error('归还失败:', error);
        }
      },
    });
  };

  const handleScrap = (record) => {
    Modal.confirm({
      title: '报废资产',
      content: (
        <Form layout="vertical">
          <Form.Item name="remark" label="报废原因">
            <Input.TextArea rows={3} placeholder="请输入报废原因" />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          await request.post('/assets/scrap', { assetId: record.id });
          message.success('报废成功');
          actionRef.current?.reload();
        } catch (error) {
          console.error('报废失败:', error);
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (currentAsset) {
        await request.put('/assets', { ...currentAsset, ...values, purchaseDate: values.purchaseDate?.format('YYYY-MM-DD') });
        message.success('更新成功');
      } else {
        await request.post('/assets', { ...values, purchaseDate: values.purchaseDate?.format('YYYY-MM-DD') });
        message.success('创建成功');
      }
      setCreateModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.location.href = '/api/assets/export';
  };

  return (
    <div>
      <ProTable
        headerTitle="资产管理"
        actionRef={actionRef}
        rowKey="id"
        search={{ defaultCollapsed: false }}
        toolBarRender={() => [
          isAdmin && <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新增资产</Button>,
          isAdmin && <Button key="export" icon={<ExportOutlined />} onClick={handleExport}>导出报表</Button>,
        ].filter(Boolean)}
        columns={columns}
        request={async (params) => {
          const res = await request.get('/assets', {
            params: {
              pageNum: params.current,
              pageSize: params.pageSize,
              keyword: params.keyword,
              categoryId: params.categoryId,
              deptId: params.deptId,
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
        title={currentAsset ? '编辑资产' : '新增资产'}
        open={createModalVisible}
        form={form}
        onOpenChange={setCreateModalVisible}
        onFinish={handleSubmit}
        submitTimeout={2000}
        modalProps={{ confirmLoading: loading, destroyOnClose: true }}
        layout="vertical"
        style={{ maxWidth: 700 }}
      >
        <ProFormText name="assetCode" label="资产编号" placeholder="请输入资产编号" rules={[{ required: true }]} />
        <ProFormText name="assetName" label="资产名称" placeholder="请输入资产名称" rules={[{ required: true }]} />
        <ProFormSelect name="categoryId" label="资产分类" options={categories} placeholder="请选择分类" rules={[{ required: true }]} />
        <ProFormText name="brand" label="品牌" placeholder="请输入品牌" />
        <ProFormText name="spec" label="规格型号" placeholder="请输入规格型号" />
        <ProFormText name="serialNumber" label="序列号" placeholder="请输入序列号" />
        <Form.Item name="purchaseDate" label="购买日期">
          <DatePicker style={{ width: '100%' }} placeholder="请选择购买日期" />
        </Form.Item>
        <Form.Item name="purchasePrice" label="购买价格">
          <InputNumber style={{ width: '100%' }} placeholder="请输入购买价格" min={0} precision={2} />
        </Form.Item>
        <ProFormSelect name="deptId" label="所属部门" options={departments} placeholder="请选择部门" />
        <ProFormSelect name="keeperId" label="保管人" options={users} placeholder="请选择保管人" />
        <ProFormText name="location" label="存放位置" placeholder="请输入存放位置" />
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={3} placeholder="请输入描述" />
        </Form.Item>
      </ModalForm>

      <Modal
        title="资产详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {currentAsset && (
          <div>
            <p><strong>资产编号：</strong>{currentAsset.assetCode}</p>
            <p><strong>资产名称：</strong>{currentAsset.assetName}</p>
            <p><strong>品牌：</strong>{currentAsset.brand || '-'}</p>
            <p><strong>规格型号：</strong>{currentAsset.spec || '-'}</p>
            <p><strong>购买价格：</strong>¥{currentAsset.purchasePrice || 0}</p>
            <p><strong>当前价值：</strong>¥{currentAsset.currentValue || 0}</p>
            <p><strong>累计折旧：</strong>¥{currentAsset.depreciationValue || 0}</p>
            <p><strong>状态：</strong>{statusMap[currentAsset.status]?.text}</p>
            <p><strong>存放位置：</strong>{currentAsset.location || '-'}</p>
            <p><strong>描述：</strong>{currentAsset.description || '-'}</p>
          </div>
        )}
      </Modal>

      <Modal
        title="操作记录"
        open={recordModalVisible}
        onCancel={() => setRecordModalVisible(false)}
        footer={null}
        width={700}
      >
        <ProTable
          rowKey="id"
          search={false}
          pagination={{ pageSize: 5 }}
          columns={[
            { title: '操作类型', dataIndex: 'operationType', render: (val) => operationMap[val] || val },
            { title: '操作时间', dataIndex: 'operationDate' },
            { title: '备注', dataIndex: 'remark' },
          ]}
          request={async (params) => {
            if (!currentAsset?.id) return { data: [], success: true };
            const res = await request.get('/assets/records', {
              params: { pageNum: params.current, pageSize: params.pageSize, assetId: currentAsset.id },
            });
            return { data: res.data.records, success: true, total: res.data.total };
          }}
        />
      </Modal>
    </div>
  );
}
