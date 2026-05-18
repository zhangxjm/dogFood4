import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  message,
  Card,
  Descriptions,
  Checkbox,
  Image,
  Badge
} from 'antd';
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { certificationApi } from '../api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Item } = Form;

const STATUS_COLORS = {
  '待审核': 'orange',
  '审核通过': 'green',
  '审核不通过': 'red'
};

function CertificationAudit() {
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentWorker, setCurrentWorker] = useState(null);
  const [currentWorkerDetail, setCurrentWorkerDetail] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [auditing, setAuditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPendingAudits();
    loadAllCertifications();
  }, [statusFilter]);

  const loadPendingAudits = async () => {
    try {
      const res = await certificationApi.getPendingAudits();
      setPendingWorkers(res.data);
    } catch (error) {
      message.error('加载待审核列表失败');
    }
  };

  const loadAllCertifications = async () => {
    try {
      const res = await certificationApi.getAllCertifications(statusFilter);
      setAllWorkers(res.data);
    } catch (error) {
      message.error('加载全部列表失败');
    }
  };

  const handleViewDetail = async (worker) => {
    setCurrentWorker(worker);
    try {
      const res = await certificationApi.getWorkerCertifications(worker._id);
      setCurrentWorkerDetail(res.data);
      setSelectedDocuments(
        res.data.documents
          .filter(doc => doc.status === '待审核')
          .map(doc => doc._id)
      );
      setDetailModalVisible(true);
    } catch (error) {
      message.error('加载详情失败');
    }
  };

  const handleAudit = async (worker) => {
    setCurrentWorker(worker);
    try {
      const res = await certificationApi.getWorkerCertifications(worker._id);
      setCurrentWorkerDetail(res.data);
      setSelectedDocuments(
        res.data.documents
          .filter(doc => doc.status === '待审核')
          .map(doc => doc._id)
      );
      form.resetFields();
      setAuditModalVisible(true);
    } catch (error) {
      message.error('加载详情失败');
    }
  };

  const handleAuditSubmit = async (values) => {
    try {
      setAuditing(true);
      await certificationApi.auditCertification(currentWorker._id, {
        status: values.status,
        comment: values.comment,
        documentIds: selectedDocuments
      });
      message.success('审核完成');
      setAuditModalVisible(false);
      loadPendingAudits();
      loadAllCertifications();
    } catch (error) {
      message.error('审核失败');
    } finally {
      setAuditing(false);
    }
  };

  const pendingColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '认证状态',
      dataIndex: 'verificationStatus',
      key: 'verificationStatus',
      render: (status) => <Tag color={STATUS_COLORS[status]}>{status}</Tag>
    },
    {
      title: '文件总数',
      dataIndex: 'documentCount',
      key: 'documentCount'
    },
    {
      title: '待审核文件',
      dataIndex: 'pendingDocumentCount',
      key: 'pendingDocumentCount',
      render: (count) => <Badge count={count} style={{ backgroundColor: '#faad14' }} />
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => handleAudit(record)}
          >
            审核
          </Button>
        </Space>
      )
    }
  ];

  const allColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '认证状态',
      dataIndex: 'verificationStatus',
      key: 'verificationStatus',
      render: (status) => <Tag color={STATUS_COLORS[status] || 'default'}>{status || '未认证'}</Tag>
    },
    {
      title: '接单权限',
      dataIndex: 'canReceiveOrders',
      key: 'canReceiveOrders',
      render: (can) => can ? <Tag color="green">可接单</Tag> : <Tag color="red">不可接单</Tag>
    },
    {
      title: '文件数',
      key: 'documentCount',
      render: (_, record) => record.certificationDocuments?.length || 0
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          查看
        </Button>
      )
    }
  ];

  const documentColumns = [
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
      title: '预览',
      key: 'preview',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => window.open(record.fileUrl, '_blank')}
        >
          打开
        </Button>
      )
    }
  ];

  return (
    <div>
      <Card title="待审核认证" style={{ marginBottom: 16 }}>
        <Table
          columns={pendingColumns}
          dataSource={pendingWorkers}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Card
        title="全部认证"
        extra={
          <Select
            style={{ width: 150 }}
            placeholder="状态筛选"
            allowClear
            onChange={setStatusFilter}
            value={statusFilter}
          >
            <Select.Option value="未认证">未认证</Select.Option>
            <Select.Option value="待审核">待审核</Select.Option>
            <Select.Option value="审核通过">审核通过</Select.Option>
            <Select.Option value="审核不通过">审核不通过</Select.Option>
          </Select>
        }
      >
        <Table
          columns={allColumns}
          dataSource={allWorkers}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="审核详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
      >
        {currentWorkerDetail && (
          <div>
            <Descriptions column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="认证状态">
                <Tag color={STATUS_COLORS[currentWorkerDetail.verificationStatus] || 'default'}>
                  {currentWorkerDetail.verificationStatus || '未认证'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="接单权限">
                {currentWorkerDetail.canReceiveOrders ? (
                  <Tag color="green">可接单</Tag>
                ) : (
                  <Tag color="red">不可接单</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
            <h4>资质文件</h4>
            <Table
              columns={documentColumns}
              dataSource={currentWorkerDetail.documents || []}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>

      <Modal
        title="资质审核"
        open={auditModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setAuditModalVisible(false)}
        confirmLoading={auditing}
        width={900}
      >
        {currentWorkerDetail && (
          <div>
            <Descriptions column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="姓名">{currentWorker?.name}</Descriptions.Item>
              <Descriptions.Item label="电话">{currentWorker?.phone}</Descriptions.Item>
            </Descriptions>

            <h4>待审核文件</h4>
            <Card style={{ marginBottom: 16 }}>
              <Checkbox.Group
                value={selectedDocuments}
                onChange={setSelectedDocuments}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {currentWorkerDetail.documents
                    .filter(doc => doc.status === '待审核')
                    .map(doc => (
                      <Checkbox key={doc._id} value={doc._id} style={{ marginBottom: 8 }}>
                        <Space>
                          <Tag>{doc.type}</Tag>
                          <span>{doc.name}</span>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => window.open(doc.fileUrl, '_blank')}
                          >
                            预览
                          </Button>
                        </Space>
                      </Checkbox>
                    ))}
                </Space>
              </Checkbox.Group>
            </Card>

            <Form form={form} layout="vertical" onFinish={handleAuditSubmit}>
              <Item
                name="status"
                label="审核结果"
                rules={[{ required: true, message: '请选择审核结果' }]}
              >
                <Select placeholder="请选择审核结果">
                  <Select.Option value="审核通过">
                    <Space>
                      <CheckOutlined style={{ color: '#52c41a' }} />
                      审核通过
                    </Space>
                  </Select.Option>
                  <Select.Option value="审核不通过">
                    <Space>
                      <CloseOutlined style={{ color: '#ff4d4f' }} />
                      审核不通过
                    </Space>
                  </Select.Option>
                </Select>
              </Item>
              <Item
                name="comment"
                label="审核意见"
              >
                <TextArea rows={4} placeholder="请输入审核意见（可选）" />
              </Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CertificationAudit;
