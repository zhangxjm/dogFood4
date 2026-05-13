import { useState } from 'react'
import { PlanForm } from './PlanForm'
import type { StudyPlan, PlanStatus } from '../types'

const STATUS_LABELS: Record<PlanStatus, string> = {
  active: '进行中',
  completed: '已完成',
  paused: '暂停'
}

interface PlanCardProps {
  plan: StudyPlan
  onUpdate: (id: number, data: { title?: string; description?: string; status?: PlanStatus }) => void
  onDelete: (id: number) => void
  onCheckIn: (planId: number) => void
}

export function PlanCard({ plan, onUpdate, onDelete, onCheckIn }: PlanCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showCheckIns, setShowCheckIns] = useState(false)

  const handleStatusChange = async (newStatus: PlanStatus) => {
    onUpdate(plan.id, { status: newStatus })
  }

  const handleEdit = async (data: { title: string; description: string; status: PlanStatus }) => {
    onUpdate(plan.id, data)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm(`确定要删除计划"${plan.title}"吗？这将同时删除所有相关的打卡记录。`)) {
      onDelete(plan.id)
    }
  }

  if (isEditing) {
    return (
      <div className={`plan-card ${plan.status}`}>
        <PlanForm
          initialData={{
            title: plan.title,
            description: plan.description || '',
            status: plan.status
          }}
          onSubmit={handleEdit}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className={`plan-card ${plan.status}`}>
      <div className="plan-header">
        <h3>{plan.title}</h3>
        <span className={`plan-status ${plan.status}`}>
          {STATUS_LABELS[plan.status]}
        </span>
      </div>
      {plan.description && (
        <p className="plan-description">{plan.description}</p>
      )}
      <div className="plan-stats">
        累计打卡：{plan.total_check_ins} 天
      </div>
      <div className="plan-actions" style={{ marginTop: '15px' }}>
        {plan.status === 'active' && (
          <button
            className="btn btn-success btn-sm"
            onClick={() => onCheckIn(plan.id)}
          >
            打卡
          </button>
        )}
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsEditing(true)}
        >
          编辑
        </button>
        {plan.status === 'active' && (
          <button
            className="btn btn-warning btn-sm"
            onClick={() => handleStatusChange('paused')}
          >
            暂停
          </button>
        )}
        {plan.status === 'paused' && (
          <button
            className="btn btn-success btn-sm"
            onClick={() => handleStatusChange('active')}
          >
            继续
          </button>
        )}
        {plan.status !== 'completed' && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleStatusChange('completed')}
          >
            完成
          </button>
        )}
        {plan.status === 'completed' && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleStatusChange('active')}
          >
            重新开始
          </button>
        )}
        <button
          className="btn btn-danger btn-sm"
          onClick={handleDelete}
        >
          删除
        </button>
      </div>
    </div>
  )
}
