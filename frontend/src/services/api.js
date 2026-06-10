import axios from 'axios'

// In production (Netlify) VITE_API_URL points to your Render backend.
// In development it proxies through Vite to localhost:3001.
const BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL:         BASE,
  withCredentials: true,
  timeout:         15_000,
})

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login:   (email, password) => api.post('/auth/login',  { email, password }),
  signup:  (data)            => api.post('/auth/signup', data),
  logout:  ()                => api.post('/auth/logout'),
  me:      ()                => api.get('/auth/me'),
}

// ── Trades ────────────────────────────────────────────────────
export const tradesApi = {
  list:    (params) => api.get('/trades',         { params }),
  create:  (trade)  => api.post('/trades',          trade),
  update:  (id, d)  => api.patch(`/trades/${id}`,   d),
  delete:  (id)     => api.delete(`/trades/${id}`),
  summary: ()       => api.get('/trades/summary'),
}

// ── Broker — thinkorswim ──────────────────────────────────────
export const schwabApi = {
  getConnectUrl: () => `${BASE}/auth/schwab/connect`,
  sync:          () => api.post('/auth/schwab/sync'),
  disconnect:    () => api.post('/auth/schwab/disconnect'),
}

// ── Broker — Webull ───────────────────────────────────────────
export const webullApi = {
  getConnectUrl: () => `${BASE}/auth/webull/connect`,
  sync:          () => api.post('/auth/webull/sync'),
  disconnect:    () => api.post('/auth/webull/disconnect'),
}

// ── Status ────────────────────────────────────────────────────
export const statusApi = {
  get: () => api.get('/status'),
}

// ── CSV import ────────────────────────────────────────────────
export const csvApi = {
  upload: (file, broker) => {
    const form = new FormData()
    form.append('file',   file)
    form.append('broker', broker || 'auto')
    return api.post('/import/csv/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ── Global error handler ──────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) window.location.href = '/login'
    return Promise.reject(err)
  }
)

export default api
