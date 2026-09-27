import { Marker } from 'react-leaflet'
import { documentedIcon, residentIcon } from '../leafletIcon'

function ReportMarker({ report, onSelect }) {
  return (
    <Marker
      position={[Number(report.latitude), Number(report.longitude)]}
      icon={report.source === 'documented_facility' ? documentedIcon : residentIcon}
      eventHandlers={{ click: () => onSelect(report) }}
    />
  )
}

export default ReportMarker
