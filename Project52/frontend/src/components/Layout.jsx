import React, { useState, useEffect } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { HomeOutlined, PlusOutlined, UserOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons'
import { getUser, clearAuth, isAuthenticated } from '../utils/auth'

const { Header, Content } = Layout

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(getUser())
  }, [location])

  const handleLogout = () => {
    clearAuth()
    setUser(null)
    navigate('/login')
  }

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        个人中心
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  )

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
  ]

  if (isAuthenticated()) {
    menuItems.push({
      key: '/create',
      icon: <PlusOutlined />,
      label: '发布攻略'
    })
  }

  return (
    <Layout>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#fff',
        padding: '0 50px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <h2 style={{ margin: 0, color: '#1890ff', cursor: 'pointer' }} onClick={() => navigate('/')}>
            🌍 旅游攻略
          </h2>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ border: 'none' }}
          />
        </div>
        <div>
          {user ? (
            <Dropdown overlay={userMenu}>
              <Avatar style={{ cursor: 'pointer' }} icon={<UserOutlined />} />
            </Dropdown>
          ) : (
            <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
              登录
            </Button>
          )}
        </div>
      </Header>
      <Content style={{ padding: '24px 50px' }}>
        <Outlet />
      </Content>
    </Layout>
  )
}
