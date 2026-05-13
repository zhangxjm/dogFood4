import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { productAPI, uploadAPI, campusAPI } from '../utils/api'
import { useUserStore } from '../store/userStore'
import { Navbar, useToast } from '../components/common'

const CATEGORIES = ['数码产品', '书籍教材', '交通工具', '生活用品', '其他']
const CONDITIONS = ['全新', '九成新', '八成新', '七成新', '六成新及以下']
const CAMPUSES = ['清华大学', '北京大学', '复旦大学', '上海交通大学', '浙江大学', '南京大学']

export default function PublishPage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const fileInputRef = useRef(null)
  const { show, Toast } = useToast()
  const [images, setImages] = useState([])
  const [imageUrls, setImageUrls] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    category: '',
    condition: '',
    campus: user?.school || '',
    college: '',
    building: '',
  })
  const [colleges, setColleges] = useState([])
  const [buildings, setBuildings] = useState([])
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showConditionPicker, setShowConditionPicker] = useState(false)
  const [showCampusPicker, setShowCampusPicker] = useState(false)
  const [showCollegePicker, setShowCollegePicker] = useState(false)
  const [showBuildingPicker, setShowBuildingPicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchColleges = async (campus) => {
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
    try {
      const data = await campusAPI.getBuildings(campus, college)
      if (Array.isArray(data)) {
        setBuildings(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  React.useEffect(() => {
    if (form.campus) {
      fetchColleges(form.campus)
    }
  }, [])

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

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    if (images.length + files.length > 9) {
      show('最多上传9张图片')
      return
    }

    setUploading(true)
    try {
      const newImages = files.map((file) => ({
        url: URL.createObjectURL(file),
        file,
      }))

      setImages((prev) => [...prev, ...newImages])

      const urls = []
      for (const file of files) {
        const data = await uploadAPI.uploadImage(file)
        urls.push(data.url)
      }
      setImageUrls((prev) => [...prev, ...urls])
    } catch (err) {
      console.error(err)
      show('图片上传失败')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!form.title) {
      show('请输入商品标题')
      return
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      show('请输入正确的价格')
      return
    }
    if (!form.category) {
      show('请选择商品分类')
      return
    }

    setLoading(true)
    try {
      await productAPI.create({
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        category: form.category,
        condition: form.condition,
        campus: form.campus,
        college: form.college,
        building: form.building,
        images: imageUrls,
      })
      show('发布成功')
      setForm({
        title: '',
        description: '',
        price: '',
        original_price: '',
        category: '',
        condition: '',
        campus: user?.school || '',
        college: '',
        building: '',
      })
      setImages([])
      setImageUrls([])
      setTimeout(() => navigate('/'), 1000)
    } catch (err) {
      console.error(err)
      show('发布失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <Navbar title="发布商品" onBack={() => navigate(-1)} />

      <div className="cell-group" style={{ marginTop: '12px' }}>
        <div className="cell-group-title">商品图片（最多9张）</div>
        <div className="upload-area">
          {images.map((img, index) => (
            <div key={index} className="upload-item">
              <img src={img.url} alt="" />
              <div
                className="upload-delete"
                onClick={() => handleDeleteImage(index)}
              >
                ×
              </div>
            </div>
          ))}
          {images.length < 9 && (
            <div
              className="upload-item"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <span className="upload-add">{uploading ? '⏳' : '+'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <div className="form-item">
          <label className="form-label">商品标题</label>
          <input
            className="form-input"
            type="text"
            placeholder="请输入商品标题"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={50}
          />
        </div>
        <div className="form-item" style={{ alignItems: 'flex-start' }}>
          <label className="form-label">商品描述</label>
          <textarea
            className="form-textarea"
            placeholder="请输入商品描述（选填）"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            maxLength={500}
          />
        </div>
        <div className="form-item">
          <label className="form-label">售价</label>
          <input
            className="form-input"
            type="number"
            placeholder="请输入售价"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            min="0"
            step="0.01"
          />
        </div>
        <div className="form-item">
          <label className="form-label">原价</label>
          <input
            className="form-input"
            type="number"
            placeholder="请输入原价（选填）"
            value={form.original_price}
            onChange={(e) => setForm({ ...form, original_price: e.target.value })}
            min="0"
            step="0.01"
          />
        </div>
        <div
          className="cell"
          onClick={() => setShowCategoryPicker(true)}
          style={{ padding: '12px 16px' }}
        >
          <span className="cell-title">商品分类</span>
          <span className="cell-value">{form.category || '请选择分类'} ›</span>
        </div>
        <div
          className="cell"
          onClick={() => setShowConditionPicker(true)}
          style={{ padding: '12px 16px' }}
        >
          <span className="cell-title">商品成色</span>
          <span className="cell-value">{form.condition || '请选择成色（选填）'} ›</span>
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
            <span className="cell-value">{form.college || '请选择学院（选填）'} ›</span>
          </div>
        )}
        {form.college && (
          <div
            className="cell"
            onClick={() => setShowBuildingPicker(true)}
            style={{ padding: '12px 16px' }}
          >
            <span className="cell-title">楼栋/宿舍</span>
            <span className="cell-value">{form.building || '请选择楼栋（选填）'} ›</span>
          </div>
        )}
      </div>

      <div style={{ padding: '20px' }}>
        <button
          className="btn btn-primary btn-block"
          onClick={handleSubmit}
          disabled={loading || uploading}
        >
          {loading ? '发布中...' : '发布商品'}
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
              选择成色
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

      <Toast />
    </div>
  )
}
