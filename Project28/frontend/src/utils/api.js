const BASE_URL = '/api'

const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(res.data)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

export const getPets = () => request({ url: '/pets' })
export const getPet = (id) => request({ url: `/pets/${id}` })
export const createPet = (data) => request({ url: '/pets', method: 'POST', data })
export const updatePet = (id, data) => request({ url: `/pets/${id}`, method: 'PUT', data })
export const deletePet = (id) => request({ url: `/pets/${id}`, method: 'DELETE' })
export const searchPets = (keyword) => request({ url: `/pets/search?keyword=${keyword}` })

export const getOwners = () => request({ url: '/owners' })
export const getOwner = (id) => request({ url: `/owners/${id}` })
export const createOwner = (data) => request({ url: '/owners', method: 'POST', data })
export const updateOwner = (id, data) => request({ url: `/owners/${id}`, method: 'PUT', data })
export const deleteOwner = (id) => request({ url: `/owners/${id}`, method: 'DELETE' })

export const getVaccines = (petId) => {
  const url = petId ? `/vaccines?pet_id=${petId}` : '/vaccines'
  return request({ url })
}
export const getVaccine = (id) => request({ url: `/vaccines/${id}` })
export const createVaccine = (data) => request({ url: '/vaccines', method: 'POST', data })
export const updateVaccine = (id, data) => request({ url: `/vaccines/${id}`, method: 'PUT', data })
export const deleteVaccine = (id) => request({ url: `/vaccines/${id}`, method: 'DELETE' })
