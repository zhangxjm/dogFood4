import { useState } from 'react'
import type { PlanStatus } from '../types'

interface PlanFormProps {
  onSubmit: (data: { title: string; description: string; status: PlanStatus }) => void
  initialData?: { title: string; description: string; status: PlanStatus }
  onCancel?: () => void
}

export function PlanForm({ onSubmit, initialData, onCancel }: PlanFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [status, setStatus] = useState<PlanStatus>(initialData?.status || 'active')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({ title: title.trim(), description: description.trim(), status })
    if (!initialData) {
      setTitle('')
      setDescription('')
      setStatus('active')
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>{initialData ? '编辑计划' : '添加学习计划'}</h3>
      <div className="form-group">
        <label>计划标题</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="例如：学习 Python"
          required
        />
      </div>
      <div className="form-group">
        <label>描述（可选）</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="详细描述你的学习计划..."
        />
      </div>
      <div className="form-group">
        <label>状态</label>
        <select value={status} onChange={e => setStatus(e.target.value as PlanStatus)}>
          <option value="active">进行中</option>
          <option value="paused">暂停</option>
          <option value="completed">已完成</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" className="btn btn-primary">
          {initialData ? '保存' : '创建计划'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            取消
          </button>
        )}
      </div>
    </form>
  )
}
