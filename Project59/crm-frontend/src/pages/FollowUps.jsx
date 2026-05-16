import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'

const { Option } = Select

function FollowUps() {
  const [followUps, setFollowUps] = useState([])
  const [customers, setCustomers] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingFollowUp, setEditingFollowUp] = useState(null)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFollowUps()
    loadCustomers()
  }, [])

  const loadFollowUps = async () => {
    try {
      const res = await axios.get('/api/followups')
      setFollowUps(res.data)
    } catch (error) {
      message.error('加载跟进记录失败')
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
    setEditingFollowUp(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (followUp) => {
    setEditingFollowUp(followUp)
    form.setFieldsValue({
      ...followUp,
      followUpTime: followUp.followUpTime ? dayjs(followUp.followUpTime) : null
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/followups/${id}`)
      message.success('删除成功')
      loadFollowUps()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()

      if (editingFollowUp) {
        await axios.put(`/api/followups/${editingFollowUp.id}`, values)
        message.success('更新成功')
      } else {
        await axios.post('/api/followups', values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadFollowUps()
    } catch (error) {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '客户名称', dataIndex: 'customerName', key: 'customerName' },
    { title: '跟进类型', dataIndex: 'type', key: 'type' },
    { title: '跟进内容', dataIndex: 'content', key: 'content', ellipsis: true },
    {
      title: '跟进时间',
      dataIndex: 'followUpTime',
      key: 'followUpTime',
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-'
    },
    { title: '结果', dataIndex: 'result', key: 'result' },
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
        <h2>跟进记录</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增跟进
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={followUps}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingFollowUp ? '编辑跟进' : '新增跟进'}
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
          <Form.Item name="type" label="跟进类型">
            <Select>
              <Option value="电话">电话</Option>
              <Option value="邮件">邮件</Option>
              <Option value="拜访">拜访</Option>
              <Option value="微信">微信</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item name="content" label="跟进内容">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="followUpTime" label="跟进时间">
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item name="result" label="结果">
            <Input />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default FollowUps
