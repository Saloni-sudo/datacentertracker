import { CONTACT_EMAIL } from '../config'

function CorrectionsPage() {
  return (
    <div className="page">
      <section className="prose">
        <h1 className="prose__title">Request a correction or removal</h1>
        <p>
          If something published here is wrong, out of date, or should not be public, email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <h2>What to include</h2>
        <ul>
          <li>The location shown on the report, and the date it was reported.</li>
          <li>What is wrong, or what you would like removed.</li>
          <li>A source or correction, if you have one.</li>
        </ul>

        <p>
          Documented sites carry a source link; if the underlying source is the problem, say so and
          it can be re-checked or dropped. Resident submissions can be removed entirely on request
          from the person who submitted them or from someone the report affects.
        </p>
      </section>
    </div>
  )
}

export default CorrectionsPage
