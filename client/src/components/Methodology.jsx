import { CONTACT_EMAIL, DISCLAIMER } from '../config'

// The sources behind the seeded documented sites, linked from the footer as well.
const DATA_SOURCES = [
  {
    name: 'Loudoun County, VA',
    url: 'https://www.loudoun.gov/6408/Data-Centers-The-Loudoun-Story',
    covers: 'Ashburn, VA',
  },
  {
    name: 'LSARS',
    url: 'https://www.lsars.com/data-centers/loudoun-county',
    covers: 'Sterling, VA',
  },
  {
    name: 'AGU Advances (Privette, 2026)',
    url: 'https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2025AV002140',
    covers: 'The Dalles, OR · Council Bluffs, IA · Memphis, TN',
  },
  {
    name: 'Bloomberg',
    url: 'https://www.bloomberg.com/graphics/2025-ai-impacts-data-centers-water-data/',
    covers: 'Abilene, TX',
  },
  {
    name: 'Quartz',
    url: 'https://qz.com/data-center-water-use-drought-american-west-051326',
    covers: 'Bluffdale, UT · Newton County, GA',
  },
  {
    name: 'Wikipedia, “Opposition to AI data centers”',
    url: 'https://en.wikipedia.org/wiki/Opposition_to_AI_data_centers',
    covers: 'Fort Worth, TX',
  },
]

function Methodology() {
  return (
    <section className="prose">
      <h1 className="prose__title">Methodology</h1>
      <p className="prose__lede">A plain-language notice, not a legal document.</p>

      <h2>Where the data comes from</h2>
      <p>
        Documented sites are seeded from publicly reported information and located at city or campus
        level, so their pins can be approximate rather than exact addresses. Each one links to the
        source it came from.
      </p>
      <p>
        Resident submissions are geocoded from the address the submitter provides. Where an address
        cannot be resolved, the report is still kept but has no pin on the map.
      </p>
      <p>
        Every resident submission is reviewed by a moderator before it appears publicly. Nothing
        submitted through this site is published automatically.
      </p>

      <h2 id="data-sources">Data sources</h2>
      <p>The documented sites on the map come from these published sources:</p>
      <ul>
        {DATA_SOURCES.map((source) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.name} ↗
            </a>{' '}
            — {source.covers}
          </li>
        ))}
      </ul>

      <h2>Disclaimer</h2>
      <p>
        Resident submissions are unverified. They reflect what individual residents report observing
        and are not confirmed facts. Reviewed does not mean verified. Each one is labelled &ldquo;
        {DISCLAIMER}&rdquo; wherever it appears, and documented sites are labelled separately so the
        two are never conflated.
      </p>

      <h2>Contact</h2>
      <p>
        Corrections and questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </section>
  )
}

export default Methodology
