import { useState, useEffect } from 'react'
import { plansApi, checkinsApi } from './api'
import { PlanForm } from './components/PlanForm'
import { CheckInForm } from './components/CheckInForm'
import { PlanCard } from './components/PlanCard'
import { Calendar } from './components/Calendar'
import type { StudyPlan, PlanStatus } from './types'

type TabType = 'plans' | 'checkin' | 'calendar'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('plans')
  const [plans, setPlans] = useState<StudyPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPlans()
  }, [])

  async function loadPlans() {
    setLoading(true)
    setError(null)
    try {
      const data = await plansApi.getAll()
      setPlans(data)
    } catch (err: any) {
      setError('无法连接到服务器，请确保后端服务已启动')
      console.error(err)
    }
    setLoading(false)
  }

  async function handleCreatePlan(data: { title: string; description: string; status: PlanStatus }) {
    try {
      await plansApi.create(data)
      loadPlans()
    } catch (err: any) {
      setError(err.response?.data?.detail || '创建计划失败')
    }
  }

  async function handleUpdatePlan(id: number, data: { title?: string; description?: string; status?: PlanStatus }) {
    try {
      await plansApi.update(id, data)
      loadPlans()
    } catch (err: any) {
      setError(err.response?.data?.detail || '更新计划失败')
    }
  }

  async function handleDeletePlan(id: number) {
    try {
      await plansApi.delete(id)
      loadPlans()
    } catch (err: any) {
      setError(err.response?.data?.detail || '删除计划失败')
    }
  }

  async function handleCheckIn(data: { plan_id: number; check_in_date: string; notes: string }) {
    try {
      await checkinsApi.create(data)
      loadPlans()
      alert('打卡成功！🎉')
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (detail && detail.includes('Already checked in')) {
        alert('该计划今天已经打过卡了')
      } else {
        alert(detail || '打卡失败')
      }
    }
  }

  function handleQuickCheckIn(planId: number) {
    const today = new Date().toISOString().split('T')[0]
    handleCheckIn({ plan_id: planId, check_in_date: today, notes: '' })
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📚 学习计划打卡</h1>
        <p>坚持学习，每天进步一点点</p>
      </header>

      <div className="main-content">
        {error && (
          <div className="error" onClick={() => setError(null)}>
            {error}
            <span style={{ float: 'right', cursor: 'pointer' }}>×</span>
          </div>
        )}

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            📋 学习计划
          </button>
          <button
            className={`tab-btn ${activeTab === 'checkin' ? 'active' : ''}`}
            onClick={() => setActiveTab('checkin')}
          >
            ✅ 打卡
          </button>
          <button
            className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            📅 日历
          </button>
        </div>

        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <>
            {activeTab === 'plans' && (
              <div>
                <PlanForm onSubmit={handleCreatePlan} />
                <div style={{ marginTop: '30px' }}>
                  <h2 style={{ marginBottom: '20px', color: '#333' }}>我的计划</h2>
                  {plans.length === 0 ? (
                    <div className="empty-state">
                      <h3>暂无学习计划</h3>
                      <p>创建你的第一个学习计划，开始打卡之旅吧！</p>
                    </div>
                  ) : (
                    plans.map(plan => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        onUpdate={handleUpdatePlan}
                        onDelete={handleDeletePlan}
                        onCheckIn={handleQuickCheckIn}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'checkin' && (
              <CheckInForm plans={plans} onSubmit={handleCheckIn} />
            )}

            {activeTab === 'calendar' && (
              <Calendar plans={plans} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
