import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useAdminStatus } from '../hooks/useAdminStatus'
import AuthModal from './AuthModal'

export default function Header() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { isAdmin } = useAdminStatus()
  const location = useLocation()

  const close = () => setMobileMenuOpen(false)

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <>
      <header className="header">
        <div className="header-content">

          {/* Gauche — navigation principale */}
          <nav className={'nav ' + (mobileMenuOpen ? 'mobile-open' : '')}>
            <Link to="/"               className={'nav-link ' + (isActive('/')               ? 'active' : '')} onClick={close}>Collection</Link>
            <Link to="/la-creatrice"   className={'nav-link ' + (isActive('/la-creatrice')   ? 'active' : '')} onClick={close}>La créatrice</Link>
            <Link to="/essayage"       className={'nav-link ' + (isActive('/essayage')       ? 'active' : '')} onClick={close}>L'Atelier</Link>
            <Link to="/contact"        className={'nav-link ' + (isActive('/contact')        ? 'active' : '')} onClick={close}>Contact</Link>

            {/* Auth dans le menu mobile */}
            {user ? (
              <>
                {isAdmin
                  ? <Link to="/admin" className="nav-link" onClick={close}>Admin</Link>
                  : <Link to="/account" className="nav-link" onClick={close}>Mon compte</Link>
                }
                <button className="btn-proposal" onClick={() => { signOut(); close() }}>
                  Déconnexion
                </button>
              </>
            ) : (
              <button className="btn-proposal" onClick={() => { setAuthModalOpen(true); close() }}>
                Connexion
              </button>
            )}
          </nav>

          {/* Centre — logo */}
          <Link to="/" className="logo-container" onClick={close}>
            <div className="logo">Coline Cleiren</div>
            <div className="logo-subtitle">Couture · Bordeaux</div>
          </Link>

          {/* Droite — actions */}
          <div className="nav-right">
            <Link to="/contact" className="nav-link">Prendre rendez-vous</Link>

            {user ? (
              <>
                {isAdmin
                  ? <Link to="/admin" className="nav-link">Admin</Link>
                  : <Link to="/account" className="nav-link">Mon compte</Link>
                }
                <button className="btn-proposal" onClick={signOut}>Déconnexion</button>
              </>
            ) : (
              <button className="btn-proposal" onClick={() => setAuthModalOpen(true)}>
                Connexion
              </button>
            )}
          </div>

          {/* Burger mobile */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            style={{ gridColumn: 3, justifySelf: 'end' }}
          >
            <span className={mobileMenuOpen ? 'open' : ''} />
            <span className={mobileMenuOpen ? 'open' : ''} />
            <span className={mobileMenuOpen ? 'open' : ''} />
          </button>

        </div>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={close} />
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}
