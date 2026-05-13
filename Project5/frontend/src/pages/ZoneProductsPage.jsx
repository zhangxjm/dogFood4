import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { campusAPI } from '../utils/api'
import { Navbar, Loading, Empty } from '../components/common'

function parseImages(images) {
  if (!images) return []
  try {
    return JSON.parse(images)
  } catch {
    return [images]
  }
}

function ProductCard({ product, onClick }) {
  const images = parseImages(product.images)
  return (
    <div className="product-card" onClick={onClick}>
      <img
        src={images[0] || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'}
        alt={product.title}
        className="product-image"
      />
      <div className="product-info">
        <div className="product-price">
          ¥{product.price}
          {product.original_price && (
            <span className="original">¥{product.original_price}</span>
          )}
        </div>
        <div className="product-title">{product.title}</div>
        <div className="product-meta">
          <span>{product.building || product.college || '校园'}</span>
          <span>{product.view_count} 浏览</span>
        </div>
      </div>
    </div>
  )
}

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export default function ZoneProductsPage() {
  const navigate = useNavigate()
  const query = useQuery()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [page, setPage] = useState(1)
  const [colleges, setColleges] = useState([])
  const [buildings, setBuildings] = useState([])
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [showCollegePicker, setShowCollegePicker] = useState(false)
  const [showBuildingPicker, setShowBuildingPicker] = useState(false)

  const campus = query.get('campus')

  const fetchProducts = async (isRefresh = false) => {
    if (loading && !isRefresh) return
    setLoading(true)
    try {
      const params = {
        campus,
        college: selectedCollege,
        building: selectedBuilding,
        page: isRefresh ? 1 : page,
        page_size: 20,
      }
      const data = await campusAPI.getProductsByZone(params)
      const newItems = data.items || []

      if (isRefresh) {
        setProducts(newItems)
        setPage(2)
      } else {
        setProducts((prev) => [...prev, ...newItems])
        setPage((prev) => prev + 1)
      }
      setFinished(newItems.length < 20)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchColleges = async () => {
    try {
      const data = await campusAPI.getColleges(campus)
      if (Array.isArray(data)) {
        setColleges(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchBuildings = async (college) => {
    try {
      const data = await campusAPI.getBuildings(campus, college)
      if (Array.isArray(data)) {
        setBuildings(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (campus) {
      fetchColleges()
      fetchProducts(true)
    }
  }, [campus])

  useEffect(() => {
    setPage(1)
    setProducts([])
    setFinished(false)
    setSelectedBuilding(null)
    fetchProducts(true)
    if (selectedCollege) {
      fetchBuildings(selectedCollege)
    } else {
      setBuildings([])
    }
  }, [selectedCollege])

  useEffect(() => {
    setPage(1)
    setProducts([])
    setFinished(false)
    fetchProducts(true)
  }, [selectedBuilding])

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      if (!finished && !loading) {
        fetchProducts(false)
      }
    }
  }

  const getPageTitle = () => {
    if (selectedBuilding) return `${campus} - ${selectedBuilding}`
    if (selectedCollege) return `${campus} - ${selectedCollege}`
    return `${campus}专区`
  }

  return (
    <div className="page-container" onScroll={handleScroll} style={{ overflowY: 'auto', maxHeight: '100vh' }}>
      <Navbar title={getPageTitle()} onBack={() => navigate(-1)} />

      <div className="zone-filter-bar">
        <div
          className="zone-filter-item"
          onClick={() => setShowCollegePicker(true)}
        >
          <span className="zone-filter-label">{selectedCollege || '选择学院'}</span>
          <span className="zone-filter-arrow">›</span>
        </div>
        <div
          className="zone-filter-item"
          onClick={() => setShowBuildingPicker(true)}
        >
          <span className="zone-filter-label">{selectedBuilding || '选择楼栋'}</span>
          <span className="zone-filter-arrow">›</span>
        </div>
      </div>

      <div style={{ padding: '8px' }}>
        {products.length === 0 && !loading ? (
          <Empty description="该专区暂无商品" />
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        )}

        {loading && <Loading />}

        {finished && products.length > 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#969799' }}>
            没有更多了
          </div>
        )}
      </div>

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
                setSelectedCollege(null)
                setShowCollegePicker(false)
              }}
            >
              <span className="cell-title">全部学院</span>
              {!selectedCollege && <span style={{ color: '#1989fa' }}>✓</span>}
            </div>
            {colleges.map((college) => (
              <div
                key={college}
                className="cell"
                onClick={() => {
                  setSelectedCollege(college)
                  setShowCollegePicker(false)
                }}
              >
                <span className="cell-title">{college}</span>
                {selectedCollege === college && <span style={{ color: '#1989fa' }}>✓</span>}
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
                setSelectedBuilding(null)
                setShowBuildingPicker(false)
              }}
            >
              <span className="cell-title">全部楼栋</span>
              {!selectedBuilding && <span style={{ color: '#1989fa' }}>✓</span>}
            </div>
            {buildings.map((building) => (
              <div
                key={building}
                className="cell"
                onClick={() => {
                  setSelectedBuilding(building)
                  setShowBuildingPicker(false)
                }}
              >
                <span className="cell-title">{building}</span>
                {selectedBuilding === building && <span style={{ color: '#1989fa' }}>✓</span>}
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
    </div>
  )
}
