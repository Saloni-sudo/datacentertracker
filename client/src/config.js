// Empty by default: the Vite dev proxy forwards /api to the backend. Set
// VITE_API_BASE_URL to point at a deployed API instead.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const DISCLAIMER = 'Unverified resident submission'

export const CONCERN_TYPES = [
  { value: 'water_usage', label: 'Water usage' },
  { value: 'utility_bills', label: 'Utility bills' },
  { value: 'noise', label: 'Noise' },
  { value: 'health', label: 'Health' },
  { value: 'other', label: 'Other' },
]

export function concernLabel(value) {
  return CONCERN_TYPES.find((type) => type.value === value)?.label ?? value
}

export const MAP_DEFAULTS = {
  center: [39.5, -98.35], // continental US
  zoom: 4,
}
