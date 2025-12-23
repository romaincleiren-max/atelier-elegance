import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AdminCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [appointments, setAppointments] = useState([])
  const [blockedSlots, setBlockedSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [showBlockForm, setShowBlockForm] = useState(false)
  const [blockForm, setBlockForm] = useState({
    start_time: '',
    end_time: '',
    note: ''
  })

  useEffect(() => {
    fetchMonthData()
  }, [currentMonth])

  async function fetchMonthData() {
    if (!supabase) return

    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    // Récupérer les RDV confirmés ou en négociation
    const { data: appts } = await supabase
      .from('appointments')
      .select('*')
      .in('status', ['confirmed', 'waiting_user', 'waiting_admin', 'pending'])
      .gte('preferred_date', startOfMonth.toISOString().split('T')[0])
      .lte('preferred_date', endOfMonth.toISOString().split('T')[0])

    if (appts) setAppointments(appts)

    // Récupérer les créneaux bloqués
    const { data: blocked } = await supabase
      .from('calendar_availability')
      .select('*')
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0])

    if (blocked) setBlockedSlots(blocked)
  }

  function getDaysInMonth() {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() // 0 = dimanche

    const days = []

    // Ajouter les jours vides du début
    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
      days.push(null)
    }

    // Ajouter tous les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  function getAppointmentsForDate(date) {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(apt => apt.preferred_date === dateStr)
  }

  function getBlockedSlotsForDate(date) {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return blockedSlots.filter(slot => slot.date === dateStr)
  }

  function previousMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  async function blockTimeSlot(date) {
    if (!supabase) {
      alert('Supabase non configuré')
      return
    }

    if (!blockForm.start_time || !blockForm.end_time) {
      alert('Veuillez remplir les heures de début et de fin')
      return
    }

    console.log('Tentative de blocage:', {
      date: date.toISOString().split('T')[0],
      start_time: blockForm.start_time,
      end_time: blockForm.end_time,
      note: blockForm.note
    })

    const { data, error } = await supabase
      .from('calendar_availability')
      .insert({
        date: date.toISOString().split('T')[0],
        start_time: blockForm.start_time,
        end_time: blockForm.end_time,
        is_available: false,
        note: blockForm.note || null
      })
      .select()

    console.log('Résultat:', { data, error })

    if (error) {
      console.error('Erreur complète:', error)
      alert('Erreur lors du blocage:\n' + error.message + '\n\nVérifiez:\n1. Avez-vous exécuté la migration 005_calendar_availability.sql ?\n2. Êtes-vous connecté en tant qu\'admin ?\n3. Vous êtes-vous déconnecté puis reconnecté après avoir ajouté le rôle admin ?')
      return
    }

    // Succès
    alert('Créneau bloqué avec succès !')
    setShowBlockForm(false)
    setSelectedDate(null)
    setBlockForm({ start_time: '', end_time: '', note: '' })
    fetchMonthData()
  }

  async function deleteBlockedSlot(slotId) {
    if (!supabase) return
    if (!confirm('Supprimer ce blocage ?')) return

    const { error } = await supabase
      .from('calendar_availability')
      .delete()
      .eq('id', slotId)

    if (!error) {
      fetchMonthData()
    }
  }

  const days = getDaysInMonth()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div style={{
      background: 'white',
      padding: '2rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      marginBottom: '2rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <button onClick={previousMonth} style={{
          padding: '0.5rem 1rem',
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px',
          fontWeight: '600'
        }}>
          ← Mois précédent
        </button>

        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.8rem',
          margin: 0
        }}>
          {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </h2>

        <button onClick={nextMonth} style={{
          padding: '0.5rem 1rem',
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px',
          fontWeight: '600'
        }}>
          Mois suivant →
        </button>
      </div>

      {/* Jours de la semaine */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.5rem',
        marginBottom: '0.5rem'
      }}>
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} style={{
            textAlign: 'center',
            fontWeight: 'bold',
            padding: '0.5rem',
            color: 'var(--accent)'
          }}>
            {day}
          </div>
        ))}
      </div>

      {/* Grille du calendrier */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.5rem'
      }}>
        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} style={{ minHeight: '100px' }} />
          }

          const appts = getAppointmentsForDate(date)
          const blocked = getBlockedSlotsForDate(date)
          const isPast = date < today
          const isToday = date.toDateString() === today.toDateString()

          return (
            <div
              key={date.toISOString()}
              onClick={() => !isPast && setSelectedDate(date)}
              style={{
                minHeight: '100px',
                padding: '0.5rem',
                border: isToday ? '3px solid var(--accent)' : '1px solid #e5e7eb',
                borderRadius: '4px',
                background: isPast ? '#f9fafb' : 'white',
                cursor: isPast ? 'default' : 'pointer',
                opacity: isPast ? 0.5 : 1,
                position: 'relative'
              }}
            >
              <div style={{
                fontWeight: isToday ? 'bold' : 'normal',
                marginBottom: '0.5rem',
                color: isToday ? 'var(--accent)' : '#000'
              }}>
                {date.getDate()}
              </div>

              {/* RDV confirmés */}
              {appts.filter(a => a.status === 'confirmed').map(apt => (
                <div key={apt.id} style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem',
                  marginBottom: '0.2rem',
                  background: '#d1fae5',
                  color: '#10b981',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  ✓ {apt.preferred_time || '??'} RDV
                </div>
              ))}

              {/* RDV en attente */}
              {appts.filter(a => a.status === 'pending' || a.status === 'waiting_admin').map(apt => (
                <div key={apt.id} style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem',
                  marginBottom: '0.2rem',
                  background: '#fef3c7',
                  color: '#f59e0b',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  ⏳ {apt.preferred_time || '??'} En attente
                </div>
              ))}

              {/* Créneaux bloqués */}
              {blocked.map(slot => (
                <div
                  key={slot.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteBlockedSlot(slot.id)
                  }}
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.2rem',
                    marginBottom: '0.2rem',
                    background: '#fee2e2',
                    color: '#ef4444',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                  title={`Cliquez pour supprimer. ${slot.note || ''}`}
                >
                  ✕ {slot.start_time}-{slot.end_time} {slot.note ? `(${slot.note})` : ''}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Formulaire de blocage */}
      {selectedDate && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#f0f9ff',
          border: '2px solid var(--accent)',
          borderRadius: '4px'
        }}>
          <h3 style={{ marginBottom: '1rem', fontFamily: 'Cormorant Garamond, serif' }}>
            Bloquer un créneau le {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Heure de début *
              </label>
              <input
                type="time"
                value={blockForm.start_time}
                onChange={(e) => setBlockForm({ ...blockForm, start_time: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Heure de fin *
              </label>
              <input
                type="time"
                value={blockForm.end_time}
                onChange={(e) => setBlockForm({ ...blockForm, end_time: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Raison (optionnel)
            </label>
            <input
              type="text"
              value={blockForm.note}
              onChange={(e) => setBlockForm({ ...blockForm, note: e.target.value })}
              placeholder="Ex: Congés, Formation, Pause déjeuner..."
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => blockTimeSlot(selectedDate)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Bloquer ce créneau
            </button>
            <button
              onClick={() => {
                setSelectedDate(null)
                setBlockForm({ start_time: '', end_time: '', note: '' })
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Légende */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: 'var(--primary)',
        borderRadius: '4px',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        fontSize: '0.9rem'
      }}>
        <div>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            background: '#d1fae5',
            marginRight: '0.5rem',
            borderRadius: '2px'
          }} />
          RDV confirmé
        </div>
        <div>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            background: '#fef3c7',
            marginRight: '0.5rem',
            borderRadius: '2px'
          }} />
          RDV en attente
        </div>
        <div>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            background: '#fee2e2',
            marginRight: '0.5rem',
            borderRadius: '2px'
          }} />
          Créneau bloqué (cliquez pour supprimer)
        </div>
      </div>
    </div>
  )
}
