import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { SITE_NAME } from '../config'

const NAV = [
  { to: '/', label: 'Explore map' },
  { to: '/reports', label: 'Reports' },
  { to: '/stats', label: 'Statistics' },
  { to: '/methodology', label: 'Methodology' },
]

function Header({ onSubmitClick }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link className="wordmark" to="/" onClick={() => setIsOpen(false)}>
          {/* The wordmark beside it already names the site, so the mark is decorative. */}
          <img className="wordmark__mark" src="/favicon.svg" alt="" width="24" height="24" />
          {SITE_NAME}
        </Link>

        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsOpen((open) => !open)}
        >
          ☰
        </button>

        <nav className={isOpen ? 'site-nav site-nav--open' : 'site-nav'}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'site-nav__link is-active' : 'site-nav__link')}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              setIsOpen(false)
              onSubmitClick()
            }}
          >
            Submit a report
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header
