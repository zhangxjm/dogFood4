const BASE_URL = ''

const request = async (options) => {
  const url = BASE_URL + options.url
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.header
    }
  }

  if (config.method !== 'GET' && options.data) {
    config.body = JSON.stringify(options.data)
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (response.ok) {
      if (data.code === 200) {
        return data
      } else {
        alert(data.message || '请求失败')
        throw data
      }
    } else {
      alert('网络错误')
      throw data
    }
  } catch (error) {
    if (error.message !== '请求失败' && error.message !== '网络错误') {
      alert('网络连接失败')
    }
    throw error
  }
}

export default request
