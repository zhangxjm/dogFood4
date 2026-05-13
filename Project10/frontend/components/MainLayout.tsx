import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout, Menu, Avatar, Dropdown, Badge, message } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  HistoryOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { getCookie, deleteCookie } from "cookies-next";
import { messageApi } from "../utils/api";

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
  activeKey?: string;
}

export default function MainLayout({
  children,
  activeKey = "/dashboard",
}: MainLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const userStr = getCookie("user");
    if (userStr) {
      setUser(JSON.parse(userStr as string));
    }

    const checkAuth = async () => {
      try {
        const { data } = await messageApi.getUnreadCount();
        setUnreadCount(data.count);
      } catch (error) {
        console.log("auth error");
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    deleteCookie("token");
    deleteCookie("user");
    message.success("已退出登录");
    router.push("/login");
  };

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "工作台",
      onClick: () => router.push("/dashboard"),
    },
    {
      key: "/pending",
      icon: <ClockCircleOutlined />,
      label: "待办事项",
      onClick: () => router.push("/pending"),
    },
    {
      key: "/processes",
      icon: <FileTextOutlined />,
      label: "发起审批",
      onClick: () => router.push("/processes"),
    },
    {
      key: "/my-processes",
      icon: <HistoryOutlined />,
      label: "我的申请",
      onClick: () => router.push("/my-processes"),
    },
    {
      key: "/messages",
      icon: (
        <Badge count={unreadCount}>
          <InboxOutlined />
        </Badge>
      ),
      label: "消息中心",
      onClick: () => router.push("/messages"),
    },
  ];

  const userMenu = [
    {
      key: "1",
      icon: <UserOutlined />,
      label: user?.name,
      disabled: true,
    },
    {
      key: "2",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: collapsed ? 14 : 20,
            fontWeight: "bold",
            background: "#002140",
          }}
        >
          {collapsed ? "OA" : "OA 审批系统"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <div
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Avatar icon={<UserOutlined />} />
              <span>{user?.name}</span>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: "24px",
            padding: "24px",
            background: "#fff",
            minHeight: "calc(100vh - 112px)",
            borderRadius: 8,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
