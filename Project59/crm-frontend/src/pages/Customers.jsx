import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'

const { Option } = Select

function Customers() {
  const [customers, setCustomers] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const res = await axios.get('/api/customers')
      setCustomers(res.data)
    } catch (error) {
      message.error('加载客户数据失败')
    }
  }

  const handleAdd = () => {
    setEditingCustomer(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    form.setFieldsValue({
      ...customer,
      nextFollowUp: customer.nextFollowUp ? dayjs(customer.nextFollowUp) : null
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/customers/${id}`)
      message.success('删除成功')
      loadCustomers()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()

      if (editingCustomer) {
        await axios.put(`/api/customers/${editingCustomer.id}`, values)
        message.success('更新成功')
      } else {
        await axios.post('/api/customers', values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadCustomers()
    } catch (error) {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '客户名称', dataIndex: 'name', key: 'name' },
    { title: '公司', dataIndex: 'company', key: 'company' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '来源', dataIndex: 'source', key: 'source' },
    { title: '级别', dataIndex: 'level', key: 'level' },
    {
      title: '下次跟进时间',
      dataIndex: 'nextFollowUp',
      key: 'nextFollowUp',
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-'
    },
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
        <h2>客户管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增客户
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={customers}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCustomer ? '编辑客户' : '新增客户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="客户名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="company" label="公司">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Option value="潜在客户">潜在客户</Option>
              <Option value="意向客户">意向客户</Option>
              <Option value="成交客户">成交客户</Option>
              <Option value="流失客户">流失客户</Option>
            </Select>
          </Form.Item>
          <Form.Item name="source" label="来源">
            <Select>
              <Option value="电话咨询">电话咨询</Option>
              <Option value="网络推广">网络推广</Option>
              <Option value="客户转介绍">客户转介绍</Option>
              <Option value="展会">展会</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item name="level" label="级别">
            <Select>
              <Option value="A">A类</Option>
              <Option value="B">B类</Option>
              <Option value="C">C类</Option>
              <Option value="D">D类</Option>
            </Select>
          </Form.Item>
          <Form.Item name="nextFollowUp" label="下次跟进时间">
            <Input type="datetime-local" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Customers
