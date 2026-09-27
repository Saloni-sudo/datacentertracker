import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import ReportMarker from './ReportMarker'
import { MAP_DEFAULTS } from '../config'
import '../leafletIcon'
// Cluster bubbles and their spiderfy/zoom animations are unstyled without these.
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

function PanToSelected({ report }) {
  const map = useMap()

  useEffect(() => {
    if (report?.latitude && report?.longitude) {
      map.flyTo([Number(report.latitude), Number(report.longitude)], Math.max(map.getZoom(), 9))
    }
  }, [report, map])

  return null
}

function ReportsMap({ reports, selected, onSelect }) {
  // Reports that failed geocoding have no coordinates and can't be placed yet.
  const mappable = reports.filter((report) => report.latitude !== null && report.longitude !== null)

  return (
    <MapContainer
      center={MAP_DEFAULTS.center}
      zoom={MAP_DEFAULTS.zoom}
      scrollWheelZoom={false}
      className="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
        {mappable.map((report) => (
          <ReportMarker key={report.id} report={report} onSelect={onSelect} />
        ))}
      </MarkerClusterGroup>
      <PanToSelected report={selected} />
    </MapContainer>
  )
}

export default ReportsMap
