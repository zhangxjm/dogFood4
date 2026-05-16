import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout, theme } from 'antd'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import FollowUps from './pages/FollowUps'
import Opportunities from './pages/Opportunities'
import Contracts from './pages/Contracts'
import Statistics from './pages/Statistics'

const { Content } = Layout

function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  return (
    <Layout style={{ height: '100vh' }}>
      <Sidebar />
      <Layout>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto'
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/followups" element={<FollowUps />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
