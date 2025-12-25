import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import AuthModal from './AuthModal'
import LogoDisplay from './LogoDisplay'

export default function Header() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link to="/" className="logo-container" onClick={closeMobileMenu}>
              <div className="logo">COLINE CLEIREN</div>
              <div className="logo-subtitle">Couture et sur-mesure à Bordeaux</div>
            </Link>
            <LogoDisplay
              placement="header"
              style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
            />
          </div>

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
            {user ? (
              <>
                <Link to="/account" className="nav-link" onClick={closeMobileMenu}>Mon Compte</Link>
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
