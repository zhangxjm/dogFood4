import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PublishPage from './pages/PublishPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ChatRoomPage from './pages/ChatRoomPage'
import OrderPage from './pages/OrderPage'
import OrderDetailPage from './pages/OrderDetailPage'
import FavoritesPage from './pages/FavoritesPage'
import MyProductsPage from './pages/MyProductsPage'
import VerifyPage from './pages/VerifyPage'
import ZoneProductsPage from './pages/ZoneProductsPage'
import { useUserStore, useAppStore } from './store/userStore'

function Tabbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { unreadCount } = useAppStore()

  const tabs = [
    { path: '/', name: 'home', label: '首页', icon: '🏠' },
    { path: '/publish', name: 'publish', label: '发布', icon: '➕' },
    { path: '/chat', name: 'chat', label: '消息', icon: '💬' },
    { path: '/profile', name: 'profile', label: '我的', icon: '👤' },
  ]

  const showTabbar = ['/', '/publish', '/chat', '/profile'].includes(location.pathname)

  if (!showTabbar) return null

  return (
    <div className="tabbar">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path
        return (
          <div
            key={tab.name}
            className={`tabbar-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <span className="tabbar-icon">{tab.icon}</span>
            <span>
              {tab.name === 'chat' && unreadCount > 0 ? (
                <>
                  {tab.label}
                  <span className="badge">{unreadCount}</span>
                </>
              ) : (
                tab.label
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUserStore()

  return (
    <div style={{ minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/publish" element={user ? <PublishPage /> : <Navigate to="/login" />} />
        <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/chat/:id" element={user ? <ChatRoomPage /> : <Navigate to="/login" />} />
        <Route path="/orders" element={user ? <OrderPage /> : <Navigate to="/login" />} />
        <Route path="/order/:id" element={user ? <OrderDetailPage /> : <Navigate to="/login" />} />
        <Route path="/favorites" element={user ? <FavoritesPage /> : <Navigate to="/login" />} />
        <Route path="/my-products" element={user ? <MyProductsPage /> : <Navigate to="/login" />} />
        <Route path="/verify" element={user ? <VerifyPage /> : <Navigate to="/login" />} />
        <Route path="/zone-products" element={<ZoneProductsPage />} />
      </Routes>
      <Tabbar />
    </div>
  )
}

export default function App() {
  return <Layout />
}
