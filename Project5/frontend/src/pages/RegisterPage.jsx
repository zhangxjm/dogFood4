import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../utils/api'
import { useUserStore } from '../store/userStore'
import { Navbar, useToast } from '../components/common'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useUserStore()
  const { show, Toast } = useToast()
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    school: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || form.username.length < 3) {
      show('用户名至少3个字符')
      return
    }
    if (!form.password || form.password.length < 6) {
      show('密码至少6个字符')
      return
    }
    if (form.password !== form.confirmPassword) {
      show('两次密码不一致')
      return
    }

    setLoading(true)
    try {
      const data = await authAPI.register({
        username: form.username,
        password: form.password,
        nickname: form.nickname || form.username,
        school: form.school,
      })
      login(data.access_token, data.user)
      show('注册成功')
      setTimeout(() => navigate('/'), 500)
    } catch (err) {
      console.error(err)
      show('注册失败，用户名可能已存在')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar title="注册" onBack={() => navigate(-1)} />
      <div>
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
                placeholder="请输入密码（至少6位）"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="form-item">
              <label className="form-label">确认密码</label>
              <input
                className="form-input"
                type="password"
                placeholder="请再次输入密码"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>
            <div className="form-item">
              <label className="form-label">昵称</label>
              <input
                className="form-input"
                type="text"
                placeholder="请输入昵称（选填）"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              />
            </div>
            <div className="form-item">
              <label className="form-label">学校</label>
              <input
                className="form-input"
                type="text"
                placeholder="请输入学校名称（选填）"
                value={form.school}
                onChange={(e) => setForm({ ...form, school: e.target.value })}
              />
            </div>
          </div>

          <div style={{ padding: '20px' }}>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? '注册中...' : '注册'}
            </button>
          </div>
        </form>

        <div className="login-link">
          已有账号？
          <Link to="/login">立即登录</Link>
        </div>
      </div>
      <Toast />
    </div>
  )
}
