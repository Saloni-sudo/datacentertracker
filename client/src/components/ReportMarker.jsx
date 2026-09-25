import { Marker } from 'react-leaflet'
import ReportPopup from './ReportPopup'
import { documentedIcon, residentIcon } from '../leafletIcon'

function ReportMarker({ report }) {
  return (
    <Marker
      position={[Number(report.latitude), Number(report.longitude)]}
      icon={report.source === 'documented_facility' ? documentedIcon : residentIcon}
    >
      <ReportPopup report={report} />
    </Marker>
  )
}

export default ReportMarker
