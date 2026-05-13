import { useEffect, useState } from "react";
import {
  List,
  Tag,
  Button,
  Card,
  Typography,
  Space,
  Badge,
  message,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import MainLayout from "../components/MainLayout";
import { messageApi } from "../utils/api";
import dayjs from "dayjs";

const { Title } = Typography;

export default function MessagesPage() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [markingAll, setMarkingAll] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const isRead = filter === "unread" ? false : undefined;
      const { data } = await messageApi.getMessages(isRead);
      setMessages(data || []);
    } catch (error) {
      console.error("获取消息失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const getTypeTag = (type: string) => {
    const typeMap: any = {
      approval: { color: "blue", text: "审批通知" },
      notification: { color: "green", text: "系统通知" },
      system: { color: "orange", text: "系统消息" },
    };
    const t = typeMap[type] || { color: "default", text: type };
    return <Tag color={t.color}>{t.text}</Tag>;
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await messageApi.markAsRead(id);
      message.success("已标记为已读");
      fetchData();
    } catch (error) {
      message.error("操作失败");
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await messageApi.markAllAsRead();
      message.success("已全部标记为已读");
      fetchData();
    } catch (error) {
      message.error("操作失败");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <MainLayout activeKey="/messages">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          消息中心
        </Title>
        <Space>
          <Button.Group>
            <Button
              type={filter === "all" ? "primary" : "default"}
              onClick={() => setFilter("all")}
            >
              全部
            </Button>
            <Button
              type={filter === "unread" ? "primary" : "default"}
              onClick={() => setFilter("unread")}
            >
              未读
            </Button>
          </Button.Group>
          <Button
            icon={<CheckCircleTwoTone />}
            onClick={handleMarkAllAsRead}
            loading={markingAll}
          >
            全部已读
          </Button>
        </Space>
      </div>

      <Card>
        <List
          dataSource={messages}
          loading={loading}
          locale={{ emptyText: "暂无消息" }}
          renderItem={(item: any) => (
            <List.Item
              actions={[
                !item.isRead && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => handleMarkAsRead(item._id)}
                  >
                    标为已读
                  </Button>
                ),
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={!item.isRead}>
                    <BellOutlined
                      style={{
                        fontSize: 24,
                        color: item.isRead ? "#ccc" : "#1890ff",
                      }}
                    />
                  </Badge>
                }
                title={
                  <Space>
                    <span
                      style={{ fontWeight: item.isRead ? "normal" : "bold" }}
                    >
                      {item.title}
                    </span>
                    {getTypeTag(item.type)}
                    {!item.isRead && <Tag color="red">新消息</Tag>}
                  </Space>
                }
                description={
                  <>
                    <div>{item.content}</div>
                    <div style={{ color: "#999", fontSize: 12, marginTop: 4 }}>
                      {dayjs(item.createdAt).format("YYYY-MM-DD HH:mm")}
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </MainLayout>
  );
}
