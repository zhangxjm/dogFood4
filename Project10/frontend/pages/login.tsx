import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { setCookie } from "cookies-next";
import { authApi } from "../utils/api";

const { Title } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authApi.getCurrentUser();
        router.push("/dashboard");
      } catch {}
    };
    checkAuth();
  }, [router]);

  const handleLogin = async (values: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      const { data } = await authApi.login(values.username, values.password);
      setCookie("token", data.token);
      setCookie("user", JSON.stringify(data.user));
      message.success("登录成功");
      router.push("/dashboard");
    } catch (error: any) {
      message.error(error.response?.data?.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
          OA 审批系统
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          initialValues={{ username: "admin", password: "admin123" }}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center", color: "#999", fontSize: 12 }}>
            测试账号: admin / admin123
          </div>
          <div
            style={{
              textAlign: "center",
              color: "#999",
              fontSize: 12,
              marginTop: 4,
            }}
          >
            员工: employee1 / 123456
          </div>
          <div
            style={{
              textAlign: "center",
              color: "#999",
              fontSize: 12,
              marginTop: 4,
            }}
          >
            经理: manager1 / 123456
          </div>
        </Form>
      </Card>
    </div>
  );
}
