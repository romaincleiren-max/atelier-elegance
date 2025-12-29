import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useAdminCheck } from '../hooks/useAdminCheck'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdminCheck()

  // Attendre que l'authentification soit chargée
  if (authLoading || (requireAdmin && adminLoading)) {
    return (
      <div style={{
        marginTop: '120px',
        padding: '2rem',
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid var(--secondary)',
            borderTop: '4px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: 'var(--accent)', fontWeight: '600' }}>
            Vérification des accès...
          </p>
        </div>
      </div>
    )
  }

  // Rediriger si pas connecté
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Rediriger si admin requis mais pas admin
  if (requireAdmin && !isAdmin) {
    console.warn('Tentative d\'accès non autorisé à une route admin')
    return <Navigate to="/" replace />
  }

  return children
}
