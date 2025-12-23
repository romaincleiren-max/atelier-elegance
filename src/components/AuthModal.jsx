import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function AuthModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const { signIn, signUp } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password)
        if (error) throw error
        setSuccess('Compte créé ! Vérifiez votre email pour confirmer.')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        setSuccess('Connexion réussie !')
        setTimeout(() => onClose(), 1500)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal active" onClick={(e) => e.target.className === 'modal active' && onClose()}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-body">
          <h2 className="dress-title" style={{ marginBottom: '2rem' }}>
            {isSignUp ? 'Créer un compte' : 'Connexion'}
          </h2>

          <form className="proposal-form" onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '1rem',
                marginBottom: '1rem',
                background: '#fee',
                color: '#c00',
                borderRadius: '4px'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                padding: '1rem',
                marginBottom: '1rem',
                background: '#efe',
                color: '#0a0',
                borderRadius: '4px'
              }}>
                {success}
              </div>
            )}

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
              />
            </div>

            <div className="form-group">
              <label>Mot de passe *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength="6"
              />
            </div>

            <button
              type="submit"
              className="submit-proposal-btn"
              disabled={loading}
            >
              {loading ? 'Chargement...' : (isSignUp ? 'Créer mon compte' : 'Se connecter')}
            </button>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', opacity: 0.7 }}>
              {isSignUp ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?'}
              {' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                  setSuccess(null)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: '500'
                }}
              >
                {isSignUp ? 'Se connecter' : 'Créer un compte'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
