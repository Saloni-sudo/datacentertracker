import { CONTACT_EMAIL, INSPIRATION_URL, SITE_NAME } from '../config'

function AboutPage() {
  return (
    <div className="page">
      <section className="prose">
        <h1 className="prose__title">About the project</h1>
        <p className="prose__lede">A plain-language notice, not a legal document.</p>

        <p>
          {SITE_NAME} is an independent student project. It was built to explore how residents
          experience data-center development in their own neighbourhoods, and to practise building a
          full-stack application around real, messy public information.
        </p>

        <p>
          It is not affiliated with any company, government body, or with the Erin Brockovich AI Data
          Center Reporting site, which inspired this project. You can find that separate site at{' '}
          <a href={INSPIRATION_URL} target="_blank" rel="noopener noreferrer">
            brockovichdatacenter.com ↗
          </a>
          .
        </p>

        <p>
          Two kinds of entry appear here and they are never merged: documented sites, seeded from
          published reporting with a source link on each one, and resident submissions, which are
          moderated but unverified accounts from individual people.
        </p>

        <p>
          Questions or corrections: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </section>
    </div>
  )
}

export default AboutPage
