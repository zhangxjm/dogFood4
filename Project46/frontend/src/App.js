import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  DashboardOutlined,
  CustomerServiceOutlined,
  TeamOutlined,
  CalendarOutlined,
  StarOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Services from './components/Services';
import Workers from './components/Workers';
import Bookings from './components/Bookings';
import Reviews from './components/Reviews';
import Statistics from './components/Statistics';

const { Header, Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: '控制台' },
    { key: '/services', icon: <CustomerServiceOutlined />, label: '服务项目' },
    { key: '/workers', icon: <TeamOutlined />, label: '服务人员' },
    { key: '/bookings', icon: <CalendarOutlined />, label: '预约管理' },
    { key: '/reviews', icon: <StarOutlined />, label: '评价管理' },
    { key: '/statistics', icon: <BarChartOutlined />, label: '数据统计' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: collapsed ? 14 : 18, fontWeight: 'bold' }}>
          {collapsed ? '家政' : '家政服务平台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/']}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/services" element={<Services />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
