import { CONCERN_TYPES } from '../config'

// Filters sit on one ruled line above the map; the source checkboxes live in the key.
function SourceToggle({ filters, onFilterChange, resultCount }) {
  return (
    <div className="maptools">
      <label className="maptools__field">
        <span className="label">Concern</span>
        <select
          value={filters.concern_type}
          onChange={(event) => onFilterChange({ ...filters, concern_type: event.target.value })}
        >
          <option value="">All concerns</option>
          {CONCERN_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>

      <label className="maptools__field">
        <span className="label">Region</span>
        <input
          value={filters.region}
          onChange={(event) => onFilterChange({ ...filters, region: event.target.value })}
        />
      </label>

      <p className="maptools__count">
        <span className="num">{resultCount}</span> shown
      </p>
    </div>
  )
}

export default SourceToggle
