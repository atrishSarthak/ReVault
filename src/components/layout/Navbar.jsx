import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import './Navbar.css'

/**
 * Navbar — fixed top navigation pill.
 *
 * Props:
 *   dark {boolean} — when true (Sheet 2 = light bg), apply .navbar--light
 *                    when false (Sheet 1 = dark bg), use default dark pill
 *
 * Default is false (dark pill) since Sheet 1 is now the dark screen.
 */
function Navbar({ dark = false }) {
    return (
        <nav
            className={`navbar${dark ? ' navbar--light' : ''}`}
            aria-label="Main navigation"
        >
            <div className="navbar__inner">
                {/* Logo */}
                <Link to="/" className="navbar__logo" aria-label="ReVault home">
                    <span className="navbar__logo-icon">◆</span>
                    <span className="navbar__logo-text">ReVault</span>
                </Link>

                {/* Nav links */}
                <ul className="navbar__links" role="list">
                    <li><Link to="/marketplace" className="navbar__link">Marketplace</Link></li>
                    <li><a href="#vault" className="navbar__link">Vault</a></li>
                    <li><a href="#about" className="navbar__link">About</a></li>
                </ul>

                {/* CTA / Auth */}
                <div className="navbar__auth">
                    <SignedOut>
                        <Link to="/sign-in" className="navbar__cta">
                            Sign In
                        </Link>
                    </SignedOut>
                    <SignedIn>
                        <Link to="/buyer" className="navbar__link" style={{ marginRight: '1rem', color: '#a1a1aa' }}>My Vault</Link>
                        <Link to="/seller" className="navbar__link" style={{ marginRight: '1rem' }}>Sell</Link>
                        <Link to="/admin" className="navbar__link" style={{ marginRight: '1rem', color: '#4ade80' }}>Queue</Link>
                        <UserButton />
                    </SignedIn>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
