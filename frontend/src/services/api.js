import axios from 'axios'

const api = axios.create({
  baseURL:         '/api',      // proxied to http://localhost:3001 in dev
  withCredentials: true,        // needed for session cookies
  timeout:         15_000,
})

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login:    (email, password) => api.post('/auth/login',    { email, password }),
  signup:   (data)            => api.post('/auth/signup',   data),
  logout:   ()                => api.post('/auth/logout'),
  me:       ()                => api.get('/auth/me'),
}

// ── Trades ────────────────────────────────────────────────────
export const tradesApi = {
  list:    (params) => api.get('/trades',       { params }),
  create:  (trade)  => api.post('/trades',       trade),
  update:  (id, d)  => api.patch(`/trades/${id}`, d),
  delete:  (id)     => api.delete(`/trades/${id}`),
  summary: ()       => api.get('/trades/summary'),
}

// ── Schwab / thinkorswim ──────────────────────────────────────
export const schwabApi = {
  // Returns the OAuth URL — redirect the browser to this
  getConnectUrl: () => '/api/auth/schwab/connect',
  sync:          () => api.post('/auth/schwab/sync'),
  disconnect:    () => api.post('/auth/schwab/disconnect'),
}

// ── Webull ────────────────────────────────────────────────────
export const webullApi = {
  getConnectUrl: () => '/api/auth/webull/connect',
  sync:          () => api.post('/auth/webull/sync'),
  disconnect:    () => api.post('/auth/webull/disconnect'),
}

// ── Status (broker connection state) ─────────────────────────
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

// ── Global error interceptor ──────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired — redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
