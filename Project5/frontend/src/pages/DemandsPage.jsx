import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { demandAPI } from '../utils/api'
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

function DemandCard({ demand, onClick }) {
  const urgencyText = {
    urgent: '🔥 紧急',
    normal: '📌 普通',
    low: '⏰ 缓求'
  }

  return (
    <div className="demand-card" onClick={onClick}>
      <div className="demand-header">
        <div className="demand-urgency">
          {urgencyText[demand.urgency] || '📌 普通'}
        </div>
        {demand.status === 'matched' && (
          <span className="badge badge-success">已匹配</span>
        )}
        {demand.status === 'closed' && (
          <span className="badge">已完成</span>
        )}
        {demand.status === 'cancelled' && (
          <span className="badge badge-warning">已取消</span>
        )}
      </div>
      <div className="demand-title">{demand.title}</div>
      <div className="demand-meta">
        <span className="demand-category">{demand.category}</span>
        {demand.min_price !== null && demand.min_price !== undefined && (
          <span className="demand-price">¥{demand.min_price}</span>
        )}
        {demand.max_price !== null && demand.max_price !== undefined && (
          <span className="demand-price">~ ¥{demand.max_price}</span>
        )}
      </div>
      <div className="demand-location">
        {demand.building || demand.college || demand.campus || '校园'}
        <span style={{ marginLeft: 'auto', color: '#969799' }}>
          {demand.view_count} 浏览
        </span>
      </div>
    </div>
  )
}

export default function DemandsPage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [activeTab, setActiveTab] = useState(0)
  const [demands, setDemands] = useState([])
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [page, setPage] = useState(1)

  const fetchDemands = useCallback(async (isRefresh = false) => {
    if (loading && !isRefresh) return
    setLoading(true)
    try {
      const params = {
        page: isRefresh ? 1 : page,
        page_size: 20,
        status: 'open',
      }
      if (CATEGORIES[activeTab]?.key) {
        params.category = CATEGORIES[activeTab].key
      }

      const data = await demandAPI.getList(params)
      const newItems = data.items || []

      if (isRefresh) {
        setDemands(newItems)
        setPage(2)
      } else {
        setDemands((prev) => [...prev, ...newItems])
        setPage((prev) => prev + 1)
      }
      setFinished(newItems.length < 20)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeTab, page, loading])

  useEffect(() => {
    setDemands([])
    setPage(1)
    setFinished(false)
    fetchDemands(true)
  }, [activeTab])

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      if (!finished && !loading) {
        fetchDemands(false)
      }
    }
  }

  return (
    <div
      className="page-container"
      onScroll={handleScroll}
      style={{ overflowY: 'auto', maxHeight: '100vh' }}
    >
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', borderBottom: '1px solid #ebedf0', position: 'sticky', top: 0, zIndex: 50 }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>求购市场</h2>
        {user && (
          <button
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px', margin: 0 }}
            onClick={() => navigate('/publish-demand')}
          >
            发布求购
          </button>
        )}
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

      <div style={{ padding: '12px' }}>
        {demands.length === 0 && !loading ? (
          <Empty description="暂无求购需求" />
        ) : (
          <div className="demand-list">
            {demands.map((demand) => (
              <DemandCard
                key={demand.id}
                demand={demand}
                onClick={() => navigate(`/demand/${demand.id}`)}
              />
            ))}
          </div>
        )}

        {loading && <Loading />}

        {finished && demands.length > 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#969799' }}>
            没有更多了
          </div>
        )}
      </div>
    </div>
  )
}
