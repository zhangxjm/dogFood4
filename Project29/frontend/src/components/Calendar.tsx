import { useState, useEffect } from 'react'
import { checkinsApi } from '../api'
import type { CalendarDay, StudyPlan, CheckIn } from '../types'

interface CalendarProps {
  plans: StudyPlan[]
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

export function Calendar({ plans }: CalendarProps) {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1)
  const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>(undefined)
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedCheckIns, setSelectedCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCalendar()
  }, [currentYear, currentMonth, selectedPlanId])

  async function loadCalendar() {
    setLoading(true)
    try {
      const data = await checkinsApi.getCalendar(currentYear, currentMonth, selectedPlanId)
      setCalendarDays(data)
    } catch (err) {
      console.error('Failed to load calendar:', err)
    }
    setLoading(false)
  }

  async function handleDayClick(dateStr: string) {
    setSelectedDate(dateStr)
    try {
      let checkins = await checkinsApi.getByDate(dateStr)
      if (selectedPlanId) {
        checkins = checkins.filter(c => c.plan_id === selectedPlanId)
      }
      setSelectedCheckIns(checkins)
    } catch (err) {
      console.error('Failed to load check-ins:', err)
    }
  }

  function prevMonth() {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  function nextMonth() {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
  }

  function goToToday() {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth() + 1)
  }

  function renderCalendarGrid() {
    const firstDay = new Date(currentYear, currentMonth - 1, 1)
    const lastDay = new Date(currentYear, currentMonth, 0)
    const days: { date: string; dayNum: number; isCurrentMonth: boolean }[] = []

    const startOffset = firstDay.getDay()
    for (let i = 0; i < startOffset; i++) {
      const d = new Date(currentYear, currentMonth - 1, -startOffset + 1 + i)
      days.push({
        date: d.toISOString().split('T')[0],
        dayNum: d.getDate(),
        isCurrentMonth: false
      })
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(currentYear, currentMonth - 1, i)
      days.push({
        date: d.toISOString().split('T')[0],
        dayNum: i,
        isCurrentMonth: true
      })
    }

    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth, i)
      days.push({
        date: d.toISOString().split('T')[0],
        dayNum: d.getDate(),
        isCurrentMonth: false
      })
    }

    return days
  }

  function getDayInfo(dateStr: string) {
    return calendarDays.find(d => d.date === dateStr)
  }

  function isToday(dateStr: string) {
    return dateStr === today.toISOString().split('T')[0]
  }

  function getPlanTitle(planId: number) {
    return plans.find(p => p.id === planId)?.title || `计划 #${planId}`
  }

  const calendarDaysGrid = renderCalendarGrid()

  return (
    <div>
      <div className="filter-section" style={{ marginBottom: '20px' }}>
        <label>筛选计划：</label>
        <select
          value={selectedPlanId || ''}
          onChange={e => setSelectedPlanId(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">全部计划</option>
          {plans.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <div className="calendar-header">
        <h2>{currentYear}年 {MONTHS[currentMonth - 1]}</h2>
        <div className="calendar-nav">
          <button className="btn btn-secondary" onClick={prevMonth}>← 上月</button>
          <button className="btn btn-primary" onClick={goToToday}>今天</button>
          <button className="btn btn-secondary" onClick={nextMonth}>下月 →</button>
        </div>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="calendar">
          {WEEKDAYS.map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
          {calendarDaysGrid.map((day, idx) => {
            const info = getDayInfo(day.date)
            const classes = ['calendar-day']
            if (!day.isCurrentMonth) classes.push('other-month')
            if (info?.has_check_in) classes.push('checked')
            if (isToday(day.date)) classes.push('today')

            return (
              <div
                key={idx}
                className={classes.join(' ')}
                onClick={() => day.isCurrentMonth && handleDayClick(day.date)}
                title={day.isCurrentMonth ? day.date : ''}
              >
                <span className="calendar-day-number">{day.dayNum}</span>
                {info?.has_check_in && <span className="calendar-day-dot"></span>}
              </div>
            )
          })}
        </div>
      )}

      {selectedDate && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>
            {selectedDate} 的打卡记录
            <button
              className="btn btn-sm btn-secondary"
              style={{ marginLeft: '10px' }}
              onClick={() => setSelectedDate(null)}
            >
              关闭
            </button>
          </h3>
          {selectedCheckIns.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              当天没有打卡记录
            </div>
          ) : (
            <div className="checkins-list">
              {selectedCheckIns.map(checkin => (
                <div key={checkin.id} className="checkin-item">
                  <div className="checkin-item-header">
                    <strong>{getPlanTitle(checkin.plan_id)}</strong>
                    <span className="checkin-item-date">{checkin.check_in_date}</span>
                  </div>
                  {checkin.notes && (
                    <div className="checkin-item-notes">{checkin.notes}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
