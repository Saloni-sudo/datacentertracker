// Empty by default: the Vite dev proxy forwards /api to the backend. Set
// VITE_API_BASE_URL to point at a deployed API instead.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const SITE_NAME = 'Data Center Watch'
export const CONTACT_EMAIL = 'projectdatacenter04@gmail.com'
// TODO: replace with the real repository URL before launch.
export const GITHUB_REPO_URL = 'https://github.com/your-username/datacentertracker'
export const INSPIRATION_URL = 'https://brockovichdatacenter.com/'

export const DISCLAIMER = 'Unverified resident submission'
export const DOCUMENTED_LABEL = 'Publicly documented data center'

export function sourceLabel(source) {
  return source === 'documented_facility' ? DOCUMENTED_LABEL : DISCLAIMER
}

export const CONCERN_TYPES = [
  { value: 'water_usage', label: 'Water usage' },
  { value: 'utility_bills', label: 'Utility bills' },
  { value: 'noise', label: 'Noise' },
  { value: 'health', label: 'Health' },
  { value: 'other', label: 'Other' },
]

export const SOURCE_TYPES = [
  { value: 'documented_facility', label: 'Documented facility' },
  { value: 'resident_submission', label: 'Resident submission' },
]

export function concernLabel(value) {
  return CONCERN_TYPES.find((type) => type.value === value)?.label ?? value
}

export function sourceTypeLabel(value) {
  return SOURCE_TYPES.find((type) => type.value === value)?.label ?? value
}

export const PHOTO_LIMITS = { maxFiles: 3, maxBytes: 5 * 1024 * 1024 }

// Every image is served through a Cloudinary transformation, never the original
// upload: re-encoding strips EXIF metadata, which can carry the photographer's GPS
// location. Thumbnails and the full-size view both go through here.
export function imageUrl(url, width = 1600) {
  return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`)
}

export function thumbnailUrl(url, width = 300) {
  return imageUrl(url, width)
}

export function photoAlt(report) {
  const kind =
    report.source === 'documented_facility' ? 'a documented data center' : 'a resident report'
  const place = report.region || report.address

  return `Photo submitted with ${kind} about ${concernLabel(report.concern_type).toLowerCase()} in ${place}`
}

export const MAP_DEFAULTS = {
  center: [39.5, -98.35], // continental US
  zoom: 4,
}

export const SOURCE_COLORS = {
  resident_submission: '#b5402f',
  documented_facility: '#4a5561',
}

export function excerpt(text, max = 110) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

export function relativeDate(value) {
  const days = Math.floor((Date.now() - new Date(value)) / 86400000)

  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

export function shortDate(value) {
  return new Date(value).toISOString().slice(0, 10)
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
