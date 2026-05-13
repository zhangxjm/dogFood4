import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productAPI } from '../utils/api'
import { Navbar, useToast, Loading, Empty } from '../components/common'

function parseImages(images) {
  if (!images) return []
  try {
    return JSON.parse(images)
  } catch {
    return [images]
  }
}

export default function FavoritesPage() {
  const navigate = useNavigate()
  const { show, Toast } = useToast()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFavorites = async () => {
    setLoading(true)
    try {
      const data = await productAPI.getFavorites({ page_size: 100 })
      setFavorites(data.items || [])
    } catch (err) {
      console.error(err)
      show('获取收藏列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  if (loading) {
    return (
      <div>
        <Navbar title="我的收藏" onBack={() => navigate(-1)} />
        <Loading />
      </div>
    )
  }

  return (
    <div className="page-container">
      <Navbar title="我的收藏" onBack={() => navigate(-1)} />

      {favorites.length === 0 ? (
        <Empty description="暂无收藏" />
      ) : (
        <div className="product-grid">
          {favorites.map((fav) => {
            const product = fav.product
            if (!product) return null
            const images = parseImages(product.images)
            return (
              <div
                key={fav.id}
                className="product-card"
                onClick={() => navigate(`/product/${product.id}`)}
              >
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
                    <span>{product.campus || '校园'}</span>
                    <span>{product.view_count} 浏览</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Toast />
    </div>
  )
}
