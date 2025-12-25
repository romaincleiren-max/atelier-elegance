import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import AuthModal from './AuthModal'

export default function Header() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { user, signOut } = useAuth()

  return (
    <>
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo-container">
            <div className="logo">COLINE CLEIREN</div>
            <div className="logo-subtitle">Couture et sur-mesure à Bordeaux</div>
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">Collection</Link>
            <Link to="/essayage" className="nav-link">L'Atelier</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            {user ? (
              <>
                <Link to="/account" className="nav-link">Mon Compte</Link>
                <button onClick={signOut} className="btn-proposal">
                  Déconnexion
                </button>
              </>
            ) : (
              <button onClick={() => setAuthModalOpen(true)} className="btn-proposal">
                Connexion
              </button>
            )}
          </nav>
        </div>
      </header>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}
