import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import AdminCalendar from '../components/AdminCalendar'
import { useAdminCheck } from '../hooks/useAdminCheck'
import Carousel from '../components/Carousel'

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useAdminCheck()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [histories, setHistories] = useState({})
  const [showHistory, setShowHistory] = useState({})

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

    // Pour l'admin, on récupère TOUS les rendez-vous triés par date de RDV (chronologique)
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        user_id,
        dresses (
          name,
          style,
          price
        )
      `)
      .order('preferred_date', { ascending: true, nullsFirst: false })

    if (!error && data) {
      setAppointments(data)

      // Charger l'historique pour chaque rendez-vous
      data.forEach(apt => {
        fetchHistory(apt.id)
      })
    }
    setLoading(false)
  }

  async function fetchHistory(appointmentId) {
    if (!supabase) return

    const { data, error } = await supabase
      .from('appointment_history')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setHistories(prev => ({ ...prev, [appointmentId]: data }))
    }
  }

  // Confirmer définitivement le RDV (statut final)
  async function confirmAppointment(appointmentId) {
    if (!supabase) return

    // Enregistrer dans l'historique
    await supabase.from('appointment_history').insert({
      appointment_id: appointmentId,
      proposed_by: 'admin',
      message: 'Admin a confirmé définitivement le rendez-vous'
    })

    // Mettre à jour le RDV avec statut final
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'confirmed',
        last_proposal_by: 'admin'
      })
      .eq('id', appointmentId)

    if (!error) {
      fetchAppointments()
      alert('Rendez-vous confirmé définitivement !')
    } else {
      alert('Erreur: ' + error.message)
    }
  }

  // Contre-proposer une nouvelle date
  async function counterPropose(appointmentId) {
    if (!supabase || !newDate) {
      alert('Veuillez sélectionner une date')
      return
    }

    // Enregistrer dans l'historique
    await supabase.from('appointment_history').insert({
      appointment_id: appointmentId,
      proposed_by: 'admin',
      proposed_date: newDate,
      proposed_time: newTime || null,
      message: adminNote || 'Admin propose une nouvelle date'
    })

    // Mettre à jour le RDV
    const { error } = await supabase
      .from('appointments')
      .update({
        preferred_date: newDate,
        preferred_time: newTime || null,
        message: adminNote || null,
        status: 'waiting_user', // User doit répondre
        last_proposal_by: 'admin'
      })
      .eq('id', appointmentId)
      .select()
      .then(({ data }) => {
        if (data && data[0]) {
          // Incrémenter le compteur de négociation
          return supabase
            .from('appointments')
            .update({
              negotiation_count: (data[0].negotiation_count || 0) + 1
            })
            .eq('id', appointmentId)
        }
      })

    if (!error) {
      fetchAppointments()
      setEditingAppointment(null)
      setNewDate('')
      setNewTime('')
      setAdminNote('')
      alert('Contre-proposition envoyée au client !')
    } else {
      alert('Erreur: ' + error.message)
    }
  }

  // Refuser le RDV (utilisé pour les demandes initiales)
  async function refuseAppointment(appointmentId) {
    if (!supabase) return
    if (!confirm('Voulez-vous vraiment refuser ce rendez-vous ?')) return

    // Enregistrer dans l'historique
    await supabase.from('appointment_history').insert({
      appointment_id: appointmentId,
      proposed_by: 'admin',
      message: 'Admin a refusé le rendez-vous'
    })

    // Annuler le RDV
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        last_proposal_by: 'admin'
      })
      .eq('id', appointmentId)

    if (!error) {
      fetchAppointments()
      alert('Rendez-vous refusé')
    } else {
      alert('Erreur: ' + error.message)
    }
  }

  // Annuler un RDV déjà en cours (confirmé, waiting_user, etc.)
  async function cancelAppointment(appointmentId, currentStatus) {
    if (!supabase) return

    const statusText = currentStatus === 'confirmed' ? 'confirmé' : 'en cours'
    if (!confirm(`Voulez-vous vraiment annuler ce rendez-vous ${statusText} ?\n\nCette action est définitive et ne passera pas par la négociation.`)) return

    // Enregistrer dans l'historique
    await supabase.from('appointment_history').insert({
      appointment_id: appointmentId,
      proposed_by: 'admin',
      message: `Admin a annulé le rendez-vous ${statusText}`
    })

    // Annuler définitivement le RDV
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        last_proposal_by: 'admin'
      })
      .eq('id', appointmentId)

    if (!error) {
      fetchAppointments()
      alert('Rendez-vous annulé définitivement')
    } else {
      alert('Erreur: ' + error.message)
    }
  }

  function getFilteredAppointments() {
    if (filter === 'all') return appointments
    if (filter === 'waiting') {
      // Tous les RDV qui attendent une action de l'admin
      return appointments.filter(apt =>
        apt.status === 'pending' || apt.status === 'waiting_admin'
      )
    }
    return appointments.filter(apt => apt.status === filter)
  }

  function getStatusBadge(status, lastProposalBy) {
    const badges = {
      pending: { text: 'Nouvelle demande', color: '#f59e0b', bg: '#fef3c7' },
      waiting_admin: { text: 'User a répondu - À traiter', color: '#3b82f6', bg: '#dbeafe' },
      waiting_user: { text: 'En attente de réponse client', color: '#8b5cf6', bg: '#ede9fe' },
      confirmed: { text: 'Rendez-vous confirmé', color: '#10b981', bg: '#d1fae5' },
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

  function needsAdminAction(apt) {
    return apt.status === 'pending' || apt.status === 'waiting_admin'
  }

  async function resetAllAppointments() {
    if (!supabase) return

    const confirmText = 'SUPPRIMER'
    const userInput = prompt(
      `⚠️ ATTENTION : Cette action est IRRÉVERSIBLE !\n\n` +
      `Vous êtes sur le point de SUPPRIMER TOUS LES RENDEZ-VOUS (${appointments.length} rendez-vous).\n\n` +
      `Cela inclut :\n` +
      `- Tous les rendez-vous en attente\n` +
      `- Tous les rendez-vous confirmés\n` +
      `- Tous les rendez-vous annulés\n` +
      `- Tout l'historique associé\n\n` +
      `Pour confirmer, tapez exactement : ${confirmText}`
    )

    if (userInput !== confirmText) {
      if (userInput !== null) {
        alert('Réinitialisation annulée. Le texte ne correspond pas.')
      }
      return
    }

    const secondConfirm = confirm(
      '⚠️ DERNIÈRE CONFIRMATION\n\n' +
      'Êtes-vous ABSOLUMENT SÛR de vouloir supprimer tous les rendez-vous ?\n\n' +
      'Cette action ne peut PAS être annulée.'
    )

    if (!secondConfirm) {
      alert('Réinitialisation annulée.')
      return
    }

    // Supprimer tous les rendez-vous
    const { error } = await supabase
      .from('appointments')
      .delete()
      .not('id', 'is', null) // Supprime tout (tous les IDs non null)

    if (!error) {
      alert(`✅ Tous les rendez-vous ont été supprimés (${appointments.length} rendez-vous)`)
      fetchAppointments()
    } else {
      alert('❌ Erreur lors de la suppression: ' + error.message)
    }
  }

  const filteredAppointments = getFilteredAppointments()
  const stats = {
    total: appointments.length,
    waiting: appointments.filter(a => a.status === 'pending' || a.status === 'waiting_admin').length,
    waiting_user: appointments.filter(a => a.status === 'waiting_user').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  }

  if (adminLoading) {
    return (
      <div style={{ marginTop: '120px', padding: '2rem', textAlign: 'center' }}>
        <p>Chargement...</p>
      </div>
    )
  }

  if (!user || !isAdmin) return null

  return (
    <div style={{ marginTop: '120px', padding: '2rem', maxWidth: '1400px', margin: '120px auto 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="dress-title" style={{ margin: 0, textAlign: 'center', flex: 1 }}>
          Administration - Gestion des Rendez-vous
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a
            href="/admin/collections"
            style={{
              padding: '0.8rem 1.5rem',
              background: 'var(--gradient-sunset)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.3s'
            }}
          >
            📦 Collections
          </a>
          <a
            href="/admin/photos"
            style={{
              padding: '0.8rem 1.5rem',
              background: 'var(--gradient-sunset)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.3s'
            }}
          >
            📸 Photos
          </a>
          <a
            href="/admin/settings"
            style={{
              padding: '0.8rem 1.5rem',
              background: 'var(--gradient-sunset)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.3s'
            }}
          >
            ⚙️ Paramètres
          </a>
        </div>
      </div>

      {/* Calendrier de disponibilités - Version compacte */}
      <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center', marginBottom: '-3rem' }}>
        <AdminCalendar />
      </div>

      {/* Bouton de réinitialisation */}
      {appointments.length > 0 && (
        <div style={{
          marginBottom: '1.5rem',
          textAlign: 'center',
          padding: '1rem',
          background: '#fee2e2',
          borderRadius: '12px',
          border: '2px solid #ef4444'
        }}>
          <button
            onClick={resetAllAppointments}
            style={{
              padding: '0.8rem 2rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#dc2626'
              e.target.style.transform = 'scale(1.05)'
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#ef4444'
              e.target.style.transform = 'scale(1)'
            }}
          >
            🗑️ Réinitialiser tout le calendrier ({appointments.length} RDV)
          </button>
          <p style={{
            marginTop: '0.5rem',
            fontSize: '0.85rem',
            color: '#991b1b',
            fontWeight: '500'
          }}>
            ⚠️ Action irréversible - Double confirmation requise
          </p>
        </div>
      )}

      {/* Statistiques - Version compacte */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1rem',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          border: '2px solid var(--secondary)'
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.3rem' }}>
            Total RDV
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '1rem',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          border: '2px solid #3b82f6'
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.waiting}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.3rem' }}>
            À traiter
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '1rem',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          border: '2px solid #8b5cf6'
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {stats.waiting_user}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.3rem' }}>
            En attente client
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '1rem',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          border: '2px solid #10b981'
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>
            {stats.confirmed}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.3rem' }}>
            Confirmés
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '1rem',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          border: '2px solid #ef4444'
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ef4444' }}>
            {stats.cancelled}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.3rem' }}>
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
          className={`filter-btn ${filter === 'waiting' ? 'active' : ''}`}
          onClick={() => setFilter('waiting')}
          style={{
            background: filter === 'waiting' ? '#3b82f6' : 'white',
            color: filter === 'waiting' ? 'white' : '#3b82f6',
            borderColor: '#3b82f6'
          }}
        >
          À traiter ({stats.waiting})
        </button>
        <button
          className={`filter-btn ${filter === 'waiting_user' ? 'active' : ''}`}
          onClick={() => setFilter('waiting_user')}
        >
          En attente client ({stats.waiting_user})
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

      {/* Liste des rendez-vous - Carrousel horizontal */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</p>
      ) : filteredAppointments.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
          Aucun rendez-vous dans cette catégorie
        </p>
      ) : (
        <Carousel itemWidth={400}>
          {filteredAppointments.map((apt) => (
            <div key={apt.id} style={{
              background: needsAdminAction(apt) ? '#eff6ff' : 'white',
              padding: '1.2rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              border: `2px solid ${
                needsAdminAction(apt) ? '#3b82f6' :
                apt.status === 'waiting_user' ? '#8b5cf6' :
                apt.status === 'confirmed' ? '#10b981' : '#ef4444'
              }`,
              minWidth: '400px',
              maxWidth: '400px',
              flexShrink: 0,
              scrollSnapAlign: 'start',
              borderRadius: '12px'
            }}>
              {/* En-tête */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', marginBottom: '0.3rem' }}>
                    {apt.first_name} {apt.last_name}
                  </h3>
                  <p style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    {apt.dresses ? `${apt.dresses.name} (${apt.dresses.style})` : 'Robe supprimée'}
                  </p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    Demandé le {new Date(apt.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {apt.negotiation_count > 0 && (
                    <p style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: '600', marginTop: '0.2rem' }}>
                      🔄 {apt.negotiation_count} échange{apt.negotiation_count > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                {getStatusBadge(apt.status, apt.last_proposal_by)}
              </div>

              {/* Alerte action requise */}
              {needsAdminAction(apt) && (
                <div style={{
                  padding: '0.6rem',
                  background: '#3b82f6',
                  color: 'white',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  fontWeight: '600',
                  textAlign: 'center',
                  fontSize: '0.85rem'
                }}>
                  ⚠️ Action requise - C'est à vous de répondre !
                </div>
              )}

              {/* Informations principales */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                padding: '1rem',
                background: 'var(--primary)',
                borderRadius: '4px',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}>
                <div>
                  <strong style={{ fontSize: '0.8rem' }}>Contact:</strong>
                  <p style={{ fontSize: '0.8rem' }}>{apt.email}</p>
                  <p style={{ fontSize: '0.8rem' }}>{apt.phone}</p>
                </div>
                <div>
                  <strong style={{ fontSize: '0.8rem' }}>Rendez-vous proposé:</strong>
                  <p style={{ fontSize: '0.8rem' }}>📅 {apt.preferred_date ? new Date(apt.preferred_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Non spécifié'}</p>
                  <p style={{ fontSize: '0.8rem' }}>🕐 {apt.preferred_time || 'Non spécifié'}</p>
                </div>
                <div>
                  <strong style={{ fontSize: '0.8rem' }}>Détails:</strong>
                  <p style={{ fontSize: '0.8rem' }}>Taille: {apt.size || 'Non spécifiée'}</p>
                  {apt.dresses && <p style={{ fontSize: '0.8rem' }}>Prix: {apt.dresses.price}€</p>}
                </div>
              </div>

              {/* Message actuel */}
              {apt.message && (
                <div style={{
                  padding: '0.8rem',
                  background: '#f0f9ff',
                  borderLeft: '3px solid var(--accent)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem'
                }}>
                  <strong style={{ fontSize: '0.8rem' }}>Message {apt.last_proposal_by === 'user' ? 'du client' : 'admin précédent'}:</strong>
                  <p style={{ marginTop: '0.3rem', fontSize: '0.85rem' }}>{apt.message}</p>
                </div>
              )}

              {/* Historique de négociation */}
              {histories[apt.id] && histories[apt.id].length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <button
                    onClick={() => setShowHistory(prev => ({ ...prev, [apt.id]: !prev[apt.id] }))}
                    style={{
                      background: 'none',
                      border: '2px solid var(--accent)',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      color: 'var(--accent)',
                      fontWeight: '600',
                      marginBottom: '1rem'
                    }}
                  >
                    {showHistory[apt.id] ? '▼' : '▶'} Historique des négociations ({histories[apt.id].length})
                  </button>

                  {showHistory[apt.id] && (
                    <div style={{
                      background: 'white',
                      border: '2px solid var(--secondary)',
                      borderRadius: '4px',
                      padding: '1rem'
                    }}>
                      {histories[apt.id].map((entry, idx) => (
                        <div key={entry.id} style={{
                          padding: '1rem',
                          borderLeft: `4px solid ${entry.proposed_by === 'admin' ? '#3b82f6' : '#10b981'}`,
                          background: entry.proposed_by === 'admin' ? '#eff6ff' : '#f0fdf4',
                          marginBottom: idx < histories[apt.id].length - 1 ? '0.75rem' : 0
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <strong style={{ color: entry.proposed_by === 'admin' ? '#3b82f6' : '#10b981' }}>
                              {entry.proposed_by === 'admin' ? '👨‍💼 Admin' : '👤 Client'}
                            </strong>
                            <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                              {new Date(entry.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {entry.proposed_date && (
                            <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                              📅 {new Date(entry.proposed_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                              {entry.proposed_time && ` à ${entry.proposed_time}`}
                            </p>
                          )}
                          {entry.message && (
                            <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                              💬 {entry.message}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions Admin - Nouvelle demande OU User a répondu */}
              {needsAdminAction(apt) && (
                <>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <button
                      className="action-btn btn-primary"
                      onClick={() => confirmAppointment(apt.id)}
                      style={{ background: '#10b981' }}
                    >
                      ✓ Confirmer définitivement le RDV
                    </button>
                    <button
                      className="action-btn btn-secondary"
                      onClick={() => setEditingAppointment(editingAppointment === apt.id ? null : apt.id)}
                      style={{ background: '#3b82f6', color: 'white' }}
                    >
                      📅 Contre-proposer une autre date
                    </button>
                    <button
                      className="action-btn btn-secondary"
                      onClick={() => refuseAppointment(apt.id)}
                      style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    >
                      ✕ Refuser le RDV
                    </button>
                  </div>

                  {/* Formulaire de contre-proposition */}
                  {editingAppointment === apt.id && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1.5rem',
                      background: '#eff6ff',
                      borderRadius: '4px',
                      border: '2px solid #3b82f6'
                    }}>
                      <h4 style={{ marginBottom: '1rem', fontFamily: 'Cormorant Garamond, serif', color: '#3b82f6' }}>
                        Contre-proposer une nouvelle date
                      </h4>
                      <div className="form-row" style={{ marginBottom: '1rem' }}>
                        <div className="form-group">
                          <label>Nouvelle date *</label>
                          <input
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
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
                          rows="3"
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                          className="action-btn btn-primary"
                          onClick={() => counterPropose(apt.id)}
                          disabled={!newDate}
                          style={{ background: '#3b82f6' }}
                        >
                          Envoyer la contre-proposition
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
                </>
              )}

              {/* États finaux */}
              {apt.status === 'waiting_user' && (
                <>
                  <div style={{
                    padding: '1rem',
                    background: '#ede9fe',
                    borderRadius: '4px',
                    color: '#8b5cf6',
                    fontWeight: '500',
                    marginBottom: '1rem'
                  }}>
                    ⏳ En attente de la réponse du client
                  </div>
                  <button
                    className="action-btn btn-secondary"
                    onClick={() => cancelAppointment(apt.id, apt.status)}
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    🗑️ Annuler ce rendez-vous
                  </button>
                </>
              )}

              {apt.status === 'confirmed' && (
                <>
                  <div style={{
                    padding: '1rem',
                    background: '#d1fae5',
                    borderRadius: '4px',
                    color: '#10b981',
                    fontWeight: '500',
                    marginBottom: '1rem'
                  }}>
                    ✓ Rendez-vous confirmé définitivement
                  </div>
                  <button
                    className="action-btn btn-secondary"
                    onClick={() => cancelAppointment(apt.id, apt.status)}
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    🗑️ Annuler ce rendez-vous confirmé
                  </button>
                </>
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
        </Carousel>
      )}
    </div>
  )
}
