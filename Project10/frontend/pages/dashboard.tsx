import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, Row, Col, Statistic, List, Tag, Button, Typography } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import MainLayout from "../components/MainLayout";
import { processApi, authApi } from "../utils/api";
import dayjs from "dayjs";

const { Title } = Typography;

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [myProcesses, setMyProcesses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pendingRes, myRes] = await Promise.all([
          processApi.getMyPending(),
          processApi.getMyProcesses(),
        ]);
        setPendingCount(pendingRes.data?.length || 0);
        setMyProcesses(myRes.data?.slice(0, 5) || []);

        const processes = myRes.data || [];
        setStats({
          pending: processes.filter((p: any) => p.status === "running").length,
          approved: processes.filter((p: any) => p.status === "approved")
            .length,
          rejected: processes.filter((p: any) => p.status === "rejected")
            .length,
        });
      } catch (error) {
        console.log("Dashboard fetch error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusTag = (status: string) => {
    const statusMap: any = {
      pending: { color: "orange", text: "待提交" },
      running: { color: "blue", text: "审批中" },
      approved: { color: "green", text: "已通过" },
      rejected: { color: "red", text: "已驳回" },
    };
    const s = statusMap[status] || { color: "default", text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  return (
    <MainLayout activeKey="/dashboard">
      <Title level={3}>工作台</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card loading={loading}>
            <Statistic
              title="待办事项"
              value={pendingCount}
              prefix={<ClockCircleOutlined style={{ color: "#fa8c16" }} />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card loading={loading}>
            <Statistic
              title="已通过审批"
              value={stats.approved}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card loading={loading}>
            <Statistic
              title="已驳回"
              value={stats.rejected}
              prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card
            title="快速发起审批"
            extra={
              <Button type="link" onClick={() => router.push("/processes")}>
                全部流程 <ArrowRightOutlined />
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card
                  hoverable
                  onClick={() => router.push("/processes")}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <FileTextOutlined
                    style={{ fontSize: 32, color: "#1890ff", marginBottom: 8 }}
                  />
                  <div>请假申请</div>
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  hoverable
                  onClick={() => router.push("/processes")}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <FileTextOutlined
                    style={{ fontSize: 32, color: "#52c41a", marginBottom: 8 }}
                  />
                  <div>报销申请</div>
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  hoverable
                  onClick={() => router.push("/processes")}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <FileTextOutlined
                    style={{ fontSize: 32, color: "#722ed1", marginBottom: 8 }}
                  />
                  <div>出差申请</div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="我发起的申请"
            extra={
              <Button type="link" onClick={() => router.push("/my-processes")}>
                查看全部 <ArrowRightOutlined />
              </Button>
            }
          >
            <List
              dataSource={myProcesses}
              loading={loading}
              renderItem={(item: any) => (
                <List.Item actions={[getStatusTag(item.status)]}>
                  <List.Item.Meta
                    title={
                      <a
                        onClick={() =>
                          router.push(`/process-detail/${item._id}`)
                        }
                      >
                        {item.title}
                      </a>
                    }
                    description={`${item.processDefinitionName} · ${dayjs(item.createdAt).format("YYYY-MM-DD HH:mm")}`}
                  />
                </List.Item>
              )}
              locale={{ emptyText: "暂无申请记录" }}
            />
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
}
