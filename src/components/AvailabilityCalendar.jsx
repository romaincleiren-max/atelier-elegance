import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// Calendrier en lecture seule pour les utilisateurs
// Affiche les disponibilités de l'admin
export default function AvailabilityCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [blockedSlots, setBlockedSlots] = useState([])
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    fetchMonthData()
  }, [currentMonth])

  async function fetchMonthData() {
    if (!supabase) return

    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    // Récupérer les créneaux bloqués (indisponibilités)
    const { data: blocked } = await supabase
      .from('calendar_availability')
      .select('*')
      .eq('is_available', false)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0])

    if (blocked) setBlockedSlots(blocked)

    // Récupérer les RDV confirmés pour montrer les créneaux occupés
    const { data: appts } = await supabase
      .from('appointments')
      .select('preferred_date, preferred_time, status')
      .in('status', ['confirmed', 'waiting_user', 'waiting_admin'])
      .gte('preferred_date', startOfMonth.toISOString().split('T')[0])
      .lte('preferred_date', endOfMonth.toISOString().split('T')[0])

    if (appts) setAppointments(appts)
  }

  function getDaysInMonth() {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Jours vides au début
    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
      days.push(null)
    }

    // Tous les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  function getBlockedSlotsForDate(date) {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return blockedSlots.filter(slot => slot.date === dateStr)
  }

  function getAppointmentsForDate(date) {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(apt => apt.preferred_date === dateStr)
  }

  function isDayAvailable(date) {
    if (!date) return false

    const blocked = getBlockedSlotsForDate(date)
    const appts = getAppointmentsForDate(date)

    // Si toute la journée est bloquée ou si plusieurs RDV
    return blocked.length === 0 && appts.length < 2
  }

  function previousMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
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
      <h2 className="dress-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
        Disponibilités de l'atelier
      </h2>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
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
          ← Précédent
        </button>

        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.5rem',
          margin: 0
        }}>
          {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </h3>

        <button onClick={nextMonth} style={{
          padding: '0.5rem 1rem',
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px',
          fontWeight: '600'
        }}>
          Suivant →
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
            return <div key={`empty-${idx}`} style={{ minHeight: '80px' }} />
          }

          const blocked = getBlockedSlotsForDate(date)
          const appts = getAppointmentsForDate(date)
          const isPast = date < today
          const isToday = date.toDateString() === today.toDateString()
          const available = isDayAvailable(date) && !isPast

          return (
            <div
              key={date.toISOString()}
              style={{
                minHeight: '80px',
                padding: '0.5rem',
                border: isToday ? '3px solid var(--accent)' : '1px solid #e5e7eb',
                borderRadius: '4px',
                background: isPast ? '#f9fafb' : available ? '#f0fdf4' : blocked.length > 0 ? '#fee2e2' : 'white',
                opacity: isPast ? 0.5 : 1
              }}
            >
              <div style={{
                fontWeight: isToday ? 'bold' : 'normal',
                marginBottom: '0.5rem',
                color: isToday ? 'var(--accent)' : '#000'
              }}>
                {date.getDate()}
              </div>

              {/* Créneaux bloqués */}
              {blocked.map(slot => (
                <div key={slot.id} style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem',
                  marginBottom: '0.2rem',
                  background: '#fee2e2',
                  color: '#ef4444',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  ✕ {slot.start_time}-{slot.end_time}
                  {slot.note && <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{slot.note}</div>}
                </div>
              ))}

              {/* Créneaux occupés par des RDV */}
              {appts.filter(a => a.status === 'confirmed').map((apt, i) => (
                <div key={i} style={{
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
                  • {apt.preferred_time || 'RDV'} Occupé
                </div>
              ))}

              {/* Indicateur de disponibilité */}
              {available && blocked.length === 0 && appts.length === 0 && (
                <div style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem',
                  background: '#d1fae5',
                  color: '#10b981',
                  borderRadius: '2px',
                  textAlign: 'center'
                }}>
                  ✓ Disponible
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Légende */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'var(--primary)',
        borderRadius: '4px',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        fontSize: '0.85rem'
      }}>
        <div>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            background: '#f0fdf4',
            marginRight: '0.5rem',
            borderRadius: '2px',
            border: '1px solid #10b981'
          }} />
          Journée disponible
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
          Créneau indisponible
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
          Créneau occupé
        </div>
      </div>

      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: '#f0f9ff',
        borderRadius: '4px',
        fontSize: '0.9rem',
        color: '#0369a1'
      }}>
        💡 <strong>Conseil :</strong> Privilégiez les journées marquées "Disponible" pour votre demande de rendez-vous. L'admin pourra vous confirmer rapidement !
      </div>
    </div>
  )
}
