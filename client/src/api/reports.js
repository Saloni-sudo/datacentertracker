import { API_BASE_URL } from '../config'

export async function fetchApprovedReports(filters = {}) {
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value)
  ).toString()

  const response = await fetch(`${API_BASE_URL}/api/reports${query ? `?${query}` : ''}`)

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.details?.join('\n') ?? body.error ?? 'Could not load reports')
  }

  const body = await response.json()
  return body.data ?? []
}

// Sent as FormData so photos ride along; the browser sets the multipart boundary,
// so Content-Type must not be set by hand.
export async function submitReport(report, photos = []) {
  const form = new FormData()

  for (const [key, value] of Object.entries(report)) {
    form.append(key, value)
  }

  for (const photo of photos) {
    form.append('photos', photo)
  }

  const response = await fetch(`${API_BASE_URL}/api/reports`, {
    method: 'POST',
    body: form,
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    const details = body.details ?? [body.error ?? 'Submission failed']
    throw new Error(details.join('\n'))
  }

  return body
}

export async function fetchStats() {
  const response = await fetch(`${API_BASE_URL}/api/stats`)

  if (!response.ok) {
    throw new Error('Could not load stats')
  }

  const body = await response.json()
  return body.data
}
