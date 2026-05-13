import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { orderAPI } from '../utils/api'
import { useUserStore } from '../store/userStore'
import { Navbar, useToast, Dialog, Loading, Empty } from '../components/common'

const STATUS_MAP = {
  pending_payment: { label: '待支付', desc: '请尽快完成支付' },
  paid: { label: '待发货', desc: '等待卖家发货' },
  delivered: { label: '待确认收货', desc: '请确认收到商品' },
  completed: { label: '已完成', desc: '交易完成' },
  cancelled: { label: '已取消', desc: '订单已取消' },
}

function parseImages(images) {
  if (!images) return []
  try {
    return JSON.parse(images)
  } catch {
    return [images]
  }
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { show, Toast } = useToast()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showDialog, setShowDialog] = useState({ visible: false, type: '' })

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const data = await orderAPI.getDetail(id)
      setOrder(data)
    } catch (err) {
      console.error(err)
      show('获取订单详情失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  const handlePay = () => {
    setShowDialog({ visible: true, type: 'pay' })
  }

  const handleConfirm = () => {
    setShowDialog({ visible: true, type: 'confirm' })
  }

  const handleCancel = () => {
    setShowDialog({ visible: true, type: 'cancel' })
  }

  const handleAction = async () => {
    const { type } = showDialog
    setShowDialog({ visible: false, type: '' })
    setActionLoading(true)
    try {
      let result
      if (type === 'pay') {
        result = await orderAPI.pay(id)
      } else if (type === 'confirm') {
        result = await orderAPI.confirm(id)
      } else if (type === 'cancel') {
        result = await orderAPI.cancel(id)
      }
      show('操作成功')
      fetchOrder()
    } catch (err) {
      console.error(err)
      show('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar title="订单详情" onBack={() => navigate(-1)} />
        <Loading />
      </div>
    )
  }

  if (!order) {
    return (
      <div>
        <Navbar title="订单详情" onBack={() => navigate(-1)} />
        <Empty description="订单不存在" />
      </div>
    )
  }

  const status = STATUS_MAP[order.status] || { label: order.status, desc: '' }
  const product = order.product
  const images = product ? parseImages(product.images) : []
  const isBuyer = order.buyer_id === user?.id

  const dialogTitles = {
    pay: '确认支付',
    confirm: '确认收货',
    cancel: '取消订单',
  }

  const dialogMessages = {
    pay: `确认支付订单？\n金额：¥${order.price}`,
    confirm: '确认已收到商品？\n确认后订单将完成',
    cancel: '确定要取消订单吗？',
  }

  return (
    <div className="page-container">
      <Navbar title="订单详情" onBack={() => navigate(-1)} />

      <div className="section">
        <div style={{ fontSize: '18px', fontWeight: '500', color: '#1989fa', marginBottom: '8px' }}>
          {status.label}
        </div>
        <div style={{ fontSize: '13px', color: '#969799' }}>{status.desc}</div>
      </div>

      {product && (
        <div className="cell-group">
          <div className="cell" style={{ alignItems: 'flex-start' }}>
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
            </div>
            <div style={{ color: '#ee0a24', fontSize: '16px', fontWeight: 'bold' }}>
              ¥{order.price}
            </div>
          </div>
        </div>
      )}

      <div className="cell-group">
        <div className="cell">
          <span className="cell-title">订单号</span>
          <span className="cell-value">{order.order_no}</span>
        </div>
        <div className="cell">
          <span className="cell-title">交易角色</span>
          <span className="cell-value">{isBuyer ? '买家' : '卖家'}</span>
        </div>
        {order.pickup_location && (
          <div className="cell">
            <span className="cell-title">自提地点</span>
            <span className="cell-value">{order.pickup_location}</span>
          </div>
        )}
        {order.pickup_time && (
          <div className="cell">
            <span className="cell-title">约定时间</span>
            <span className="cell-value">{order.pickup_time}</span>
          </div>
        )}
        {order.note && (
          <div className="cell">
            <span className="cell-title">备注</span>
            <span className="cell-value">{order.note}</span>
          </div>
        )}
        <div className="cell">
          <span className="cell-title">订单金额</span>
          <span style={{ color: '#ee0a24', fontWeight: 'bold' }}>¥{order.price}</span>
        </div>
        <div className="cell">
          <span className="cell-title">创建时间</span>
          <span className="cell-value">{new Date(order.created_at).toLocaleString()}</span>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {order.status === 'pending_payment' && isBuyer && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-default btn-block" onClick={handleCancel}>
              取消订单
            </button>
            <button className="btn btn-primary btn-block" onClick={handlePay}>
              立即支付
            </button>
          </div>
        )}
        {order.status === 'delivered' && isBuyer && (
          <button className="btn btn-primary btn-block" onClick={handleConfirm}>
            确认收货
          </button>
        )}
        {order.status === 'paid' && !isBuyer && (
          <button
            className="btn btn-primary btn-block"
            onClick={async () => {
              setActionLoading(true)
              try {
                await orderAPI.confirm(id)
                show('发货成功')
                fetchOrder()
              } catch (err) {
                console.error(err)
                show('操作失败')
              } finally {
                setActionLoading(false)
              }
            }}
            disabled={actionLoading}
          >
            {actionLoading ? '处理中...' : '发货'}
          </button>
        )}
      </div>

      <Dialog
        title={dialogTitles[showDialog.type]}
        message={dialogMessages[showDialog.type]}
        visible={showDialog.visible}
        onConfirm={handleAction}
        onCancel={() => setShowDialog({ visible: false, type: '' })}
        confirmText="确定"
        cancelText="取消"
      />

      <Toast />
    </div>
  )
}
