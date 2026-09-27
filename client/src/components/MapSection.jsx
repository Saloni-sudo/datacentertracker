import ReportsMap from './ReportsMap'
import SourceToggle from './SourceToggle'
import MapLegend from './MapLegend'
import ReportSidePanel from './ReportSidePanel'
import TrustNote from './TrustNote'

function MapSection({
  reports,
  isLoading,
  error,
  sources,
  onToggleSource,
  filters,
  onFilterChange,
  selected,
  onSelect,
}) {
  return (
    <section className="mapsection" id="map">
      <SourceToggle filters={filters} onFilterChange={onFilterChange} resultCount={reports.length} />

      {error && <p className="notice notice--error">{error}</p>}

      <div className="mapsection__body">
        <div className="mapsection__mapcol">
          <div className="mapsection__map">
            {isLoading && <p className="mapsection__status label">Loading reports…</p>}
            {!isLoading && reports.length === 0 && (
              <p className="mapsection__status label">No reports match these filters</p>
            )}
            <ReportsMap reports={reports} selected={selected} onSelect={onSelect} />
          </div>

          <div className="mapsection__under">
            <MapLegend sources={sources} onToggleSource={onToggleSource} />
            <TrustNote />
          </div>
        </div>

        <ReportSidePanel report={selected} onClose={() => onSelect(null)} />
      </div>
    </section>
  )
}

export default MapSection
