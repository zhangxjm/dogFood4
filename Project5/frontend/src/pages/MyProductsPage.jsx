import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productAPI } from '../utils/api'
import { Navbar, useToast, Dialog, Loading, Empty } from '../components/common'

const STATUS_MAP = {
  available: '在售',
  sold: '已售出',
  removed: '已下架',
}

function parseImages(images) {
  if (!images) return []
  try {
    return JSON.parse(images)
  } catch {
    return [images]
  }
}

export default function MyProductsPage() {
  const navigate = useNavigate()
  const { show, Toast } = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState({ visible: false, productId: null })

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await productAPI.getMyList({ page_size: 100 })
      setProducts(data.items || [])
    } catch (err) {
      console.error(err)
      show('获取商品列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = (productId) => {
    setShowDialog({ visible: true, productId })
  }

  const confirmDelete = async () => {
    const { productId } = showDialog
    setShowDialog({ visible: false, productId: null })
    try {
      await productAPI.delete(productId)
      show('删除成功')
      fetchProducts()
    } catch (err) {
      console.error(err)
      show('删除失败')
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar title="我的发布" onBack={() => navigate(-1)} />
        <Loading />
      </div>
    )
  }

  return (
    <div className="page-container">
      <Navbar title="我的发布" onBack={() => navigate(-1)} />

      {products.length === 0 ? (
        <Empty description="暂无发布" />
      ) : (
        <div style={{ padding: '12px' }}>
          {products.map((product) => {
            const images = parseImages(product.images)
            return (
              <div key={product.id} className="cell-group">
                <div
                  className="cell"
                  style={{ alignItems: 'flex-start' }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img
                    src={images[0] || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'}
                    alt=""
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginRight: '12px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: '#323233' }}>{product.title}</div>
                    <div style={{ fontSize: '12px', color: '#969799', marginTop: '4px' }}>
                      {product.category}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                      <span style={{ color: '#ee0a24', fontSize: '16px', fontWeight: 'bold' }}>
                        ¥{product.price}
                      </span>
                      <span
                        className={`tag ${product.status === 'available' ? 'tag-primary' : 'tag-default'}`}
                      >
                        {STATUS_MAP[product.status] || product.status}
                      </span>
                    </div>
                  </div>
                </div>
                {product.status === 'available' && (
                  <div className="cell" onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(product.id)
                  }}>
                    <span className="cell-title" style={{ color: '#ee0a24' }}>删除商品</span>
                    <span className="cell-value">›</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Dialog
        title="确认删除"
        message="确定要删除这个商品吗？"
        visible={showDialog.visible}
        onConfirm={confirmDelete}
        onCancel={() => setShowDialog({ visible: false, productId: null })}
        confirmText="删除"
        cancelText="取消"
      />

      <Toast />
    </div>
  )
}
