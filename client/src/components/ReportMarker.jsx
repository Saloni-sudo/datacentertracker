import { Marker } from 'react-leaflet'
import ReportPopup from './ReportPopup'

function ReportMarker({ report }) {
  return (
    <Marker position={[Number(report.latitude), Number(report.longitude)]}>
      <ReportPopup report={report} />
    </Marker>
  )
}

export default ReportMarker
