import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'

const { Option } = Select

function Opportunities() {
  const [opportunities, setOpportunities] = useState([])
  const [customers, setCustomers] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState(null)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadOpportunities()
    loadCustomers()
  }, [])

  const loadOpportunities = async () => {
    try {
      const res = await axios.get('/api/opportunities')
      setOpportunities(res.data)
    } catch (error) {
      message.error('加载销售机会失败')
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
    setEditingOpportunity(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (opportunity) => {
    setEditingOpportunity(opportunity)
    form.setFieldsValue({
      ...opportunity,
      expectedCloseDate: opportunity.expectedCloseDate ? dayjs(opportunity.expectedCloseDate) : null
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/opportunities/${id}`)
      message.success('删除成功')
      loadOpportunities()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()

      if (editingOpportunity) {
        await axios.put(`/api/opportunities/${editingOpportunity.id}`, values)
        message.success('更新成功')
      } else {
        await axios.post('/api/opportunities', values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadOpportunities()
    } catch (error) {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '机会名称', dataIndex: 'name', key: 'name' },
    { title: '客户名称', dataIndex: 'customerName', key: 'customerName' },
    { title: '金额(元)', dataIndex: 'amount', key: 'amount' },
    { title: '阶段', dataIndex: 'stage', key: 'stage' },
    { title: '成功率(%)', dataIndex: 'probability', key: 'probability' },
    {
      title: '预计成交日期',
      dataIndex: 'expectedCloseDate',
      key: 'expectedCloseDate',
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
        <h2>销售机会</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增机会
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={opportunities}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingOpportunity ? '编辑销售机会' : '新增销售机会'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="customerId" label="选择客户" rules={[{ required: true }]}>
            <Select placeholder="请选择客户">
              {customers.map(customer => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="name" label="机会名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="金额">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="stage" label="阶段">
            <Select>
              <Option value="初步接触">初步接触</Option>
              <Option value="需求确认">需求确认</Option>
              <Option value="方案报价">方案报价</Option>
              <Option value="商务谈判">商务谈判</Option>
              <Option value="签约成交">签约成交</Option>
            </Select>
          </Form.Item>
          <Form.Item name="probability" label="成功率(%)">
            <InputNumber style={{ width: '100%' }} min={0} max={100} />
          </Form.Item>
          <Form.Item name="expectedCloseDate" label="预计成交日期">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Option value="进行中">进行中</Option>
              <Option value="已成交">已成交</Option>
              <Option value="已流失">已流失</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Opportunities
