import request from './index'

export function getAlerts(params) {
  return request.get('/alerts', { params })
}

export function getUnreadAlertCount() {
  return request.get('/alerts/unread-count')
}

export function markAlertRead(id) {
  return request.put(`/alerts/${id}/read`)
}

export function markAllAlertsRead() {
  return request.put('/alerts/read-all')
}

export function deleteAlert(id) {
  return request.delete(`/alerts/${id}`)
}
