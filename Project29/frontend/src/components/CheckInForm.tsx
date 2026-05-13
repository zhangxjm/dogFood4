import { useState } from 'react'
import type { StudyPlan } from '../types'

interface CheckInFormProps {
  plans: StudyPlan[]
  onSubmit: (data: { plan_id: number; check_in_date: string; notes: string }) => void
}

export function CheckInForm({ plans, onSubmit }: CheckInFormProps) {
  const [planId, setPlanId] = useState<number>(plans[0]?.id || 0)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const activePlans = plans.filter(p => p.status === 'active')

  if (activePlans.length === 0) {
    return (
      <div className="empty-state">
        <h3>暂无进行中的计划</h3>
        <p>请先创建一个学习计划</p>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!planId || !date) return
    onSubmit({ plan_id: planId, check_in_date: date, notes: notes.trim() })
    setNotes('')
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>今日打卡</h3>
      <div className="form-group">
        <label>选择计划</label>
        <select value={planId} onChange={e => setPlanId(Number(e.target.value))}>
          {activePlans.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>打卡日期</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>备注（可选）</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="今天学习了什么？有什么收获？"
        />
      </div>
      <button type="submit" className="btn btn-success">
        完成打卡 ✅
      </button>
    </form>
  )
}
