export type PlanStatus = 'active' | 'completed' | 'paused'

export interface StudyPlan {
  id: number
  title: string
  description: string | null
  status: PlanStatus
  created_at: string
  updated_at: string
  total_check_ins: number
}

export interface CheckIn {
  id: number
  plan_id: number
  check_in_date: string
  notes: string | null
  created_at: string
}

export interface CalendarDay {
  date: string
  has_check_in: boolean
  check_in_ids: number[]
}
