const BASE = '/api'

function getToken() {
  return localStorage.getItem('writely_token')
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : null

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`
    throw new Error(message)
  }
  return data
}

export const api = {
  signUp: (payload) => request('/auth/signup', { method: 'POST', body: payload, auth: false }),
  signIn: (payload) => request('/auth/signin', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),

  checkGrammar: (payload) => request('/grammar/check', { method: 'POST', body: payload }),
  paraphrase: (payload) => request('/paraphrase', { method: 'POST', body: payload }),
  styleAnalyze: (payload) => request('/style/analyze', { method: 'POST', body: payload }),

  uploadDocument: async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const token = getToken()
    const headers = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(`${BASE}/grammar/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })

    const isJson = res.headers.get('content-type')?.includes('application/json')
    const data = isJson ? await res.json() : null
    if (!res.ok) {
      throw new Error(data?.error || `Upload failed (${res.status})`)
    }
    return data
  },

  listHistory: () => request('/history'),
  deleteHistoryItem: (id) => request(`/history/${id}`, { method: 'DELETE' }),
}
