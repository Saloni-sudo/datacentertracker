const STORAGE_KEY = 'dct_admin_token'

// Stored in localStorage so a refresh doesn't log the admin out. The tradeoff: it's
// readable by any JS on the page, so an XSS bug would expose it. In-memory storage
// would avoid that but log the admin out on every reload.
export function getToken() {
  return localStorage.getItem(STORAGE_KEY)
}

export function setToken(token) {
  localStorage.setItem(STORAGE_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEY)
}
