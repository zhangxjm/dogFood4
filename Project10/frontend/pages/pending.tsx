import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  message,
  Typography,
} from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import MainLayout from "../components/MainLayout";
import { processApi } from "../utils/api";
import dayjs from "dayjs";

const { Title } = Typography;
const { TextArea } = Input;

export default function PendingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: resData } = await processApi.getMyPending();
      setData(resData || []);
    } catch (error: any) {
      message.error("获取待办失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = () => {
    setApproveModalVisible(true);
  };

  const handleReject = () => {
    setRejectModalVisible(true);
  };

  const confirmApprove = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      await processApi.approveTask(selectedItem._id, {
        action: "approve",
        comment: comment || "通过审批",
      });
      message.success("审批通过");
      setApproveModalVisible(false);
      setComment("");
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || "操作失败");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      await processApi.approveTask(selectedItem._id, {
        action: "reject",
        comment: comment || "审批驳回",
      });
      message.success("已驳回");
      setRejectModalVisible(false);
      setComment("");
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || "操作失败");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <a onClick={() => router.push(`/process-detail/${record._id}`)}>
          {text}
        </a>
      ),
    },
    {
      title: "流程类型",
      dataIndex: "processDefinitionName",
      key: "processDefinitionName",
    },
    {
      title: "发起人",
      dataIndex: "initiatorName",
      key: "initiatorName",
    },
    {
      title: "发起时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color="blue">审批中</Tag>,
    },
    {
      title: "操作",
      key: "action",
      render: (_, record: any) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => {
              setSelectedItem(record);
              setComment("");
              handleApprove();
            }}
          >
            通过
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            onClick={() => {
              setSelectedItem(record);
              setComment("");
              handleReject();
            }}
          >
            驳回
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/process-detail/${record._id}`)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout activeKey="/pending">
      <Title level={3}>待办事项</Title>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={loading}
        locale={{ emptyText: "暂无待办事项" }}
      />

      <Modal
        title="审批通过"
        open={approveModalVisible}
        onOk={confirmApprove}
        onCancel={() => setApproveModalVisible(false)}
        confirmLoading={actionLoading}
        okText="确认通过"
        cancelText="取消"
      >
        <p>确定要通过此审批吗？</p>
        <TextArea
          rows={4}
          placeholder="请输入审批意见（可选）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ marginTop: 16 }}
        />
      </Modal>

      <Modal
        title="审批驳回"
        open={rejectModalVisible}
        onOk={confirmReject}
        onCancel={() => setRejectModalVisible(false)}
        confirmLoading={actionLoading}
        okText="确认驳回"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确定要驳回此审批吗？</p>
        <TextArea
          rows={4}
          placeholder="请输入驳回原因"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ marginTop: 16 }}
        />
      </Modal>
    </MainLayout>
  );
}
