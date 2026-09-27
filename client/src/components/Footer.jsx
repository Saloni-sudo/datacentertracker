import { Link } from 'react-router-dom'
import { CONTACT_EMAIL, GITHUB_REPO_URL, SITE_NAME, formatDate } from '../config'

function Footer({ lastUpdated, onSubmitClick }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <p className="wordmark wordmark--small">{SITE_NAME}</p>
          <p className="site-footer__note">
            An independent student project. Not affiliated with any company or government body.
          </p>
        </div>

        <nav className="site-footer__col" aria-label="Explore">
          <h2 className="site-footer__heading">Explore</h2>
          <Link to="/">Map</Link>
          <Link to="/reports">Reports</Link>
          <Link to="/stats">Statistics</Link>
          <button type="button" className="site-footer__linkbutton" onClick={onSubmitClick}>
            Submit a report
          </button>
        </nav>

        <nav className="site-footer__col" aria-label="About">
          <h2 className="site-footer__heading">About</h2>
          <Link to="/about">About the project</Link>
          <Link to="/methodology">Methodology</Link>
          <Link to="/methodology#data-sources">Data sources</Link>
        </nav>

        <nav className="site-footer__col" aria-label="Trust and policies">
          <h2 className="site-footer__heading">Trust &amp; policies</h2>
          <Link to="/privacy">Privacy notice</Link>
          <Link to="/guidelines">Content guidelines</Link>
          <Link to="/corrections">Request a correction or removal</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
        </nav>
      </div>

      <div className="site-footer__bottom">
        <span>© 2026 {SITE_NAME}</span>
        <span>
          Map data ©{' '}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
            OpenStreetMap
          </a>{' '}
          contributors
        </span>
        <span>
          Search by{' '}
          <a href="https://locationiq.com" target="_blank" rel="noopener noreferrer">
            LocationIQ
          </a>
        </span>
        <span>Photos hosted on Cloudinary</span>
        <span>
          <a href="https://github.com/Saloni-sudo/datacentertracker" target="_blank" rel="noopener noreferrer">
           Source code on GitHub
          </a>
        </span>
        {lastUpdated && <span>Updated {formatDate(lastUpdated)}</span>}
      </div>
    </footer>
  )
}

export default Footer
