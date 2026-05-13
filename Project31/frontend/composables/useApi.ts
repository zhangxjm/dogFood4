export const useApi = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const getAlbums = async () => {
    const response = await $fetch(apiBase + '/albums')
    return response
  }

  const getAlbum = async (id) => {
    const response = await $fetch(apiBase + '/albums/' + id)
    return response
  }

  const createAlbum = async (name, description) => {
    const response = await $fetch(apiBase + '/albums', {
      method: 'POST',
      body: { name, description }
    })
    return response
  }

  const deleteAlbum = async (id) => {
    await $fetch(apiBase + '/albums/' + id, {
      method: 'DELETE'
    })
  }

  const uploadPhotos = async (albumId, files) => {
    const formData = new FormData()
    formData.append('albumId', albumId)
    files.forEach(file => {
      formData.append('photos', file)
    })

    const response = await $fetch(apiBase + '/photos/upload', {
      method: 'POST',
      body: formData
    })
    return response
  }

  const deletePhoto = async (id) => {
    await $fetch(apiBase + '/photos/' + id, {
      method: 'DELETE'
    })
  }

  return {
    getAlbums,
    getAlbum,
    createAlbum,
    deleteAlbum,
    uploadPhotos,
    deletePhoto
  }
}
