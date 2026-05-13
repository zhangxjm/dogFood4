import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export default {
  getOwners(params) {
    return api.get('/owners', { params })
  },
  getOwner(id) {
    return api.get(`/owners/${id}`)
  },
  createOwner(data) {
    return api.post('/owners', data)
  },
  updateOwner(id, data) {
    return api.put(`/owners/${id}`, data)
  },
  deleteOwner(id) {
    return api.delete(`/owners/${id}`)
  },

  getVehicles(params) {
    return api.get('/vehicles', { params })
  },
  getVehicle(id) {
    return api.get(`/vehicles/${id}`)
  },
  searchVehicleByPlate(plate) {
    return api.get('/vehicles/search', { params: { plate } })
  },
  createVehicle(data) {
    return api.post('/vehicles', data)
  },
  updateVehicle(id, data) {
    return api.put(`/vehicles/${id}`, data)
  },
  deleteVehicle(id) {
    return api.delete(`/vehicles/${id}`)
  },

  getParkingSpots(params) {
    return api.get('/parking-spots', { params })
  },
  getParkingSpot(id) {
    return api.get(`/parking-spots/${id}`)
  },
  createParkingSpot(data) {
    return api.post('/parking-spots', data)
  },
  updateParkingSpot(id, data) {
    return api.put(`/parking-spots/${id}`, data)
  },
  deleteParkingSpot(id) {
    return api.delete(`/parking-spots/${id}`)
  },

  health() {
    return api.get('/health')
  }
}
