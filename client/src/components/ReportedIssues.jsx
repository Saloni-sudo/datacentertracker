import { CONCERN_TYPES, concernLabel } from '../config'

function ReportedIssues({ byConcernType = [] }) {
  const counts = new Map(byConcernType.map((row) => [row.concern_type, row.count]))
  const max = Math.max(1, ...counts.values())

  return (
    <section className="section">
      <h2 className="section__title">Reported issues</h2>

      <ul className="bars">
        {CONCERN_TYPES.map((type) => {
          const count = counts.get(type.value) ?? 0

          return (
            <li key={type.value} className="bars__row">
              <span className="bars__label">{concernLabel(type.value)}</span>
              <span className="bars__track">
                <span className="bars__fill" style={{ width: `${(count / max) * 100}%` }} />
              </span>
              <span className="bars__value num">{count}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default ReportedIssues
