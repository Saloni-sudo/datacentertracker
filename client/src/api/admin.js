import { API_BASE_URL } from '../config'
import { clearToken, getToken } from '../auth/token'

export async function login(username, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.error ?? 'Login failed')
  }

  return body
}

// Single place that attaches the bearer token; a 401 means the token is gone or
// expired, so it's dropped and the caller can send the admin back to the login page.
async function authFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  })

  if (response.status === 401) {
    clearToken()
    throw new Error('Your session has expired. Please log in again.')
  }

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.error ?? 'Request failed')
  }

  return body
}

export async function fetchReportsByStatus(status) {
  const body = await authFetch(`/api/admin/reports?status=${encodeURIComponent(status)}`)
  return body.data ?? []
}

export async function updateReportStatus(id, status) {
  const body = await authFetch(`/api/admin/reports/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  return body.data
}
