// Empty by default: the Vite dev proxy forwards /api to the backend. Set
// VITE_API_BASE_URL to point at a deployed API instead.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

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

// Ask Cloudinary for a small, auto-formatted copy instead of the full-size upload.
export function thumbnailUrl(url, width = 300) {
  return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`)
}

export const MAP_DEFAULTS = {
  center: [39.5, -98.35], // continental US
  zoom: 4,
}
