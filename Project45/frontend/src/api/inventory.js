import request from './index'

export function getInventoryList(params) {
  return request.get('/inventory', { params })
}

export function getInventoryStatistics() {
  return request.get('/inventory/statistics')
}

export function getTransactionStatistics() {
  return request.get('/inventory/transactions')
}

export function getAllRecords(params) {
  return request.get('/inventory/records', { params })
}
