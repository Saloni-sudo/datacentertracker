import { DISCLAIMER, DOCUMENTED_LABEL, SOURCE_COLORS } from '../config'

const ENTRIES = [
  { key: 'documented_facility', color: SOURCE_COLORS.documented_facility, label: DOCUMENTED_LABEL },
  { key: 'resident_submission', color: SOURCE_COLORS.resident_submission, label: DISCLAIMER },
]

// A printed-map key: marker swatch, then the same labels used everywhere else.
function MapLegend({ sources, onToggleSource }) {
  return (
    <div className="mapkey">
      <p className="mapkey__title label">Key</p>

      {ENTRIES.map((entry) => (
        <label key={entry.key} className="mapkey__row">
          <input
            type="checkbox"
            checked={sources[entry.key]}
            onChange={() => onToggleSource(entry.key)}
          />
          <span className="mapkey__swatch" style={{ background: entry.color }} aria-hidden="true" />
          <span className="mapkey__label">{entry.label}</span>
        </label>
      ))}
    </div>
  )
}

export default MapLegend
