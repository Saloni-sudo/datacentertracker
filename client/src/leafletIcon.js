import L from 'leaflet'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

// Leaflet builds its default icon paths from the CSS location, which bundlers break.
// Deleting _getIconUrl stops it prefixing that guessed path onto the URLs Vite
// resolves from these imports; without it the pin images 404.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

// Two pins so the sources are distinguishable at a glance; the popup label is what
// actually states which is which.
export const residentIcon = new L.Icon.Default()
export const documentedIcon = new L.Icon.Default({ className: 'marker--documented' })
