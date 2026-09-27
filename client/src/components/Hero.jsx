import { formatDate } from '../config'

function Hero({ lastUpdated }) {
  return (
    <section className="hero">
      <h1 className="hero__title">Data centers, seen by neighbors.</h1>
      <p className="hero__subtitle">
        A public record of resident observations, concerns, and evidence around local data-center
        development.
      </p>
      {lastUpdated && (
        <p className="hero__updated label">Updated {formatDate(lastUpdated)}</p>
      )}
    </section>
  )
}

export default Hero
