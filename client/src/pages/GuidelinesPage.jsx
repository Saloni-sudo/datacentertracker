function GuidelinesPage() {
  return (
    <div className="page">
      <section className="prose">
        <h1 className="prose__title">Content guidelines</h1>
        <p className="prose__lede">A plain-language notice, not a legal document.</p>

        <h2>What makes a good report</h2>
        <p>
          Describe what you have observed yourself: what you saw, heard, smelled or were billed, and
          roughly when. Concrete first-hand detail is more useful than general opinion.
        </p>

        <h2>Please do not include</h2>
        <ul>
          <li>Personal attacks, or accusations aimed at named individuals.</li>
          <li>
            Personal data about other people — names, addresses, phone numbers, licence plates or
            faces.
          </li>
          <li>Photographs you did not take yourself, or images you do not have the right to share.</li>
        </ul>

        <h2>Moderation</h2>
        <p>
          Every submission is reviewed before publication, and moderators may reject or remove
          anything that breaks these guidelines. Review is a check on content, not a verification of
          the facts in a report.
        </p>
      </section>
    </div>
  )
}

export default GuidelinesPage
