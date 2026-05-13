import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Table, Tag, Button, Space, Typography, Select } from "antd";
import { EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import MainLayout from "../components/MainLayout";
import { processApi } from "../utils/api";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

export default function MyProcessesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchData = async (status?: string) => {
    setLoading(true);
    try {
      const { data: resData } = await processApi.getMyProcesses();
      let filtered = resData || [];
      if (status) {
        filtered = filtered.filter((p: any) => p.status === status);
      }
      setData(filtered);
    } catch (error) {
      console.error("获取申请列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      title: "当前状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "发起时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "完成时间",
      dataIndex: "completedAt",
      key: "completedAt",
      render: (date: string) =>
        date ? dayjs(date).format("YYYY-MM-DD HH:mm") : "-",
    },
    {
      title: "操作",
      key: "action",
      render: (_, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/process-detail/${record._id}`)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <MainLayout activeKey="/my-processes">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          我的申请
        </Title>
        <Space>
          <Select
            placeholder="筛选状态"
            style={{ width: 150 }}
            allowClear
            value={statusFilter || undefined}
            onChange={(val) => {
              setStatusFilter(val || "");
              fetchData(val);
            }}
          >
            <Option value="running">审批中</Option>
            <Option value="approved">已通过</Option>
            <Option value="rejected">已驳回</Option>
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchData(statusFilter)}
          >
            刷新
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={loading}
        locale={{ emptyText: "暂无申请记录" }}
      />
    </MainLayout>
  );
}
