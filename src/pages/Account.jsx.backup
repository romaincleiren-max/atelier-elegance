import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Account() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Changement de mot de passe
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Rendez-vous
  const [appointments, setAppointments] = useState([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)

  // Favoris
  const [favorites, setFavorites] = useState([])
  const [loadingFavorites, setLoadingFavorites] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    fetchAppointments()
    fetchFavorites()
  }, [user, navigate])

  async function fetchAppointments() {
    if (!supabase) return

    setLoadingAppointments(true)
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        dresses (
          name,
          style,
          price
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setAppointments(data)
    }
    setLoadingAppointments(false)
  }

  async function fetchFavorites() {
    if (!supabase) return

    setLoadingFavorites(true)
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        dresses (
          id,
          name,
          style,
          description,
          price,
          category
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setFavorites(data)
    }
    setLoadingFavorites(false)
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' })
      return
    }

    if (!supabase) {
      setMessage({ type: 'error', text: 'Supabase non configuré' })
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  async function removeFavorite(favoriteId) {
    if (!supabase) return

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId)

    if (!error) {
      setFavorites(favorites.filter(f => f.id !== favoriteId))
      setMessage({ type: 'success', text: 'Retiré des favoris' })
    }
  }

  async function cancelAppointment(appointmentId) {
    if (!supabase) return
    if (!confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) return

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId)

    if (!error) {
      setAppointments(appointments.filter(a => a.id !== appointmentId))
      setMessage({ type: 'success', text: 'Rendez-vous annulé' })
    }
  }

  function getStatusBadge(status) {
    const badges = {
      pending: { text: 'En attente', color: '#f59e0b' },
      confirmed: { text: 'Confirmé', color: '#10b981' },
      cancelled: { text: 'Annulé', color: '#ef4444' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: '500',
        color: 'white',
        background: badge.color
      }}>
        {badge.text}
      </span>
    )
  }

  if (!user) return null

  return (
    <div style={{ marginTop: '120px', padding: '2rem', maxWidth: '1200px', margin: '120px auto 0' }}>
      <h1 className="dress-title" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        Mon Compte
      </h1>

      {message.text && (
        <div style={{
          padding: '1rem',
          marginBottom: '2rem',
          background: message.type === 'error' ? '#fee' : '#efe',
          color: message.type === 'error' ? '#c00' : '#0a0',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {message.text}
        </div>
      )}

      {/* Informations du compte */}
      <section style={{
        background: 'white',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <h2 className="dress-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          Informations
        </h2>
        <p><strong>Email :</strong> {user.email}</p>
        <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>
          Membre depuis le {new Date(user.created_at).toLocaleDateString('fr-FR')}
        </p>
      </section>

      {/* Changement de mot de passe */}
      <section style={{
        background: 'white',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <h2 className="dress-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          Changer le mot de passe
        </h2>
        <form onSubmit={handlePasswordChange} className="proposal-form">
          <div className="form-group">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Au moins 6 caractères"
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Retapez votre mot de passe"
              minLength="6"
            />
          </div>
          <button type="submit" className="submit-proposal-btn" disabled={loading}>
            {loading ? 'Modification...' : 'Modifier le mot de passe'}
          </button>
        </form>
      </section>

      {/* Mes Rendez-vous */}
      <section style={{
        background: 'white',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <h2 className="dress-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          Mes Rendez-vous
        </h2>
        {loadingAppointments ? (
          <p>Chargement...</p>
        ) : appointments.length === 0 ? (
          <p style={{ opacity: 0.7 }}>Vous n'avez pas encore de rendez-vous.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {appointments.map((apt) => (
              <div key={apt.id} style={{
                border: '2px solid var(--secondary)',
                padding: '1.5rem',
                borderRadius: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                      {apt.dresses ? apt.dresses.name : 'Robe supprimée'}
                    </h3>
                    {apt.dresses && (
                      <p style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>
                        {apt.dresses.style} - {apt.dresses.price}€
                      </p>
                    )}
                  </div>
                  {getStatusBadge(apt.status)}
                </div>
                <div style={{ fontSize: '0.95rem', opacity: 0.8 }}>
                  <p><strong>Date souhaitée :</strong> {apt.preferred_date ? new Date(apt.preferred_date).toLocaleDateString('fr-FR') : 'Non spécifiée'}</p>
                  <p><strong>Heure :</strong> {apt.preferred_time || 'Non spécifiée'}</p>
                  <p><strong>Taille :</strong> {apt.size || 'Non spécifiée'}</p>
                  {apt.message && <p><strong>Message :</strong> {apt.message}</p>}
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    Demandé le {new Date(apt.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {apt.status === 'pending' && (
                  <button
                    onClick={() => cancelAppointment(apt.id)}
                    className="action-btn btn-secondary"
                    style={{ marginTop: '1rem' }}
                  >
                    Annuler le rendez-vous
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mes Favoris */}
      <section style={{
        background: 'white',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <h2 className="dress-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          Mes Favoris
        </h2>
        {loadingFavorites ? (
          <p>Chargement...</p>
        ) : favorites.length === 0 ? (
          <p style={{ opacity: 0.7 }}>Vous n'avez pas encore de favoris.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {favorites.map((fav) => (
              fav.dresses && (
                <div key={fav.id} style={{
                  border: '2px solid var(--secondary)',
                  padding: '1.5rem',
                  borderRadius: '4px'
                }}>
                  <div className="dress-style">{fav.dresses.style}</div>
                  <h3 className="dress-title" style={{ fontSize: '1.3rem' }}>{fav.dresses.name}</h3>
                  <p className="dress-description">{fav.dresses.description}</p>
                  <div className="dress-price" style={{ fontSize: '1.2rem' }}>{fav.dresses.price}€</div>
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="action-btn btn-secondary"
                    style={{ width: '100%', marginTop: '1rem' }}
                  >
                    Retirer des favoris
                  </button>
                </div>
              )
            ))}
          </div>
        )}
      </section>

      {/* Déconnexion */}
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <button
          onClick={signOut}
          className="btn-secondary"
          style={{ padding: '0.8rem 2rem' }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
