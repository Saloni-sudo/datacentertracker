import L from 'leaflet'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import { SOURCE_COLORS } from './config'

// Leaflet builds its default icon paths from the CSS location, which bundlers break.
// Deleting _getIconUrl stops it prefixing that guessed path onto the URLs Vite
// resolves from these imports; without it the pin images 404.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

function pinIcon(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 38" width="26" height="38">
    <path d="M13 0C5.8 0 0 5.8 0 13c0 9.2 11.3 23.4 11.8 24a1.6 1.6 0 0 0 2.4 0C14.7 36.4 26 22.2 26 13 26 5.8 20.2 0 13 0z" fill="${color}"/>
    <circle cx="13" cy="13" r="5" fill="#f7f5f0"/>
  </svg>`

  return L.icon({
    iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    iconSize: [26, 38],
    iconAnchor: [13, 38],
    popupAnchor: [0, -34]
  })
}

export const residentIcon = pinIcon(SOURCE_COLORS.resident_submission)
export const documentedIcon = pinIcon(SOURCE_COLORS.documented_facility)
