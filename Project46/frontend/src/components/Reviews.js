import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Rate, Space, Tag, message, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { reviewApi, bookingApi, workerApi, serviceApi } from '../api';
import dayjs from 'dayjs';

const { Option } = Select;
const { Item } = Form;
const { TextArea } = Input;

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [workerFilter, setWorkerFilter] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadReviews();
    loadCompletedBookings();
    loadWorkers();
    loadServices();
  }, [workerFilter]);

  const loadReviews = async () => {
    try {
      const res = await reviewApi.getAll(workerFilter);
      setReviews(res.data);
    } catch (error) {
      message.error('加载评价列表失败');
    }
  };

  const loadCompletedBookings = async () => {
    try {
      const res = await bookingApi.getAll('已完成');
      const reviewedBookingIds = (await reviewApi.getAll()).data.map(r => r.booking);
      setBookings(res.data.filter(b => !reviewedBookingIds.includes(b._id)));
    } catch (error) {
      message.error('加载预约列表失败');
    }
  };

  const loadWorkers = async () => {
    try {
      const res = await workerApi.getAll();
      setWorkers(res.data);
    } catch (error) {
      message.error('加载服务人员列表失败');
    }
  };

  const loadServices = async () => {
    try {
      const res = await serviceApi.getAll();
      setServices(res.data);
    } catch (error) {
      message.error('加载服务列表失败');
    }
  };

  const handleAdd = () => {
    setEditingReview(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingReview(record);
    form.setFieldsValue({
      rating: record.rating,
      comment: record.comment,
    });
    setModalVisible(true);
  };

  const handleView = (record) => {
    setSelectedReview(record);
    setDetailModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await reviewApi.delete(id);
      message.success('删除成功');
      loadReviews();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingReview) {
        await reviewApi.update(editingReview._id, values);
        message.success('更新成功');
      } else {
        await reviewApi.create(values);
        message.success('评价成功');
      }
      setModalVisible(false);
      loadReviews();
      loadCompletedBookings();
    } catch (error) {
      message.error(editingReview ? '更新失败' : '评价失败');
    }
  };

  const columns = [
    { title: '客户', dataIndex: 'customerName', key: 'customerName' },
    { title: '服务人员', dataIndex: ['worker', 'name'], key: 'worker' },
    { title: '服务项目', dataIndex: ['service', 'name'], key: 'service' },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <Rate disabled value={rating} />,
    },
    { title: '评价内容', dataIndex: 'comment', key: 'comment', ellipsis: true },
    {
      title: '评价时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增评价
        </Button>
        <Select
          style={{ width: 200 }}
          placeholder="按服务人员筛选"
          allowClear
          onChange={setWorkerFilter}
        >
          {workers.map(w => (
            <Option key={w._id} value={w._id}>{w.name}</Option>
          ))}
        </Select>
      </Space>

      <Table columns={columns} dataSource={reviews} rowKey="_id" />

      <Modal
        title={editingReview ? '编辑评价' : '新增评价'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical">
          {!editingReview && (
            <Item name="booking" label="选择已完成的预约" rules={[{ required: true, message: '请选择预约' }]}>
              <Select placeholder="选择预约">
                {bookings.map(b => (
                  <Option key={b._id} value={b._id}>
                    {b.customerName} - {b.service?.name} ({dayjs(b.date).format('YYYY-MM-DD')})
                  </Option>
                ))}
              </Select>
            </Item>
          )}
          <Item name="rating" label="评分" rules={[{ required: true, message: '请评分' }]}>
            <Rate />
          </Item>
          <Item name="comment" label="评价内容" rules={[{ required: true, message: '请输入评价内容' }]}>
            <TextArea rows={4} placeholder="请输入您的评价..." />
          </Item>
        </Form>
      </Modal>

      <Modal
        title="评价详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedReview && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="客户">{selectedReview.customerName}</Descriptions.Item>
            <Descriptions.Item label="服务人员">{selectedReview.worker?.name}</Descriptions.Item>
            <Descriptions.Item label="服务项目">{selectedReview.service?.name}</Descriptions.Item>
            <Descriptions.Item label="评分">
              <Rate disabled value={selectedReview.rating} />
            </Descriptions.Item>
            <Descriptions.Item label="评价内容">{selectedReview.comment}</Descriptions.Item>
            <Descriptions.Item label="评价时间">
              {dayjs(selectedReview.createdAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

export default Reviews;
