import request from './index'

export function getInboundRecords(params) {
  return request.get('/inbound', { params })
}

export function createInbound(data) {
  return request.post('/inbound', data)
}

export function deleteInbound(id) {
  return request.delete(`/inbound/${id}`)
}

export function getInboundStatistics() {
  return request.get('/inbound/statistics')
}
