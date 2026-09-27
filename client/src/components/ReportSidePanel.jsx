import ReportThumbnails from './ReportThumbnails'
import SourceCitation from './SourceCitation'
import { concernLabel, formatDate, relativeDate, sourceLabel } from '../config'

// Reads as a record entry: source label, subject, then labelled fields.
function ReportSidePanel({ report, onClose }) {
  if (!report) {
    return (
      <aside className="record record--empty">
        <p className="record__hint">
          Select a marker on the map to read the record behind it.
        </p>
      </aside>
    )
  }

  const isDocumented = report.source === 'documented_facility'
  const hasPhotos = report.images?.length > 0

  return (
    <aside className="record">
      <div className="record__head">
        <p className={isDocumented ? 'label record__source record__source--documented' : 'label record__source'}>
          {sourceLabel(report.source)}
        </p>
        <button type="button" className="record__close" onClick={onClose} aria-label="Close record">
          ×
        </button>
      </div>

      <h2 className="record__title">{report.address}</h2>
      <p className="record__description">{report.description}</p>

      <dl className="record__fields">
        <dt className="label">Concern</dt>
        <dd>{concernLabel(report.concern_type)}</dd>

        <dt className="label">Region</dt>
        <dd>{report.region || '—'}</dd>

        <dt className="label">Reported</dt>
        <dd>
          <span className="num">{formatDate(report.created_at)}</span> ·{' '}
          {relativeDate(report.created_at)}
        </dd>
      </dl>

      {hasPhotos && (
        <div className="record__photos">
          <p className="label">Photo{report.images.length > 1 ? 's' : ''} submitted</p>
          <ReportThumbnails report={report} width={300} />
        </div>
      )}

      <SourceCitation report={report} />
    </aside>
  )
}

export default ReportSidePanel
