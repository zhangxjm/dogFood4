import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Input, Select, InputNumber, Button, message, Image, Upload, Space } from 'antd'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons'
import { guideAPI, categoryAPI } from '../services/api'
import { isAuthenticated } from '../utils/auth'

const { TextArea } = Input
const { Option } = Select

export default function CreateGuide() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState([])
  const [images, setImages] = useState([])
  const isEdit = !!id

  useEffect(() => {
    if (!isAuthenticated()) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    fetchCategories()
    if (isEdit) {
      fetchGuide()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getCategories()
      setCategories(res.data)
    } catch (error) {
      message.error('获取分类失败')
    }
  }

  const fetchGuide = async () => {
    try {
      const res = await guideAPI.getGuide(id)
      const guide = res.data
      form.setFieldsValue({
        title: guide.title,
        content: guide.content,
        location: guide.location,
        days: guide.days,
        budget: guide.budget,
        category_id: guide.category.id
      })
      setImages(guide.images.map(img => img.image_url))
    } catch (error) {
      message.error('获取攻略失败')
    }
  }

  const handleUpload = async (file) => {
    setUploading(true)
    try {
      const res = await guideAPI.uploadImages([file])
      setImages(prev => [...prev, ...res.data.urls])
    } catch (error) {
      message.error('上传失败')
    } finally {
      setUploading(false)
    }
    return false
  }

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const data = {
        ...values,
        images: images,
        cover_image: images[0] || ''
      }
      if (isEdit) {
        await guideAPI.updateGuide(id, data)
        message.success('更新成功')
      } else {
        await guideAPI.createGuide(data)
        message.success('发布成功')
      }
      navigate('/')
    } catch (error) {
      message.error(isEdit ? '更新失败' : '发布失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Card title={isEdit ? '编辑攻略' : '发布攻略'}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ days: 1, budget: 0 }}
        >
          <Form.Item
            name="title"
            label="攻略标题"
            rules={[{ required: true, message: '请输入攻略标题' }]}
          >
            <Input placeholder="请输入一个吸引人的标题" size="large" />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="选择分类" size="large">
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="图片上传">
            <div className="image-uploader">
              {images.map((img, index) => (
                <div key={index} className="uploaded-image">
                  <Image src={img} width={104} height={104} style={{ objectFit: 'cover' }} preview={false} />
                  <button
                    className="delete-btn"
                    onClick={() => handleRemoveImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {images.length < 10 && (
                <Upload
                  beforeUpload={handleUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <div className="upload-btn">
                    {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                  </div>
                </Upload>
              )}
            </div>
            <div style={{ marginTop: 8, color: '#999', fontSize: 14 }}>
              最多上传 10 张图片，第一张将作为封面
            </div>
          </Form.Item>

          <Form.Item name="location" label="目的地">
            <Input placeholder="例如：北京、上海、三亚" />
          </Form.Item>

          <Space size="large">
            <Form.Item name="days" label="游玩天数" style={{ marginBottom: 0 }}>
              <InputNumber min={1} max={30} placeholder="天数" />
            </Form.Item>
            <Form.Item name="budget" label="人均预算（元）" style={{ marginBottom: 0 }}>
              <InputNumber min={0} placeholder="预算" />
            </Form.Item>
          </Space>

          <Form.Item
            name="content"
            label="攻略内容"
            rules={[{ required: true, message: '请输入攻略内容' }]}
          >
            <TextArea
              rows={15}
              placeholder="详细描述你的旅行经历、行程安排、注意事项等，帮助其他旅行者..."
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              {isEdit ? '保存修改' : '发布攻略'}
            </Button>
            <Button style={{ marginLeft: 16 }} size="large" onClick={() => navigate(-1)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
