import React from 'react'
import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  PhoneOutlined,
  DollarOutlined,
  FileTextOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'

const { Sider } = Layout

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '仪表盘'
  },
  {
    key: '/customers',
    icon: <UserOutlined />,
    label: '客户管理'
  },
  {
    key: '/followups',
    icon: <PhoneOutlined />,
    label: '跟进记录'
  },
  {
    key: '/opportunities',
    icon: <DollarOutlined />,
    label: '销售机会'
  },
  {
    key: '/contracts',
    icon: <FileTextOutlined />,
    label: '合同管理'
  },
  {
    key: '/statistics',
    icon: <BarChartOutlined />,
    label: '统计分析'
  }
]

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  return (
    <Sider theme="light" width={200}>
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
        CRM系统
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  )
}

export default Sidebar
