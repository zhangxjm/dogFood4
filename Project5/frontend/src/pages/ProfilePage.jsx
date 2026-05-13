import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { Navbar, useToast, Dialog } from '../components/common'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useUserStore()
  const { show, Toast } = useToast()
  const [showDialog, setShowDialog] = React.useState(false)

  const handleLogout = () => {
    setShowDialog(true)
  }

  const confirmLogout = () => {
    logout()
    setShowDialog(false)
    show('已退出登录')
    setTimeout(() => navigate('/login'), 500)
  }

  if (!user) {
    navigate('/login')
    return null
  }

  const menuItems = [
    { icon: '📦', label: '我的发布', path: '/my-products' },
    { icon: '❤️', label: '我的收藏', path: '/favorites' },
    { icon: '📋', label: '我的订单', path: '/orders' },
    { icon: '🎓', label: '学生认证', path: '/verify' },
  ]

  return (
    <div className="page-container">
      <Navbar title="我的" showBack={false} />

      <div className="profile-header">
        <div className="profile-avatar">
          {(user.nickname || user.username).charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <div className="profile-name">
            {user.nickname || user.username}
            {user.is_verified && (
              <span className="tag tag-success" style={{ marginLeft: '8px' }}>
                已认证
              </span>
            )}
          </div>
          <div className="profile-school">{user.school || '未填写学校'}</div>
        </div>
      </div>

      <div className="cell-group" style={{ marginTop: '12px' }}>
        {menuItems.map((item) => (
          <div
            key={item.path}
            className="cell"
            onClick={() => navigate(item.path)}
          >
            <span className="cell-title">
              <span style={{ marginRight: '8px' }}>{item.icon}</span>
              {item.label}
            </span>
            <span className="cell-value">›</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '20px' }}>
        <button
          className="btn btn-danger btn-block"
          onClick={handleLogout}
        >
          退出登录
        </button>
      </div>

      <Dialog
        title="退出登录"
        message="确定要退出登录吗？"
        visible={showDialog}
        onConfirm={confirmLogout}
        onCancel={() => setShowDialog(false)}
        confirmText="确定"
        cancelText="取消"
      />

      <Toast />
    </div>
  )
}
