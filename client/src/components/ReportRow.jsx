import SourceCitation from './SourceCitation'
import { concernLabel, excerpt, photoAlt, shortDate, sourceLabel, thumbnailUrl } from '../config'

// One ledger line: date, region, concern, excerpt — columns on desktop, stacked on phones.
function ReportRow({ report, onSelect, showSourceLabel = false }) {
  const thumbnail = report.images?.[0]

  return (
    <li className="ledger__row">
      <span className="ledger__date num">{shortDate(report.created_at)}</span>

      <span className="ledger__region">{report.region || report.address}</span>

      <span className="ledger__concern">{concernLabel(report.concern_type)}</span>

      <span className="ledger__entry">
        {showSourceLabel && (
          <span
            className={
              report.source === 'documented_facility'
                ? 'label ledger__source ledger__source--documented'
                : 'label ledger__source'
            }
          >
            {sourceLabel(report.source)}
          </span>
        )}

        <span className="ledger__excerpt">
          {thumbnail ? (
            <img
              className="ledger__thumb"
              src={thumbnailUrl(thumbnail, 160)}
              alt={photoAlt(report)}
              loading="lazy"
            />
          ) : (
            <span className="ledger__thumb ledger__thumb--empty" aria-hidden="true" />
          )}

          <button type="button" className="ledger__link" onClick={() => onSelect(report)}>
            {excerpt(report.description, 130)}
          </button>
        </span>

        <SourceCitation report={report} />
      </span>
    </li>
  )
}

export default ReportRow
