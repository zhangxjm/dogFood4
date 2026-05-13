import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderAPI } from '../utils/api'
import { useUserStore } from '../store/userStore'
import { Navbar, useToast, Loading, Empty } from '../components/common'

const STATUS_MAP = {
  pending_payment: { label: '待支付', color: '#ff976a', tag: 'tag-warning' },
  paid: { label: '待发货', color: '#1989fa', tag: 'tag-primary' },
  delivered: { label: '待确认', color: '#ff976a', tag: 'tag-warning' },
  completed: { label: '已完成', color: '#07c160', tag: 'tag-success' },
  cancelled: { label: '已取消', color: '#969799', tag: 'tag-default' },
}

function parseImages(images) {
  if (!images) return []
  try {
    return JSON.parse(images)
  } catch {
    return [images]
  }
}

export default function OrderPage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { show, Toast } = useToast()
  const [activeTab, setActiveTab] = useState(0)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const tabs = [
    { key: '', label: '全部' },
    { key: 'pending_payment', label: '待支付' },
    { key: 'paid', label: '待发货' },
    { key: 'delivered', label: '待确认' },
    { key: 'completed', label: '已完成' },
  ]

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = {}
      if (tabs[activeTab]?.key) {
        params.status = tabs[activeTab].key
      }
      const data = await orderAPI.getList(params)
      setOrders(data.items || [])
    } catch (err) {
      console.error(err)
      show('获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [activeTab])

  if (loading) {
    return (
      <div>
        <Navbar title="我的订单" onBack={() => navigate(-1)} />
        <Loading />
      </div>
    )
  }

  return (
    <div className="page-container">
      <Navbar title="我的订单" onBack={() => navigate(-1)} />

      <div className="category-tabs">
        {tabs.map((tab, index) => (
          <div
            key={tab.key}
            className={`category-tab ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <Empty description="暂无订单" />
      ) : (
        <div style={{ padding: '12px' }}>
          {orders.map((order) => {
            const status = STATUS_MAP[order.status] || { label: order.status, color: '#969799', tag: 'tag-default' }
            const product = order.product
            const images = product ? parseImages(product.images) : []
            const isBuyer = order.buyer_id === user?.id

            return (
              <div
                key={order.id}
                className="cell-group"
                onClick={() => navigate(`/order/${order.id}`)}
              >
                <div className="cell">
                  <span className="cell-title">订单号: {order.order_no}</span>
                  <span className={`tag ${status.tag}`}>{status.label}</span>
                </div>
                {product && (
                  <div className="cell" style={{ alignItems: 'flex-start' }}>
                    <img
                      src={images[0] || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'}
                      alt=""
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginRight: '12px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', color: '#323233' }}>{product.title}</div>
                      <div style={{ fontSize: '12px', color: '#969799', marginTop: '4px' }}>
                        {isBuyer ? '购买' : '出售'}
                      </div>
                    </div>
                    <div style={{ color: '#ee0a24', fontSize: '16px', fontWeight: 'bold' }}>
                      ¥{order.price}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Toast />
    </div>
  )
}
