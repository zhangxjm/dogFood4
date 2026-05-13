import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productAPI, chatAPI, orderAPI } from '../utils/api'
import { useUserStore } from '../store/userStore'
import { Navbar, useToast, Dialog, Loading, Empty } from '../components/common'

function parseImages(images) {
  if (!images) return []
  try {
    return JSON.parse(images)
  } catch {
    return [images]
  }
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { show, Toast } = useToast()
  const [product, setProduct] = useState(null)
  const [images, setImages] = useState([])
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [imageIndex, setImageIndex] = useState(0)
  const [showDialog, setShowDialog] = useState(false)

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const data = await productAPI.getDetail(id)
      setProduct(data)
      setImages(parseImages(data.images))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [id])

  const handleContact = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (product.seller?.id === user.id) {
      show('不能和自己聊天')
      return
    }
    try {
      setLoading(true)
      const data = await chatAPI.createConversation({
        other_user_id: product.seller.id,
        product_id: product.id,
      })
      navigate(`/chat/${data.id}`)
    } catch (err) {
      console.error(err)
      show('创建会话失败')
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      const data = await productAPI.toggleFavorite(id)
      setFavorited(data.favorited)
      show(data.favorited ? '已收藏' : '已取消收藏')
    } catch (err) {
      console.error(err)
    }
  }

  const handleBuy = () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (product.seller?.id === user.id) {
      show('不能购买自己的商品')
      return
    }
    setShowDialog(true)
  }

  const confirmBuy = async () => {
    setShowDialog(false)
    try {
      setLoading(true)
      const data = await orderAPI.create({
        product_id: product.id,
        pickup_location: product.campus,
      })
      show('订单创建成功')
      navigate(`/order/${data.id}`)
    } catch (err) {
      console.error(err)
      show('创建订单失败')
    } finally {
      setLoading(false)
    }
  }

  const prevImage = () => {
    if (images.length > 0) {
      setImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const nextImage = () => {
    if (images.length > 0) {
      setImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar title="商品详情" onBack={() => navigate(-1)} />
        <Loading />
      </div>
    )
  }

  if (!product) {
    return (
      <div>
        <Navbar title="商品详情" onBack={() => navigate(-1)} />
        <Empty description="商品不存在" />
      </div>
    )
  }

  return (
    <div className="page-container">
      <Navbar title="商品详情" onBack={() => navigate(-1)} />

      {images.length > 0 ? (
        <div style={{ position: 'relative', width: '100%', height: '300px' }}>
          <img
            src={images[imageIndex]}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                ‹
              </button>
              <button
                onClick={nextImage}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                ›
              </button>
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: '#fff',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  padding: '4px 10px',
                  borderRadius: '10px',
                  fontSize: '12px',
                }}
              >
                {imageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: '300px',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#999' }}>暂无图片</span>
        </div>
      )}

      <div className="cell-group">
        <div className="cell">
          <span className="cell-title">价格</span>
          <span>
            <span style={{ color: '#ee0a24', fontSize: '20px', fontWeight: 'bold' }}>
              ¥{product.price}
            </span>
            {product.original_price && (
              <span
                style={{
                  color: '#969799',
                  fontSize: '14px',
                  textDecoration: 'line-through',
                  marginLeft: '8px',
                }}
              >
                ¥{product.original_price}
              </span>
            )}
          </span>
        </div>
        <div className="cell">
          <span className="cell-title">商品名称</span>
          <span className="cell-value">{product.title}</span>
        </div>
        <div className="cell">
          <span className="cell-title">分类</span>
          <span className="cell-value">{product.category}</span>
        </div>
        <div className="cell">
          <span className="cell-title">成色</span>
          <span className="cell-value">{product.condition || '未填写'}</span>
        </div>
        <div className="cell">
          <span className="cell-title">交易地点</span>
          <span className="cell-value">{product.campus || '未填写'}</span>
        </div>
        <div className="cell">
          <span className="cell-title">浏览量</span>
          <span className="cell-value">{product.view_count} 次</span>
        </div>
      </div>

      {product.description && (
        <div className="section">
          <div className="section-title">商品描述</div>
          <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#646566' }}>
            {product.description}
          </div>
        </div>
      )}

      {product.seller && (
        <div className="cell-group">
          <div className="cell-group-title">卖家信息</div>
          <div className="cell">
            <div className="cell-content">
              <div className="cell-title">
                {product.seller.nickname || product.seller.username}
                {product.seller.is_verified && (
                  <span className="tag tag-success" style={{ marginLeft: '8px' }}>
                    已认证
                  </span>
                )}
              </div>
              <div className="cell-label">{product.seller.school || '未认证学校'}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '12px', paddingBottom: '80px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-default"
            onClick={handleFavorite}
            style={{ flex: 1 }}
          >
            {favorited ? '❤️ 已收藏' : '🤍 收藏'}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleContact}
            style={{ flex: 1 }}
          >
            联系卖家
          </button>
          <button
            className="btn btn-warning"
            onClick={handleBuy}
            style={{ flex: 1 }}
          >
            立即购买
          </button>
        </div>
      </div>

      <Dialog
        title="确认购买"
        message={`确认购买"${product.title}"？\n价格：¥${product.price}`}
        visible={showDialog}
        onConfirm={confirmBuy}
        onCancel={() => setShowDialog(false)}
        confirmText="确认"
        cancelText="取消"
      />

      <Toast />
    </div>
  )
}
