import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'

const { Option } = Select

function Contracts() {
  const [contracts, setContracts] = useState([])
  const [customers, setCustomers] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingContract, setEditingContract] = useState(null)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadContracts()
    loadCustomers()
  }, [])

  const loadContracts = async () => {
    try {
      const res = await axios.get('/api/contracts')
      setContracts(res.data)
    } catch (error) {
      message.error('加载合同数据失败')
    }
  }

  const loadCustomers = async () => {
    try {
      const res = await axios.get('/api/customers')
      setCustomers(res.data)
    } catch (error) {
      message.error('加载客户数据失败')
    }
  }

  const handleAdd = () => {
    setEditingContract(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (contract) => {
    setEditingContract(contract)
    form.setFieldsValue({
      ...contract,
      signDate: contract.signDate ? dayjs(contract.signDate) : null,
      startDate: contract.startDate ? dayjs(contract.startDate) : null,
      endDate: contract.endDate ? dayjs(contract.endDate) : null
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/contracts/${id}`)
      message.success('删除成功')
      loadContracts()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()

      if (editingContract) {
        await axios.put(`/api/contracts/${editingContract.id}`, values)
        message.success('更新成功')
      } else {
        await axios.post('/api/contracts', values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadContracts()
    } catch (error) {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '合同编号', dataIndex: 'contractNo', key: 'contractNo' },
    { title: '合同名称', dataIndex: 'name', key: 'name' },
    { title: '客户名称', dataIndex: 'customerName', key: 'customerName' },
    { title: '金额(元)', dataIndex: 'amount', key: 'amount' },
    {
      title: '签订日期',
      dataIndex: 'signDate',
      key: 'signDate',
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD') : '-'
    },
    { title: '状态', dataIndex: 'status', key: 'status' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>合同管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增合同
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={contracts}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingContract ? '编辑合同' : '新增合同'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="contractNo" label="合同编号">
            <Input placeholder="不填则自动生成" />
          </Form.Item>
          <Form.Item name="customerId" label="选择客户" rules={[{ required: true }]}>
            <Select placeholder="请选择客户">
              {customers.map(customer => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="name" label="合同名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="合同金额">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="signDate" label="签订日期">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="startDate" label="开始日期">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="endDate" label="结束日期">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Option value="草稿">草稿</Option>
              <Option value="已签订">已签订</Option>
              <Option value="执行中">执行中</Option>
              <Option value="已完成">已完成</Option>
              <Option value="已终止">已终止</Option>
            </Select>
          </Form.Item>
          <Form.Item name="terms" label="合同条款">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Contracts
