const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return 'http://localhost:4001/api'
  }
  return process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api'
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(error.error || '请求失败')
  }
  return response.json()
}

export const api = {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(`${getBaseURL()}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return handleResponse(response)
  },

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${getBaseURL()}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    })
    return handleResponse(response)
  },

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${getBaseURL()}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    })
    return handleResponse(response)
  },

  async delete<T>(url: string): Promise<T> {
    const response = await fetch(`${getBaseURL()}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return handleResponse(response)
  }
}
