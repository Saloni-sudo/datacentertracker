import { CONTACT_EMAIL } from '../config'

function PrivacyPage() {
  return (
    <div className="page">
      <section className="prose">
        <h1 className="prose__title">Privacy notice</h1>
        <p className="prose__lede">A plain-language notice, not a legal document.</p>

        <h2>What a submission collects</h2>
        <p>
          The address you report on, the concern type, your description, an optional region, and up
          to three optional photos. There is no name or email field, and the public site has no
          accounts — nothing asks who you are.
        </p>

        <h2>What becomes public</h2>
        <p>
          If a moderator approves your submission, everything in it becomes publicly visible: the
          address, the description, the region and any photos. Please keep personal details about
          individuals out of what you write.
        </p>

        <h2>Photos and metadata</h2>
        <p>
          Photos are stored on Cloudinary. Every image shown or linked on this site is delivered
          through a Cloudinary transformation, which re-encodes the file and strips embedded
          metadata such as EXIF GPS coordinates. The original upload is never linked directly.
        </p>

        <h2>IP addresses</h2>
        <p>
          Your IP address is used transiently to rate-limit submissions and login attempts, so the
          site can resist spam and password guessing. It is not stored alongside your report.
        </p>

        <h2>Removal</h2>
        <p>
          To have something taken down, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{' '}
          with the location and date of the report and what you would like removed.
        </p>
      </section>
    </div>
  )
}

export default PrivacyPage
