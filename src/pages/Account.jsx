import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import AvailabilityCalendar from '../components/AvailabilityCalendar'
import Carousel from '../components/Carousel'

export default function Account() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  console.log('[Account] Component mounted, user:', user ? user.email : 'null')

  // Changement de mot de passe
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Rendez-vous
  const [appointments, setAppointments] = useState([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)

  // Négociation
  const [respondingTo, setRespondingTo] = useState(null)
  const [counterDate, setCounterDate] = useState('')
  const [counterTime, setCounterTime] = useState('')
  const [counterMessage, setCounterMessage] = useState('')
  const [history, setHistory] = useState({})

  // Favoris
  const [favorites, setFavorites] = useState([])
  const [loadingFavorites, setLoadingFavorites] = useState(true)

  useEffect(() => {
    console.log('[Account] useEffect triggered, user:', user ? user.email : 'null')
    if (user) {
      console.log('[Account] User exists, fetching data...')
      fetchAppointments()
      fetchFavorites()
    } else {
      console.log('[Account] No user, waiting for auth...')
    }
  }, [user])

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
      .order('preferred_date', { ascending: true, nullsFirst: false })

    if (!error && data) {
      setAppointments(data)
      // Charger l'historique pour chaque RDV
      data.forEach(apt => fetchHistory(apt.id))
    }
    setLoadingAppointments(false)
  }

  async function fetchHistory(appointmentId) {
    if (!supabase) return

    const { data, error } = await supabase
      .from('appointment_history')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setHistory(prev => ({ ...prev, [appointmentId]: data }))
    }
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

  async function acceptProposal(appointmentId) {
    if (!supabase) return

    // Récupérer le compteur actuel
    const { data: currentData } = await supabase
      .from('appointments')
      .select('negotiation_count')
      .eq('id', appointmentId)
      .single()

    // Enregistrer dans l'historique
    await supabase.from('appointment_history').insert({
      appointment_id: appointmentId,
      proposed_by: 'user',
      message: 'Client a accepté la proposition',
      proposed_date: null,
      proposed_time: null
    })

    // Mettre à jour le statut : waiting_admin (admin doit confirmer)
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'waiting_admin',
        last_proposal_by: 'user',
        negotiation_count: (currentData?.negotiation_count || 0) + 1
      })
      .eq('id', appointmentId)

    if (!error) {
      setMessage({ type: 'success', text: 'Proposition acceptée ! En attente de confirmation par l\'admin.' })
      fetchAppointments()
    } else {
      setMessage({ type: 'error', text: 'Erreur: ' + error.message })
    }
  }

  async function refuseProposal(appointmentId) {
    if (!supabase) return
    if (!confirm('Voulez-vous vraiment refuser cette proposition ?')) return

    await supabase.from('appointment_history').insert({
      appointment_id: appointmentId,
      proposed_by: 'user',
      message: 'Client a refusé la proposition',
      proposed_date: null,
      proposed_time: null
    })

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId)

    if (!error) {
      setMessage({ type: 'success', text: 'Rendez-vous annulé' })
      fetchAppointments()
    }
  }

  async function submitCounterProposal(e, appointmentId) {
    e.preventDefault()
    if (!supabase) return

    if (!counterDate) {
      alert('Veuillez sélectionner une date')
      return
    }

    // Récupérer le compteur actuel
    const { data: currentData } = await supabase
      .from('appointments')
      .select('negotiation_count')
      .eq('id', appointmentId)
      .single()

    // Enregistrer dans l'historique
    await supabase.from('appointment_history').insert({
      appointment_id: appointmentId,
      proposed_by: 'user',
      proposed_date: counterDate,
      proposed_time: counterTime || null,
      message: counterMessage || 'Client propose une nouvelle date'
    })

    // Mettre à jour le RDV
    const { error } = await supabase
      .from('appointments')
      .update({
        preferred_date: counterDate,
        preferred_time: counterTime || null,
        message: counterMessage || null,
        status: 'waiting_admin',
        last_proposal_by: 'user',
        negotiation_count: (currentData?.negotiation_count || 0) + 1
      })
      .eq('id', appointmentId)

    if (!error) {
      setMessage({ type: 'success', text: 'Contre-proposition envoyée !' })
      setRespondingTo(null)
      setCounterDate('')
      setCounterTime('')
      setCounterMessage('')
      fetchAppointments()
    } else {
      setMessage({ type: 'error', text: 'Erreur: ' + error.message })
    }
  }

  async function cancelAppointment(appointmentId) {
    if (!supabase) return
    if (!confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) return

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId)

    if (!error) {
      setMessage({ type: 'success', text: 'Rendez-vous annulé' })
      fetchAppointments()
    }
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

  function getStatusBadge(status, lastProposalBy) {
    const badges = {
      pending: { text: 'En attente admin', color: '#f59e0b', bg: '#fef3c7' },
      waiting_user: { text: 'À votre tour', color: '#3b82f6', bg: '#dbeafe' },
      waiting_admin: { text: 'En attente admin', color: '#f59e0b', bg: '#fef3c7' },
      confirmed: { text: 'Confirmé ✓', color: '#10b981', bg: '#d1fae5' },
      cancelled: { text: 'Annulé', color: '#ef4444', bg: '#fee2e2' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span style={{
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: badge.color,
        background: badge.bg,
        border: `2px solid ${badge.color}`
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

      {/* Calendrier des disponibilités */}
      <AvailabilityCalendar />

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

      {/* Mes Rendez-vous avec négociation */}
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
          <Carousel itemWidth={450}>
            {appointments.map((apt, index) => {
              // Le premier rendez-vous non annulé est le prochain
              const isNext = index === 0 && apt.status !== 'cancelled'

              return (
                <div key={apt.id} style={{
                  border: `3px solid ${
                    apt.status === 'confirmed' ? '#10b981' :
                    apt.status === 'waiting_user' ? '#3b82f6' :
                    apt.status === 'cancelled' ? '#ef4444' : '#f59e0b'
                  }`,
                  padding: '1.5rem',
                  borderRadius: '12px',
                  background: apt.status === 'waiting_user' ? '#f0f9ff' : 'white',
                  minWidth: isNext ? '520px' : '450px', // Plus grand si prochain RDV
                  maxWidth: isNext ? '520px' : '450px',
                  flexShrink: 0,
                  scrollSnapAlign: 'start',
                  transform: isNext ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isNext ? '0 8px 30px rgba(255, 107, 138, 0.3)' : '0 2px 10px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}>
                {isNext && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--gradient-sunset)',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 15px rgba(255, 107, 138, 0.4)',
                    zIndex: 10
                  }}>
                    ⭐ Prochain Rendez-vous
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                      {apt.dresses ? apt.dresses.name : 'Robe supprimée'}
                    </h3>
                    {apt.dresses && (
                      <p style={{ color: 'var(--accent)', fontSize: '1rem' }}>
                        {apt.dresses.style} - {apt.dresses.price}€
                      </p>
                    )}
                  </div>
                  {getStatusBadge(apt.status, apt.last_proposal_by)}
                </div>

                <div style={{ padding: '1.5rem', background: 'var(--primary)', borderRadius: '4px', marginBottom: '1rem' }}>
                  <p><strong>📅 Date actuelle :</strong> {apt.preferred_date ? new Date(apt.preferred_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Non spécifiée'}</p>
                  <p><strong>🕐 Heure :</strong> {apt.preferred_time || 'Non spécifiée'}</p>
                  <p><strong>📏 Taille :</strong> {apt.size || 'Non spécifiée'}</p>
                  {apt.message && <p style={{ marginTop: '0.5rem' }}><strong>💬 Message :</strong> {apt.message}</p>}
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', opacity: 0.7 }}>
                    Créé le {new Date(apt.created_at).toLocaleDateString('fr-FR')} • {apt.negotiation_count || 0} échanges
                  </p>
                </div>

                {/* Historique des négociations */}
                {history[apt.id] && history[apt.id].length > 0 && (
                  <details style={{ marginBottom: '1rem' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '0.5rem' }}>
                      📋 Historique des échanges ({history[apt.id].length})
                    </summary>
                    <div style={{ paddingLeft: '1rem', borderLeft: '3px solid var(--accent)' }}>
                      {history[apt.id].map((h, idx) => (
                        <div key={idx} style={{ padding: '0.75rem', marginBottom: '0.5rem', background: h.proposed_by === 'user' ? '#f0f9ff' : '#fef3c7', borderRadius: '4px' }}>
                          <strong>{h.proposed_by === 'user' ? '👤 Vous' : '👔 Admin'}</strong>
                          {h.proposed_date && (
                            <p>📅 {new Date(h.proposed_date).toLocaleDateString('fr-FR')} {h.proposed_time && `à ${h.proposed_time}`}</p>
                          )}
                          {h.message && <p>💬 {h.message}</p>}
                          <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
                            {new Date(h.created_at).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Actions selon le statut */}
                {apt.status === 'waiting_user' && (
                  <div>
                    <div style={{
                      padding: '1rem',
                      background: '#dbeafe',
                      borderRadius: '4px',
                      marginBottom: '1rem',
                      border: '2px solid #3b82f6'
                    }}>
                      <strong style={{ color: '#3b82f6' }}>⏰ C'est à vous de répondre !</strong>
                      <p style={{ marginTop: '0.5rem' }}>L'admin vous a proposé une nouvelle date. Que souhaitez-vous faire ?</p>
                    </div>

                    {respondingTo !== apt.id ? (
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                          className="action-btn btn-primary"
                          onClick={() => acceptProposal(apt.id)}
                          style={{ background: '#10b981' }}
                        >
                          ✓ Accepter cette date
                        </button>
                        <button
                          className="action-btn btn-secondary"
                          onClick={() => setRespondingTo(apt.id)}
                        >
                          📅 Proposer une autre date
                        </button>
                        <button
                          className="action-btn btn-secondary"
                          onClick={() => refuseProposal(apt.id)}
                          style={{ borderColor: '#ef4444', color: '#ef4444' }}
                        >
                          ✕ Refuser
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={(e) => submitCounterProposal(e, apt.id)} style={{ marginTop: '1rem', padding: '1.5rem', background: 'var(--primary)', borderRadius: '4px' }}>
                        <h4 style={{ marginBottom: '1rem', fontFamily: 'Cormorant Garamond, serif' }}>Proposer une nouvelle date</h4>
                        <div className="form-row" style={{ marginBottom: '1rem' }}>
                          <div className="form-group">
                            <label>Nouvelle date *</label>
                            <input
                              type="date"
                              value={counterDate}
                              onChange={(e) => setCounterDate(e.target.value)}
                              required
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div className="form-group">
                            <label>Heure</label>
                            <input
                              type="time"
                              value={counterTime}
                              onChange={(e) => setCounterTime(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                          <label>Message (optionnel)</label>
                          <textarea
                            value={counterMessage}
                            onChange={(e) => setCounterMessage(e.target.value)}
                            placeholder="Expliquez pourquoi cette date vous convient mieux..."
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <button type="submit" className="action-btn btn-primary">
                            Envoyer ma proposition
                          </button>
                          <button
                            type="button"
                            className="action-btn btn-secondary"
                            onClick={() => {
                              setRespondingTo(null)
                              setCounterDate('')
                              setCounterTime('')
                              setCounterMessage('')
                            }}
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {(apt.status === 'pending' || apt.status === 'waiting_admin') && (
                  <div>
                    <div style={{
                      padding: '1rem',
                      background: '#fef3c7',
                      borderRadius: '4px',
                      marginBottom: '1rem',
                      color: '#f59e0b',
                      fontWeight: '500'
                    }}>
                      ⏳ En attente de réponse de l'admin...
                    </div>
                    <button
                      onClick={() => cancelAppointment(apt.id)}
                      className="action-btn btn-secondary"
                      style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    >
                      Annuler le rendez-vous
                    </button>
                  </div>
                )}

                {apt.status === 'confirmed' && (
                  <div style={{
                    padding: '1.5rem',
                    background: '#d1fae5',
                    borderRadius: '4px',
                    color: '#10b981',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    textAlign: 'center'
                  }}>
                    ✓ Rendez-vous confirmé ! À bientôt !
                  </div>
                )}

                {apt.status === 'cancelled' && (
                  <div style={{
                    padding: '1rem',
                    background: '#fee2e2',
                    borderRadius: '4px',
                    color: '#ef4444',
                    fontWeight: '500'
                  }}>
                    ✕ Rendez-vous annulé
                  </div>
                )}
              </div>
              )
            })}
          </Carousel>
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
