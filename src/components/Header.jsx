import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useAdminStatus } from '../hooks/useAdminStatus'
import AuthModal from './AuthModal'
import LogoDisplay from './LogoDisplay'

export default function Header() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { isAdmin } = useAdminStatus()

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <>
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo-container" onClick={closeMobileMenu}>
            <div className="logo">COLINE CLEIREN</div>
            <div className="logo-subtitle">Couture et sur-mesure à Bordeaux</div>
          </Link>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={mobileMenuOpen ? 'open' : ''}></span>
            <span className={mobileMenuOpen ? 'open' : ''}></span>
            <span className={mobileMenuOpen ? 'open' : ''}></span>
          </button>

          <nav className={'nav ' + (mobileMenuOpen ? 'mobile-open' : '')}>
            <Link to="/" className="nav-link" onClick={closeMobileMenu}>Collection</Link>
            <Link to="/essayage" className="nav-link" onClick={closeMobileMenu}>L'Atelier</Link>
            <Link to="/contact" className="nav-link" onClick={closeMobileMenu}>Contact</Link>

            <LogoDisplay
              placement="header"
              style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
            />

            {user ? (
              <>
                {isAdmin ? (
                  <Link to="/admin" className="nav-link" onClick={closeMobileMenu}>Admin</Link>
                ) : (
                  <Link to="/account" className="nav-link" onClick={closeMobileMenu}>Mon Compte</Link>
                )}
                <button
                  onClick={() => {
                    signOut()
                    closeMobileMenu()
                  }}
                  className="btn-proposal"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setAuthModalOpen(true)
                  closeMobileMenu()
                }}
                className="btn-proposal"
              >
                Connexion
              </button>
            )}
          </nav>
        </div>
      </header>

      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={closeMobileMenu}
        />
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}
