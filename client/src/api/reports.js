import { API_BASE_URL } from '../config'

export async function fetchApprovedReports() {
  const response = await fetch(`${API_BASE_URL}/api/reports`)

  if (!response.ok) {
    throw new Error('Could not load reports')
  }

  const body = await response.json()
  return body.data ?? []
}

export async function submitReport(report) {
  const response = await fetch(`${API_BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    const details = body.details ?? [body.error ?? 'Submission failed']
    throw new Error(details.join('\n'))
  }

  return body
}
