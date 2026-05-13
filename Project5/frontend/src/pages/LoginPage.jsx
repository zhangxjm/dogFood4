import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../utils/api'
import { useUserStore } from '../store/userStore'
import { Navbar, useToast, Loading } from '../components/common'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useUserStore()
  const { show, Toast } = useToast()
  const [form, setForm] = useState({
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username) {
      show('请输入用户名')
      return
    }
    if (!form.password) {
      show('请输入密码')
      return
    }

    setLoading(true)
    try {
      const data = await authAPI.login({
        username: form.username,
        password: form.password,
      })
      login(data.access_token, data.user)
      show('登录成功')
      setTimeout(() => navigate('/'), 500)
    } catch (err) {
      console.error(err)
      show('登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar title="登录" showBack={false} />
      <div>
        <div className="login-header">
          <div className="login-logo">🛒</div>
          <div className="login-title">校园二手闲置</div>
          <div className="login-subtitle">专为高校学生设计的闲置交易平台</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="form-item">
              <label className="form-label">用户名</label>
              <input
                className="form-input"
                type="text"
                placeholder="请输入用户名"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="form-item">
              <label className="form-label">密码</label>
              <input
                className="form-input"
                type="password"
                placeholder="请输入密码"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <div style={{ padding: '20px' }}>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </button>
          </div>
        </form>

        <div className="login-link">
          还没有账号？
          <Link to="/register">立即注册</Link>
        </div>

        <div className="login-tip">
          测试账号：student1 / 123456
        </div>
      </div>
      <Toast />
    </div>
  )
}
