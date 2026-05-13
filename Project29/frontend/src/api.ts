import axios from 'axios'
import type { StudyPlan, CheckIn, CalendarDay, PlanStatus } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
})

export const plansApi = {
  getAll: (): Promise<StudyPlan[]> => api.get('/api/plans').then(res => res.data),
  get: (id: number): Promise<StudyPlan> => api.get(`/api/plans/${id}`).then(res => res.data),
  create: (data: { title: string; description?: string; status?: PlanStatus }): Promise<StudyPlan> => 
    api.post('/api/plans', data).then(res => res.data),
  update: (id: number, data: { title?: string; description?: string; status?: PlanStatus }): Promise<StudyPlan> => 
    api.put(`/api/plans/${id}`, data).then(res => res.data),
  delete: (id: number): Promise<void> => api.delete(`/api/plans/${id}`),
}

export const checkinsApi = {
  create: (data: { plan_id: number; check_in_date: string; notes?: string }): Promise<CheckIn> => 
    api.post('/api/checkins', data).then(res => res.data),
  getByPlan: (planId: number): Promise<CheckIn[]> => 
    api.get(`/api/checkins/plan/${planId}`).then(res => res.data),
  getByDate: (date: string): Promise<CheckIn[]> => 
    api.get(`/api/checkins/date/${date}`).then(res => res.data),
  getCalendar: (year: number, month: number, planId?: number): Promise<CalendarDay[]> => 
    api.get(`/api/checkins/calendar/${year}/${month}`, { params: { plan_id: planId } }).then(res => res.data),
  update: (id: number, data: { notes?: string }): Promise<CheckIn> => 
    api.put(`/api/checkins/${id}`, data).then(res => res.data),
  delete: (id: number): Promise<void> => api.delete(`/api/checkins/${id}`),
}
