import request from './index'

export function getOutboundRecords(params) {
  return request.get('/outbound', { params })
}

export function createOutbound(data) {
  return request.post('/outbound', data)
}

export function deleteOutbound(id) {
  return request.delete(`/outbound/${id}`)
}

export function getOutboundStatistics() {
  return request.get('/outbound/statistics')
}
