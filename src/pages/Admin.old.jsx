import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, confirmed, cancelled
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    fetchAppointments()
  }, [user, navigate])

  async function fetchAppointments() {
    if (!supabase) return

    setLoading(true)
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
      .order('created_at', { ascending: false })

    if (!error && data) {
      setAppointments(data)
    }
    setLoading(false)
  }

  async function updateAppointmentStatus(appointmentId, newStatus, proposedDate = null, proposedTime = null) {
    if (!supabase) return

    const updates = {
      status: newStatus
    }

    if (proposedDate) {
      updates.preferred_date = proposedDate
    }
    if (proposedTime) {
      updates.preferred_time = proposedTime
    }
    if (adminNote) {
      updates.message = adminNote
    }

    const { error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', appointmentId)

    if (!error) {
      fetchAppointments()
      setEditingAppointment(null)
      setNewDate('')
      setNewTime('')
      setAdminNote('')
      alert(`Rendez-vous ${newStatus === 'confirmed' ? 'confirmé' : newStatus === 'cancelled' ? 'annulé' : 'mis à jour'} !`)
    } else {
      alert('Erreur: ' + error.message)
    }
  }

  function getFilteredAppointments() {
    if (filter === 'all') return appointments
    return appointments.filter(apt => apt.status === filter)
  }

  function getStatusBadge(status) {
    const badges = {
      pending: { text: 'En attente', color: '#f59e0b', bg: '#fef3c7' },
      confirmed: { text: 'Confirmé', color: '#10b981', bg: '#d1fae5' },
      cancelled: { text: 'Annulé', color: '#ef4444', bg: '#fee2e2' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span style={{
        padding: '0.4rem 1rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '600',
        color: badge.color,
        background: badge.bg,
        border: `2px solid ${badge.color}`
      }}>
        {badge.text}
      </span>
    )
  }

  const filteredAppointments = getFilteredAppointments()
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  }

  if (!user) return null

  return (
    <div style={{ marginTop: '120px', padding: '2rem', maxWidth: '1400px', margin: '120px auto 0' }}>
      <h1 className="dress-title" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        Administration - Gestion des Rendez-vous
      </h1>

      {/* Statistiques */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '3px solid var(--secondary)'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
            Total RDV
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '3px solid #f59e0b'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.pending}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
            En attente
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '3px solid #10b981'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>
            {stats.confirmed}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
            Confirmés
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '3px solid #ef4444'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ef4444' }}>
            {stats.cancelled}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
            Annulés
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tous ({stats.total})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          En attente ({stats.pending})
        </button>
        <button
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmés ({stats.confirmed})
        </button>
        <button
          className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Annulés ({stats.cancelled})
        </button>
      </div>

      {/* Liste des rendez-vous */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '3rem' }}>Chargement...</p>
      ) : filteredAppointments.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
          Aucun rendez-vous {filter !== 'all' && `avec le statut "${filter}"`}
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {filteredAppointments.map((apt) => (
            <div key={apt.id} style={{
              background: 'white',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: `3px solid ${apt.status === 'pending' ? '#f59e0b' : apt.status === 'confirmed' ? '#10b981' : '#ef4444'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {apt.first_name} {apt.last_name}
                  </h3>
                  <p style={{ color: 'var(--accent)', fontSize: '1rem', marginBottom: '0.5rem' }}>
                    {apt.dresses ? `${apt.dresses.name} (${apt.dresses.style})` : 'Robe supprimée'}
                  </p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                    Demandé le {new Date(apt.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {getStatusBadge(apt.status)}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                padding: '1.5rem',
                background: 'var(--primary)',
                borderRadius: '4px',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <strong>Contact:</strong>
                  <p>{apt.email}</p>
                  <p>{apt.phone}</p>
                </div>
                <div>
                  <strong>Rendez-vous souhaité:</strong>
                  <p>📅 {apt.preferred_date ? new Date(apt.preferred_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Non spécifié'}</p>
                  <p>🕐 {apt.preferred_time || 'Non spécifié'}</p>
                </div>
                <div>
                  <strong>Détails:</strong>
                  <p>Taille: {apt.size || 'Non spécifiée'}</p>
                  {apt.dresses && <p>Prix: {apt.dresses.price}€</p>}
                </div>
              </div>

              {apt.message && (
                <div style={{
                  padding: '1rem',
                  background: '#f0f9ff',
                  borderLeft: '4px solid var(--accent)',
                  marginBottom: '1.5rem'
                }}>
                  <strong>Message:</strong>
                  <p style={{ marginTop: '0.5rem' }}>{apt.message}</p>
                </div>
              )}

              {/* Actions Admin */}
              {apt.status === 'pending' && (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    className="action-btn btn-primary"
                    onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                    style={{ background: '#10b981' }}
                  >
                    ✓ Confirmer le RDV
                  </button>
                  <button
                    className="action-btn btn-secondary"
                    onClick={() => setEditingAppointment(editingAppointment === apt.id ? null : apt.id)}
                  >
                    📅 Proposer une autre date
                  </button>
                  <button
                    className="action-btn btn-secondary"
                    onClick={() => {
                      if (confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) {
                        updateAppointmentStatus(apt.id, 'cancelled')
                      }
                    }}
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    ✕ Refuser
                  </button>
                </div>
              )}

              {/* Formulaire de proposition de nouvelle date */}
              {editingAppointment === apt.id && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1.5rem',
                  background: 'var(--primary)',
                  borderRadius: '4px',
                  border: '2px solid var(--accent)'
                }}>
                  <h4 style={{ marginBottom: '1rem', fontFamily: 'Cormorant Garamond, serif' }}>
                    Proposer une nouvelle date
                  </h4>
                  <div className="form-row" style={{ marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label>Nouvelle date</label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nouvelle heure</label>
                      <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>Message pour le client (optionnel)</label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Ex: Nous vous proposons cette nouvelle date car..."
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      className="action-btn btn-primary"
                      onClick={() => updateAppointmentStatus(apt.id, 'pending', newDate, newTime)}
                      disabled={!newDate}
                    >
                      Envoyer la proposition
                    </button>
                    <button
                      className="action-btn btn-secondary"
                      onClick={() => {
                        setEditingAppointment(null)
                        setNewDate('')
                        setNewTime('')
                        setAdminNote('')
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {apt.status === 'confirmed' && (
                <div style={{
                  padding: '1rem',
                  background: '#d1fae5',
                  borderRadius: '4px',
                  color: '#10b981',
                  fontWeight: '500'
                }}>
                  ✓ Rendez-vous confirmé - Client notifié
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
          ))}
        </div>
      )}
    </div>
  )
}
