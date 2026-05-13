import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { productAPI, campusAPI } from '../utils/api'
import { useUserStore } from '../store/userStore'
import { Loading, Empty } from '../components/common'

const CATEGORIES = [
  { key: '', label: '全部' },
  { key: '数码产品', label: '数码产品' },
  { key: '书籍教材', label: '书籍教材' },
  { key: '交通工具', label: '交通工具' },
  { key: '生活用品', label: '生活用品' },
  { key: '其他', label: '其他' },
]

const CAMPUS_ICONS = {
  '清华大学': '🏛️',
  '北京大学': '🎓',
  '复旦大学': '📚',
  '上海交通大学': '⚛️',
  '浙江大学': '🌿',
  '南京大学': '📖',
}

function parseImages(images) {
  if (!images) return []
  try {
    return JSON.parse(images)
  } catch {
    return [images]
  }
}

function ProductCard({ product, onClick, showMatch }) {
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
          <span>{product.building || product.college || product.campus || '校园'}</span>
          <span>{product.view_count} 浏览</span>
        </div>
        {showMatch && product.match_reasons && product.match_reasons.length > 0 && (
          <div className="match-badge">
            📍 {product.match_reasons[0]}
          </div>
        )}
      </div>
    </div>
  )
}

function CampusZoneCard({ campus, productCount, onClick }) {
  const icon = CAMPUS_ICONS[campus] || '🏫'
  return (
    <div className="zone-card" onClick={onClick}>
      <div className="zone-icon">{icon}</div>
      <div className="zone-name">{campus}</div>
      <div className="zone-count">{productCount || 0} 件商品</div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [keyword, setKeyword] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [products, setProducts] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [campusZones, setCampusZones] = useState([])
  const [loading, setLoading] = useState(false)
  const [recommendLoading, setRecommendLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [page, setPage] = useState(1)
  const [showZonePicker, setShowZonePicker] = useState(false)
  const [selectedCampus, setSelectedCampus] = useState(null)

  const fetchProducts = useCallback(async (isRefresh = false) => {
    if (loading && !isRefresh) return
    setLoading(true)
    try {
      const params = {
        page: isRefresh ? 1 : page,
        page_size: 20,
      }
      if (keyword) params.keyword = keyword
      if (CATEGORIES[activeTab]?.key) params.category = CATEGORIES[activeTab].key

      const data = await productAPI.getList(params)
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
  }, [activeTab, keyword, page, loading])

  const fetchRecommendations = useCallback(async () => {
    setRecommendLoading(true)
    try {
      const data = await campusAPI.getRecommendations({ page_size: 4 })
      setRecommendations(data.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setRecommendLoading(false)
    }
  }, [])

  const fetchCampusZones = useCallback(async () => {
    try {
      const data = await campusAPI.getZoneStats()
      if (data.campus_stats) {
        setCampusZones(data.campus_stats)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchProducts(true)
    fetchRecommendations()
    fetchCampusZones()
  }, [activeTab])

  const handleSearch = () => {
    setPage(1)
    setProducts([])
    setFinished(false)
    fetchProducts(true)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      if (!finished && !loading) {
        fetchProducts(false)
      }
    }
  }

  const handleCampusClick = (campus) => {
    setSelectedCampus(campus)
    setShowZonePicker(false)
    navigate(`/zone-products?campus=${encodeURIComponent(campus)}`)
  }

  return (
    <div className="page-container" onScroll={handleScroll} style={{ overflowY: 'auto', maxHeight: '100vh' }}>
      <div className="search-bar">
        <input
          className="search-input"
          value={keyword}
          placeholder="搜索闲置商品"
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSearch}
        />
      </div>

      {user && recommendations.length > 0 && (
        <div className="section">
          <div className="section-header">
            <span className="section-title">✨ 为你推荐</span>
            <span className="section-subtitle">基于你的位置智能推荐</span>
          </div>
          {recommendLoading ? (
            <Loading />
          ) : (
            <div className="product-grid">
              {recommendations.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showMatch={true}
                  onClick={() => navigate(`/product/${product.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <span className="section-title">🏫 校园专区</span>
          <span
            className="section-more"
            onClick={() => setShowZonePicker(true)}
          >
            更多 ›
          </span>
        </div>
        <div className="zone-row">
          {campusZones.slice(0, 4).map((zone) => (
            <CampusZoneCard
              key={zone.campus}
              campus={zone.campus}
              productCount={zone.product_count}
              onClick={() => handleCampusClick(zone.campus)}
            />
          ))}
        </div>
      </div>

      <div className="category-tabs">
        {CATEGORIES.map((cat, index) => (
          <div
            key={cat.key}
            className={`category-tab ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {cat.label}
          </div>
        ))}
      </div>

      <div style={{ padding: '8px' }}>
        {products.length === 0 && !loading ? (
          <Empty description="暂无商品" />
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

      {showZonePicker && (
        <div className="overlay" onClick={() => setShowZonePicker(false)}>
          <div
            className="dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 'none', borderRadius: '12px 12px 0 0', margin: 0, padding: '0', maxHeight: '70vh', overflowY: 'auto' }}
          >
            <div style={{ padding: '16px', borderBottom: '1px solid #ebedf0', textAlign: 'center', fontWeight: '500' }}>
              选择校园
            </div>
            {campusZones.map((zone) => (
              <div
                key={zone.campus}
                className="cell"
                onClick={() => handleCampusClick(zone.campus)}
              >
                <span className="cell-title">
                  <span style={{ marginRight: '8px' }}>{CAMPUS_ICONS[zone.campus] || '🏫'}</span>
                  {zone.campus}
                </span>
                <span className="cell-value">{zone.product_count} 件商品 ›</span>
              </div>
            ))}
            <div
              className="cell"
              onClick={() => setShowZonePicker(false)}
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
