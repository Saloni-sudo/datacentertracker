// Grey rules at the height of a real row, so nothing shifts when data lands.
function Skeleton({ rows = 3 }) {
  return (
    <ul className="skeleton" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="skeleton__row">
          <span className="skeleton__line skeleton__line--date" />
          <span className="skeleton__line skeleton__line--region" />
          <span className="skeleton__line skeleton__line--concern" />
          <span className="skeleton__line" />
        </li>
      ))}
    </ul>
  )
}

export default Skeleton
