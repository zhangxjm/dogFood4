import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Card,
  Descriptions,
  Tag,
  Timeline,
  Button,
  Modal,
  Input,
  message,
  Typography,
  Space,
  Divider,
  List,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import MainLayout from "../components/MainLayout";
import { processApi } from "../utils/api";
import dayjs from "dayjs";
import { getCookie } from "cookies-next";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ProcessDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const userStr = getCookie("user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr as string));
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const { data } = await processApi.getProcessDetail(id as string);
      setDetail(data);
    } catch (error: any) {
      message.error("获取详情失败");
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: any = {
      pending: { color: "orange", text: "待提交" },
      running: { color: "blue", text: "审批中" },
      approved: { color: "green", text: "已通过" },
      rejected: { color: "red", text: "已驳回" },
      canceled: { color: "default", text: "已取消" },
    };
    const s = statusMap[status] || { color: "default", text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const canApprove = () => {
    if (!detail?.instance || !currentUser) return false;
    if (detail.instance.status !== "running") return false;
    return detail.instance.currentAssignees?.some(
      (a: string) => a === currentUser.id || a._id === currentUser.id,
    );
  };

  const handleApprove = () => {
    setComment("");
    setApproveModalVisible(true);
  };

  const handleReject = () => {
    setComment("");
    setRejectModalVisible(true);
  };

  const confirmApprove = async () => {
    setActionLoading(true);
    try {
      await processApi.approveTask(id as string, {
        action: "approve",
        comment: comment || "通过审批",
      });
      message.success("审批通过");
      setApproveModalVisible(false);
      fetchDetail();
    } catch (error: any) {
      message.error(error.response?.data?.message || "操作失败");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    setActionLoading(true);
    try {
      await processApi.approveTask(id as string, {
        action: "reject",
        comment: comment || "审批驳回",
      });
      message.success("已驳回");
      setRejectModalVisible(false);
      fetchDetail();
    } catch (error: any) {
      message.error(error.response?.data?.message || "操作失败");
    } finally {
      setActionLoading(false);
    }
  };

  const renderFormData = (formData: any) => {
    if (!formData) return null;
    const items = Object.entries(formData).map(
      ([key, value]: [string, any]) => ({
        label: key,
        children: value !== undefined && value !== null ? String(value) : "-",
      }),
    );
    return <Descriptions column={2} bordered size="small" items={items} />;
  };

  const renderFlowChart = () => {
    if (!detail?.definition?.nodes) return null;
    const nodes = detail.definition.nodes;
    const currentNodeId = detail.instance?.currentNodeId;
    const taskHistory = detail.instance?.taskHistory || [];

    return (
      <div
        style={{
          background: "#f5f5f5",
          padding: 24,
          borderRadius: 8,
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 600,
          }}
        >
          {nodes.map((node: any, idx: number) => {
            const isCurrentNode = node.id === currentNodeId;
            const completedTasks = taskHistory.filter(
              (t: any) =>
                t.nodeId === node.id &&
                (t.status === "approved" ||
                  t.status === "rejected" ||
                  t.status === "completed"),
            );
            const isCompleted = completedTasks.length > 0;

            let nodeClass = "flow-node-approve";
            if (node.type === "start") nodeClass = "flow-node-start";
            if (node.type === "end") nodeClass = "flow-node-end";

            const borderStyle = isCurrentNode
              ? { border: "3px solid #fa8c16" }
              : {};
            const opacityStyle = isCompleted
              ? { opacity: 1 }
              : !isCurrentNode && node.type !== "start"
                ? { opacity: 0.5 }
                : {};

            return (
              <div
                key={node.id}
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  className={`flow-node ${nodeClass}`}
                  style={{
                    position: "relative",
                    minWidth: 120,
                    ...borderStyle,
                    ...opacityStyle,
                  }}
                >
                  <div>{node.name}</div>
                  {isCurrentNode && (
                    <Tag
                      color="orange"
                      style={{ position: "absolute", top: -10, right: -10 }}
                    >
                      当前
                    </Tag>
                  )}
                  {isCompleted && (
                    <Tag
                      color="green"
                      style={{ position: "absolute", top: -10, right: -10 }}
                    >
                      已处理
                    </Tag>
                  )}
                </div>
                {idx < nodes.length - 1 && (
                  <span
                    style={{ margin: "0 16px", fontSize: 20, color: "#999" }}
                  >
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!detail) {
    return (
      <MainLayout activeKey="/my-processes">
        <div>加载中...</div>
      </MainLayout>
    );
  }

  const { instance, definition } = detail;

  return (
    <MainLayout activeKey={canApprove() ? "/pending" : "/my-processes"}>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
        >
          返回
        </Button>
      </div>

      <Card loading={loading} style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            {instance.title}
          </Title>
          <Space>
            {getStatusTag(instance.status)}
            {canApprove() && (
              <>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleApprove}
                >
                  通过
                </Button>
                <Button danger icon={<CloseOutlined />} onClick={handleReject}>
                  驳回
                </Button>
              </>
            )}
          </Space>
        </div>

        <Divider />

        <Descriptions column={3} bordered style={{ marginBottom: 24 }}>
          <Descriptions.Item label="流程类型">
            {instance.processDefinitionName}
          </Descriptions.Item>
          <Descriptions.Item label="发起人">
            {instance.initiatorName}
          </Descriptions.Item>
          <Descriptions.Item label="发起时间">
            {dayjs(instance.createdAt).format("YYYY-MM-DD HH:mm")}
          </Descriptions.Item>
          {instance.completedAt && (
            <Descriptions.Item label="完成时间">
              {dayjs(instance.completedAt).format("YYYY-MM-DD HH:mm")}
            </Descriptions.Item>
          )}
          {instance.rejectedReason && (
            <Descriptions.Item label="驳回原因" span={2}>
              {instance.rejectedReason}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Title level={5}>审批流程图</Title>
        {renderFlowChart()}

        <Divider />

        <Title level={5}>申请内容</Title>
        {renderFormData(instance.formData)}

        {instance.attachments?.length > 0 && (
          <>
            <Divider />
            <Title level={5}>附件</Title>
            <List
              dataSource={instance.attachments}
              renderItem={(item: string) => (
                <List.Item>
                  <a href={item} target="_blank" rel="noopener noreferrer">
                    {item}
                  </a>
                </List.Item>
              )}
            />
          </>
        )}

        <Divider />

        <Title level={5}>审批记录</Title>
        <Timeline>
          <Timeline.Item color="green">
            <Text strong>发起申请</Text>
            <div>
              <Text type="secondary">{instance.initiatorName} 发起申请</Text>
              <div style={{ color: "#999", fontSize: 12 }}>
                {dayjs(instance.createdAt).format("YYYY-MM-DD HH:mm")}
              </div>
            </div>
          </Timeline.Item>
          {instance.taskHistory?.map((task: any, idx: number) => (
            <Timeline.Item
              key={task.id}
              color={
                task.status === "approved"
                  ? "green"
                  : task.status === "rejected"
                    ? "red"
                    : "blue"
              }
            >
              <Text strong>{task.nodeName}</Text>
              <div>
                <Text>审批人：{task.assigneeName}</Text>
                {task.action && (
                  <div style={{ marginTop: 4 }}>
                    <Tag color={task.action === "approve" ? "green" : "red"}>
                      {task.action === "approve" ? "通过" : "驳回"}
                    </Tag>
                    {task.comment && (
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        {task.comment}
                      </Text>
                    )}
                  </div>
                )}
                <div style={{ color: "#999", fontSize: 12, marginTop: 4 }}>
                  提交时间：{dayjs(task.createdAt).format("YYYY-MM-DD HH:mm")}
                  {task.completedAt && (
                    <span style={{ marginLeft: 16 }}>
                      处理时间：
                      {dayjs(task.completedAt).format("YYYY-MM-DD HH:mm")}
                    </span>
                  )}
                </div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

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
