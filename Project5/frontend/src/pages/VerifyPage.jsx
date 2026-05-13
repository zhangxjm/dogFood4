import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../utils/api'
import { useUserStore } from '../store/userStore'
import { Navbar, useToast, Loading } from '../components/common'

export default function VerifyPage() {
  const navigate = useNavigate()
  const { user, updateUser } = useUserStore()
  const { show, Toast } = useToast()
  const [form, setForm] = useState({
    student_id: '',
    real_name: '',
    school: user?.school || '',
  })
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [status, setStatus] = useState(null)

  const checkStatus = async () => {
    setChecking(true)
    try {
      const data = await authAPI.getVerifyStatus()
      setStatus(data)
      if (data) {
        setForm({
          student_id: data.student_id || '',
          real_name: data.real_name || '',
          school: data.school || user?.school || '',
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.student_id) {
      show('请输入学号')
      return
    }
    if (!form.real_name) {
      show('请输入真实姓名')
      return
    }
    if (!form.school) {
      show('请输入学校名称')
      return
    }

    setLoading(true)
    try {
      await authAPI.verifyStudent({
        student_id: form.student_id,
        real_name: form.real_name,
        school: form.school,
      })
      show('认证申请已提交，请等待审核')
      if (user) {
        updateUser({ is_verified: true, verification_status: 'pending', school: form.school })
      }
      setTimeout(() => navigate('/profile'), 1500)
    } catch (err) {
      console.error(err)
      show('提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div>
        <Navbar title="学生认证" onBack={() => navigate(-1)} />
        <Loading />
      </div>
    )
  }

  return (
    <div className="page-container">
      <Navbar title="学生认证" onBack={() => navigate(-1)} />

      {status?.status === 'approved' ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
          <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '10px' }}>
            认证已通过
          </div>
          <div style={{ color: '#969799' }}>
            您已通过学生实名认证
          </div>
          <div className="cell-group" style={{ marginTop: '30px' }}>
            <div className="cell">
              <span className="cell-title">学校</span>
              <span className="cell-value">{status.school}</span>
            </div>
            <div className="cell">
              <span className="cell-title">学号</span>
              <span className="cell-value">{status.student_id}</span>
            </div>
            <div className="cell">
              <span className="cell-title">姓名</span>
              <span className="cell-value">{status.real_name}</span>
            </div>
          </div>
        </div>
      ) : status?.status === 'pending' ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>⏳</div>
          <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '10px' }}>
            认证审核中
          </div>
          <div style={{ color: '#969799' }}>
            请等待管理员审核
          </div>
        </div>
      ) : (
        <div>
          <div className="section">
            <div className="section-title">认证说明</div>
            <div style={{ fontSize: '13px', color: '#646566', lineHeight: '1.6' }}>
              完成学生认证后，您将获得以下特权：
              <br />• 提高商品可信度
              <br />• 优先展示您的商品
              <br />• 参与更多校园活动
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-item">
                <label className="form-label">学校</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="请输入学校名称"
                  value={form.school}
                  onChange={(e) => setForm({ ...form, school: e.target.value })}
                />
              </div>
              <div className="form-item">
                <label className="form-label">学号</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="请输入学号"
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                />
              </div>
              <div className="form-item">
                <label className="form-label">真实姓名</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="请输入真实姓名"
                  value={form.real_name}
                  onChange={(e) => setForm({ ...form, real_name: e.target.value })}
                />
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? '提交中...' : '提交认证申请'}
              </button>
            </div>
          </form>

          <div style={{ padding: '0 20px', fontSize: '12px', color: '#969799', textAlign: 'center' }}>
            我们将保护您的个人信息，仅用于身份验证
          </div>
        </div>
      )}

      <Toast />
    </div>
  )
}
