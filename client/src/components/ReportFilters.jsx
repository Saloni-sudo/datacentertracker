import { CONCERN_TYPES, SOURCE_TYPES } from '../config'

function ReportFilters({ filters, onChange, resultCount }) {
  function handleChange(event) {
    const { name, value } = event.target
    onChange({ ...filters, [name]: value })
  }

  const hasFilters = Boolean(filters.concern_type || filters.source || filters.region)

  return (
    <div className="filters">
      <label className="filters__field">
        <span>Concern</span>
        <select name="concern_type" value={filters.concern_type} onChange={handleChange}>
          <option value="">All concerns</option>
          {CONCERN_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>

      <label className="filters__field">
        <span>Source</span>
        <select name="source" value={filters.source} onChange={handleChange}>
          <option value="">All sources</option>
          {SOURCE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>

      <label className="filters__field">
        <span>Region</span>
        <input
          name="region"
          value={filters.region}
          onChange={handleChange}
          placeholder="e.g. Loudoun"
        />
      </label>

      <p className="filters__count">
        {resultCount} shown
        {hasFilters && (
          <button
            type="button"
            className="filters__clear"
            onClick={() => onChange({ concern_type: '', source: '', region: '' })}
          >
            Clear
          </button>
        )}
      </p>
    </div>
  )
}

export default ReportFilters
