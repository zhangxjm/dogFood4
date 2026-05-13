import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography } from '@arco-design/web-react';

const Sider = Layout.Sider;
const Header = Layout.Header;
const Content = Layout.Content;
const MenuItem = Menu.Item;

function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { key: '/', label: '🏠 首页' },
    { key: '/books', label: '📚 图书管理' },
    { key: '/readers', label: '👥 读者管理' },
    { key: '/borrows', label: '📅 借阅管理' },
    { key: '/reservations', label: '⏰ 预约管理' },
    { key: '/stats', label: '📊 统计报表' },
    { key: '/admin', label: '⚙️ 系统管理' },
  ];

  const handleSelect = (key) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        style={{ background: '#001529' }}
      >
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Typography.Title
            heading={5}
            style={{ color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden' }}
          >
            {collapsed ? '📚' : '📚 图书馆管理系统'}
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          onClickMenuItem={handleSelect}
          style={{ width: '100%' }}
        >
          {menuItems.map((item) => (
            <MenuItem key={item.key}>
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
          }}
        >
          <Typography.Text>管理员</Typography.Text>
        </Header>
        <Content
          style={{
            padding: '24px',
            background: '#f0f2f5',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
