import { MapContainer, TileLayer } from 'react-leaflet'
import ReportMarker from './ReportMarker'
import { MAP_DEFAULTS } from '../config'
import '../leafletIcon'

function ReportsMap({ reports }) {
  // Reports that failed geocoding have no coordinates and can't be placed yet.
  const mappable = reports.filter((report) => report.latitude !== null && report.longitude !== null)

  return (
    <MapContainer
      center={MAP_DEFAULTS.center}
      zoom={MAP_DEFAULTS.zoom}
      scrollWheelZoom
      className="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mappable.map((report) => (
        <ReportMarker key={report.id} report={report} />
      ))}
    </MapContainer>
  )
}

export default ReportsMap
