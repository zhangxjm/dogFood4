import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { demandAPI, campusAPI } from '../utils/api'
import { useUserStore } from '../store/userStore'
import { Navbar, useToast } from '../components/common'

const CATEGORIES = ['数码产品', '书籍教材', '交通工具', '生活用品', '其他']
const CONDITIONS = ['全新', '九成新', '八成新', '七成新', '六成新及以下']
const URGENCIES = [
  { value: 'urgent', label: '🔥 紧急求购' },
  { value: 'normal', label: '📌 普通求购' },
  { value: 'low', label: '⏰ 缓求' }
]
const CAMPUSES = ['清华大学', '北京大学', '复旦大学', '上海交通大学', '浙江大学', '南京大学']

export default function PublishDemandPage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { show, Toast } = useToast()

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    campus: user?.school || '',
    college: '',
    building: '',
    min_price: '',
    max_price: '',
    urgency: 'normal',
  })
  const [colleges, setColleges] = useState([])
  const [buildings, setBuildings] = useState([])
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showConditionPicker, setShowConditionPicker] = useState(false)
  const [showCampusPicker, setShowCampusPicker] = useState(false)
  const [showCollegePicker, setShowCollegePicker] = useState(false)
  const [showBuildingPicker, setShowBuildingPicker] = useState(false)
  const [showUrgencyPicker, setShowUrgencyPicker] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchColleges = async (campus) => {
    if (!campus) return
    try {
      const data = await campusAPI.getColleges(campus)
      if (Array.isArray(data)) {
        setColleges(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchBuildings = async (campus, college) => {
    if (!campus) return
    try {
      const data = await campusAPI.getBuildings(campus, college)
      if (Array.isArray(data)) {
        setBuildings(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCampusChange = async (campus) => {
    setForm({ ...form, campus, college: '', building: '' })
    setColleges([])
    setBuildings([])
    if (campus) {
      await fetchColleges(campus)
    }
    setShowCampusPicker(false)
  }

  const handleCollegeChange = async (college) => {
    setForm({ ...form, college, building: '' })
    setBuildings([])
    if (form.campus && college) {
      await fetchBuildings(form.campus, college)
    }
    setShowCollegePicker(false)
  }

  const handleSubmit = async () => {
    if (!form.title) {
      show('请输入求购标题')
      return
    }
    if (!form.category) {
      show('请选择求购分类')
      return
    }

    setLoading(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        condition: form.condition || null,
        campus: form.campus || null,
        college: form.college || null,
        building: form.building || null,
        min_price: form.min_price ? parseFloat(form.min_price) : null,
        max_price: form.max_price ? parseFloat(form.max_price) : null,
        urgency: form.urgency,
      }
      await demandAPI.create(payload)
      show('发布成功')
      setTimeout(() => navigate('/demands'), 1000)
    } catch (err) {
      console.error(err)
      show('发布失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <Navbar title="发布求购" onBack={() => navigate(-1)} />

      <div className="form-group">
        <div className="form-item">
          <label className="form-label">求购标题</label>
          <input
            className="form-input"
            type="text"
            placeholder="请输入求购标题"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={50}
          />
        </div>
        <div className="form-item" style={{ alignItems: 'flex-start' }}>
          <label className="form-label">详细描述</label>
          <textarea
            className="form-textarea"
            placeholder="请详细描述您的需求（选填）"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            maxLength={500}
          />
        </div>

        <div
          className="cell"
          onClick={() => setShowCategoryPicker(true)}
          style={{ padding: '12px 16px' }}
        >
          <span className="cell-title">求购分类</span>
          <span className="cell-value">{form.category || '请选择分类'} ›</span>
        </div>

        <div
          className="cell"
          onClick={() => setShowUrgencyPicker(true)}
          style={{ padding: '12px 16px' }}
        >
          <span className="cell-title">紧急程度</span>
          <span className="cell-value">
            {URGENCIES.find(u => u.value === form.urgency)?.label || '请选择'} ›
          </span>
        </div>

        <div
          className="cell"
          onClick={() => setShowConditionPicker(true)}
          style={{ padding: '12px 16px' }}
        >
          <span className="cell-title">期望成色</span>
          <span className="cell-value">{form.condition || '请选择（选填）'} ›</span>
        </div>

        <div className="form-item">
          <label className="form-label">预算最低</label>
          <input
            className="form-input"
            type="number"
            placeholder="最低预算（选填）"
            value={form.min_price}
            onChange={(e) => setForm({ ...form, min_price: e.target.value })}
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-item">
          <label className="form-label">预算最高</label>
          <input
            className="form-input"
            type="number"
            placeholder="最高预算（选填）"
            value={form.max_price}
            onChange={(e) => setForm({ ...form, max_price: e.target.value })}
            min="0"
            step="0.01"
          />
        </div>

        <div
          className="cell"
          onClick={() => setShowCampusPicker(true)}
          style={{ padding: '12px 16px' }}
        >
          <span className="cell-title">所在校园</span>
          <span className="cell-value">{form.campus || '请选择校园'} ›</span>
        </div>

        {form.campus && (
          <div
            className="cell"
            onClick={() => setShowCollegePicker(true)}
            style={{ padding: '12px 16px' }}
          >
            <span className="cell-title">学院/系别</span>
            <span className="cell-value">{form.college || '请选择（选填）'} ›</span>
          </div>
        )}

        {form.college && (
          <div
            className="cell"
            onClick={() => setShowBuildingPicker(true)}
            style={{ padding: '12px 16px' }}
          >
            <span className="cell-title">楼栋/宿舍</span>
            <span className="cell-value">{form.building || '请选择（选填）'} ›</span>
          </div>
        )}
      </div>

      <div style={{ padding: '20px' }}>
        <button
          className="btn btn-primary btn-block"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '发布中...' : '发布求购'}
        </button>
      </div>

      {showCategoryPicker && (
        <div className="overlay" onClick={() => setShowCategoryPicker(false)}>
          <div
            className="dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 'none', borderRadius: '12px 12px 0 0', margin: 0, padding: '0' }}
          >
            <div style={{ padding: '16px', borderBottom: '1px solid #ebedf0', textAlign: 'center', fontWeight: '500' }}>
              选择分类
            </div>
            {CATEGORIES.map((cat) => (
              <div
                key={cat}
                className="cell"
                onClick={() => {
                  setForm({ ...form, category: cat })
                  setShowCategoryPicker(false)
                }}
              >
                <span className="cell-title">{cat}</span>
                {form.category === cat && <span style={{ color: '#1989fa' }}>✓</span>}
              </div>
            ))}
            <div
              className="cell"
              onClick={() => setShowCategoryPicker(false)}
              style={{ textAlign: 'center', color: '#969799' }}
            >
              取消
            </div>
          </div>
        </div>
      )}

      {showConditionPicker && (
        <div className="overlay" onClick={() => setShowConditionPicker(false)}>
          <div
            className="dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 'none', borderRadius: '12px 12px 0 0', margin: 0, padding: '0' }}
          >
            <div style={{ padding: '16px', borderBottom: '1px solid #ebedf0', textAlign: 'center', fontWeight: '500' }}>
              期望成色
            </div>
            {CONDITIONS.map((c) => (
              <div
                key={c}
                className="cell"
                onClick={() => {
                  setForm({ ...form, condition: c })
                  setShowConditionPicker(false)
                }}
              >
                <span className="cell-title">{c}</span>
                {form.condition === c && <span style={{ color: '#1989fa' }}>✓</span>}
              </div>
            ))}
            <div
              className="cell"
              onClick={() => setShowConditionPicker(false)}
              style={{ textAlign: 'center', color: '#969799' }}
            >
              取消
            </div>
          </div>
        </div>
      )}

      {showCampusPicker && (
        <div className="overlay" onClick={() => setShowCampusPicker(false)}>
          <div
            className="dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 'none', borderRadius: '12px 12px 0 0', margin: 0, padding: '0', maxHeight: '70vh', overflowY: 'auto' }}
          >
            <div style={{ padding: '16px', borderBottom: '1px solid #ebedf0', textAlign: 'center', fontWeight: '500' }}>
              选择校园
            </div>
            {CAMPUSES.map((c) => (
              <div
                key={c}
                className="cell"
                onClick={() => handleCampusChange(c)}
              >
                <span className="cell-title">{c}</span>
                {form.campus === c && <span style={{ color: '#1989fa' }}>✓</span>}
              </div>
            ))}
            <div
              className="cell"
              onClick={() => setShowCampusPicker(false)}
              style={{ textAlign: 'center', color: '#969799' }}
            >
              取消
            </div>
          </div>
        </div>
      )}

      {showCollegePicker && (
        <div className="overlay" onClick={() => setShowCollegePicker(false)}>
          <div
            className="dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 'none', borderRadius: '12px 12px 0 0', margin: 0, padding: '0', maxHeight: '70vh', overflowY: 'auto' }}
          >
            <div style={{ padding: '16px', borderBottom: '1px solid #ebedf0', textAlign: 'center', fontWeight: '500' }}>
              选择学院
            </div>
            <div
              className="cell"
              onClick={() => {
                setForm({ ...form, college: '' })
                setShowCollegePicker(false)
              }}
            >
              <span className="cell-title">不选择</span>
              {!form.college && <span style={{ color: '#1989fa' }}>✓</span>}
            </div>
            {colleges.map((c) => (
              <div
                key={c}
                className="cell"
                onClick={() => handleCollegeChange(c)}
              >
                <span className="cell-title">{c}</span>
                {form.college === c && <span style={{ color: '#1989fa' }}>✓</span>}
              </div>
            ))}
            <div
              className="cell"
              onClick={() => setShowCollegePicker(false)}
              style={{ textAlign: 'center', color: '#969799' }}
            >
              取消
            </div>
          </div>
        </div>
      )}

      {showBuildingPicker && (
        <div className="overlay" onClick={() => setShowBuildingPicker(false)}>
          <div
            className="dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 'none', borderRadius: '12px 12px 0 0', margin: 0, padding: '0', maxHeight: '70vh', overflowY: 'auto' }}
          >
            <div style={{ padding: '16px', borderBottom: '1px solid #ebedf0', textAlign: 'center', fontWeight: '500' }}>
              选择楼栋
            </div>
            <div
              className="cell"
              onClick={() => {
                setForm({ ...form, building: '' })
                setShowBuildingPicker(false)
              }}
            >
              <span className="cell-title">不选择</span>
              {!form.building && <span style={{ color: '#1989fa' }}>✓</span>}
            </div>
            {buildings.map((b) => (
              <div
                key={b}
                className="cell"
                onClick={() => {
                  setForm({ ...form, building: b })
                  setShowBuildingPicker(false)
                }}
              >
                <span className="cell-title">{b}</span>
                {form.building === b && <span style={{ color: '#1989fa' }}>✓</span>}
              </div>
            ))}
            <div
              className="cell"
              onClick={() => setShowBuildingPicker(false)}
              style={{ textAlign: 'center', color: '#969799' }}
            >
              取消
            </div>
          </div>
        </div>
      )}

      {showUrgencyPicker && (
        <div className="overlay" onClick={() => setShowUrgencyPicker(false)}>
          <div
            className="dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 'none', borderRadius: '12px 12px 0 0', margin: 0, padding: '0' }}
          >
            <div style={{ padding: '16px', borderBottom: '1px solid #ebedf0', textAlign: 'center', fontWeight: '500' }}>
              紧急程度
            </div>
            {URGENCIES.map((u) => (
              <div
                key={u.value}
                className="cell"
                onClick={() => {
                  setForm({ ...form, urgency: u.value })
                  setShowUrgencyPicker(false)
                }}
              >
                <span className="cell-title">{u.label}</span>
                {form.urgency === u.value && <span style={{ color: '#1989fa' }}>✓</span>}
              </div>
            ))}
            <div
              className="cell"
              onClick={() => setShowUrgencyPicker(false)}
              style={{ textAlign: 'center', color: '#969799' }}
            >
              取消
            </div>
          </div>
        </div>
      )}

      <Toast />
    </div>
  )
}
