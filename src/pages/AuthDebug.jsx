import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { useState, useEffect } from 'react'

export default function AuthDebug() {
  const { user, loading } = useAuth()
  const [session, setSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    if (!supabase) {
      console.log('Supabase non configuré')
      setSessionLoading(false)
      return
    }

    const { data: { session }, error } = await supabase.auth.getSession()
    console.log('Session:', session)
    console.log('Error:', error)
    setSession(session)
    setSessionLoading(false)
  }

  return (
    <div style={{ marginTop: '120px', padding: '2rem', maxWidth: '800px', margin: '120px auto 0' }}>
      <h1 className="dress-title" style={{ marginBottom: '2rem' }}>
        Debug Authentification
      </h1>

      <div style={{ background: 'white', padding: '2rem', marginBottom: '2rem', borderRadius: '8px' }}>
        <h2>État AuthContext:</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
          {JSON.stringify({
            loading,
            user: user ? {
              id: user.id,
              email: user.email,
              created_at: user.created_at,
              email_confirmed_at: user.email_confirmed_at
            } : null
          }, null, 2)}
        </pre>
      </div>

      <div style={{ background: 'white', padding: '2rem', marginBottom: '2rem', borderRadius: '8px' }}>
        <h2>Session Supabase directe:</h2>
        {sessionLoading ? (
          <p>Chargement...</p>
        ) : (
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(session ? {
              user: {
                id: session.user.id,
                email: session.user.email,
                created_at: session.user.created_at,
                email_confirmed_at: session.user.email_confirmed_at
              },
              expires_at: session.expires_at
            } : null, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
        <h2>Variables d'environnement:</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
          {JSON.stringify({
            VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Défini' : 'Non défini',
            VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Défini (masqué)' : 'Non défini',
            supabaseConfigured: !!supabase
          }, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={checkSession}
          className="btn-primary"
          style={{ padding: '1rem 2rem' }}
        >
          Rafraîchir les données
        </button>
      </div>
    </div>
  )
}
