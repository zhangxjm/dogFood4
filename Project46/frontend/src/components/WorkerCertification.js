import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  DatePicker,
  Space,
  Tag,
  message,
  Card,
  Descriptions,
  Timeline,
  Image
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { certificationApi, workerApi } from '../api';
import dayjs from 'dayjs';

const { Option } = Select;
const { Item } = Form;

const STATUS_COLORS = {
  '待审核': 'orange',
  '审核通过': 'green',
  '审核不通过': 'red'
};

const DOCUMENT_TYPES = ['身份证', '健康证', '技能证书', '其他'];

function WorkerCertification({ workerId, onBack }) {
  const [worker, setWorker] = useState(null);
  const [certificationData, setCertificationData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (workerId) {
      loadWorkerData();
      loadCertificationData();
    }
  }, [workerId]);

  const loadWorkerData = async () => {
    try {
      const res = await workerApi.getById(workerId);
      setWorker(res.data);
    } catch (error) {
      message.error('加载服务人员信息失败');
    }
  };

  const loadCertificationData = async () => {
    try {
      const res = await certificationApi.getWorkerCertifications(workerId);
      setCertificationData(res.data);
    } catch (error) {
      message.error('加载资质信息失败');
    }
  };

  const handleUpload = async (values) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('type', values.type);
      formData.append('name', values.name);
      if (values.expiryDate) {
        formData.append('expiryDate', values.expiryDate.format('YYYY-MM-DD'));
      }
      if (values.document && values.document[0] && values.document[0].originFileObj) {
        formData.append('document', values.document[0].originFileObj);
      }

      await certificationApi.uploadDocument(workerId, formData);
      message.success('文件上传成功');
      setModalVisible(false);
      form.resetFields();
      loadCertificationData();
    } catch (error) {
      message.error(error.response?.data?.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await certificationApi.deleteDocument(workerId, documentId);
      message.success('删除成功');
      loadCertificationData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handlePreview = (document) => {
    setPreviewDocument(document);
    setPreviewVisible(true);
  };

  const columns = [
    {
      title: '文件类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag>{type}</Tag>
    },
    {
      title: '文件名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName'
    },
    {
      title: '有效期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
    },
    {
      title: '上传时间',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={STATUS_COLORS[status]}>{status}</Tag>
    },
    {
      title: '审核意见',
      dataIndex: 'auditComment',
      key: 'auditComment',
      render: (comment) => comment || '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          >
            预览
          </Button>
          {record.status === '待审核' && (
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteDocument(record._id)}
            >
              删除
            </Button>
          )}
        </Space>
      )
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case '审核通过':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />;
      case '审核不通过':
        return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />;
      case '待审核':
        return <ClockCircleOutlined style={{ color: '#faad14', fontSize: 24 }} />;
      default:
        return <FileTextOutlined style={{ fontSize: 24 }} />;
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        {onBack && (
          <Button onClick={onBack}>返回</Button>
        )}
      </Space>

      {worker && (
        <Card style={{ marginBottom: 16 }}>
          <Descriptions title="服务人员信息" column={3}>
            <Descriptions.Item label="姓名">{worker.name}</Descriptions.Item>
            <Descriptions.Item label="电话">{worker.phone}</Descriptions.Item>
            <Descriptions.Item label="认证状态">
              <Tag color={STATUS_COLORS[certificationData?.verificationStatus] || 'default'}>
                {certificationData?.verificationStatus || '未认证'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="接单权限">
              {certificationData?.canReceiveOrders ? (
                <Tag color="green">可接单</Tag>
              ) : (
                <Tag color="red">不可接单</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="上传文件数">
              {certificationData?.documents?.length || 0} 个
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card
        title="资质文件列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            上传文件
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={certificationData?.documents || []}
          rowKey="_id"
          pagination={false}
        />
      </Card>

      {certificationData?.auditHistory && certificationData.auditHistory.length > 0 && (
        <Card title="审核历史" style={{ marginTop: 16 }}>
          <Timeline>
            {certificationData.auditHistory.map((item, index) => (
              <Timeline.Item key={index}>
                <p><strong>{item.action}</strong></p>
                <p style={{ color: '#666' }}>{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}</p>
                {item.comment && <p>{item.comment}</p>}
                {item.status && <Tag color={STATUS_COLORS[item.status]}>{item.status}</Tag>}
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      <Modal
        title="上传资质文件"
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        confirmLoading={uploading}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleUpload}>
          <Item
            name="type"
            label="文件类型"
            rules={[{ required: true, message: '请选择文件类型' }]}
          >
            <Select placeholder="请选择文件类型">
              {DOCUMENT_TYPES.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Item>
          <Item
            name="name"
            label="文件名称"
            rules={[{ required: true, message: '请输入文件名称' }]}
          >
            <Input placeholder="例如：身份证正面、健康证2024等" />
          </Item>
          <Item
            name="document"
            label="上传文件"
            rules={[{ required: true, message: '请选择文件' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload
              beforeUpload={() => false}
              accept=".jpg,.jpeg,.png,.pdf"
              listType="text"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>选择文件 (JPG/PNG/PDF，最大10MB)</Button>
            </Upload>
          </Item>
          <Item
            name="expiryDate"
            label="有效期（可选）"
          >
            <DatePicker style={{ width: '100%' }} placeholder="选择有效期" />
          </Item>
        </Form>
      </Modal>

      <Modal
        title="文件预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {previewDocument && (
          <div style={{ textAlign: 'center' }}>
            <p><strong>{previewDocument.name}</strong></p>
            {previewDocument.fileUrl && (
              previewDocument.fileUrl.endsWith('.pdf') ? (
                <iframe
                  src={previewDocument.fileUrl}
                  style={{ width: '100%', height: 500, border: 'none' }}
                  title="PDF Preview"
                />
              ) : (
                <Image
                  src={previewDocument.fileUrl}
                  alt={previewDocument.name}
                  style={{ maxWidth: '100%', maxHeight: 500 }}
                />
              )
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default WorkerCertification;
