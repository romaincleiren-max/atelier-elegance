import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function BookAppointment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
    appointmentType: 'consultation' // consultation, essayage, retouche, autre
  })

  async function handleSubmit(e) {
    e.preventDefault()

    if (!user) {
      alert('Vous devez être connecté pour prendre rendez-vous')
      navigate('/account')
      return
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          dress_id: null, // Pas de robe associée
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          preferred_date: formData.preferredDate || null,
          preferred_time: formData.preferredTime || null,
          message: formData.message ? `[${formData.appointmentType}] ${formData.message}` : `Type de rendez-vous: ${formData.appointmentType}`,
          status: 'pending',
          last_proposal_by: 'user'
        })

      if (error) throw error

      alert('Votre demande de rendez-vous a été envoyée avec succès !\n\nNous vous recontacterons très prochainement pour confirmer votre rendez-vous.')
      navigate('/account')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ marginTop: '120px', padding: '2rem', maxWidth: '800px', margin: '120px auto 0' }}>
      <h1 className="dress-title" style={{ marginBottom: '1rem', textAlign: 'center' }}>
        Prendre Rendez-vous
      </h1>

      <p style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '1.1rem', opacity: 0.8 }}>
        Remplissez le formulaire ci-dessous pour demander un rendez-vous. Nous vous recontacterons rapidement pour confirmer la date et l'heure.
      </p>

      {!user && (
        <div style={{
          padding: '1.5rem',
          marginBottom: '2rem',
          background: '#fee2e2',
          color: '#ef4444',
          borderRadius: '8px',
          border: '2px solid #ef4444',
          textAlign: 'center'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '1rem' }}>
            ⚠️ Vous devez être connecté pour prendre rendez-vous
          </p>
          <a
            href="/account"
            style={{
              display: 'inline-block',
              padding: '0.8rem 2rem',
              background: '#ef4444',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '25px',
              fontWeight: '600'
            }}
          >
            Se connecter / Créer un compte
          </a>
        </div>
      )}

      <div style={{
        background: 'white',
        padding: '2.5rem',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '2px solid var(--secondary)'
      }}>
        <form onSubmit={handleSubmit}>
          {/* Type de rendez-vous */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Type de rendez-vous *
            </label>
            <select
              value={formData.appointmentType}
              onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '2px solid var(--secondary)',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'Montserrat, sans-serif'
              }}
              required
            >
              <option value="consultation">Consultation / Première rencontre</option>
              <option value="essayage">Essayage d'une robe</option>
              <option value="retouche">Retouches</option>
              <option value="surmesure">Création sur-mesure</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          {/* Prénom et Nom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Prénom *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid var(--secondary)',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Nom *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid var(--secondary)',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          {/* Email et Téléphone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid var(--secondary)',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Téléphone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="06 12 34 56 78"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid var(--secondary)',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          {/* Date et heure préférées */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Date préférée (optionnel)
              </label>
              <input
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid var(--secondary)',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Heure préférée (optionnel)
              </label>
              <input
                type="time"
                value={formData.preferredTime}
                onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid var(--secondary)',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          {/* Message */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Message ou précisions (optionnel)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows="5"
              placeholder="Décrivez brièvement votre projet, vos besoins, ou toute information utile..."
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '2px solid var(--secondary)',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'Montserrat, sans-serif'
              }}
            />
          </div>

          {/* Boutons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              type="submit"
              disabled={submitting || !user}
              className="btn-primary"
              style={{
                padding: '1rem 3rem',
                fontSize: '1.1rem',
                cursor: (submitting || !user) ? 'not-allowed' : 'pointer',
                opacity: (submitting || !user) ? 0.6 : 1,
                background: 'var(--gradient-sunset)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontWeight: '600'
              }}
            >
              {submitting ? 'Envoi en cours...' : '📅 Envoyer la demande'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="btn-secondary"
              style={{
                padding: '1rem 2rem',
                fontSize: '1rem',
                background: 'transparent',
                border: '2px solid var(--accent)',
                color: 'var(--accent)',
                borderRadius: '50px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Retour
            </button>
          </div>

          <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', opacity: 0.7, textAlign: 'center' }}>
            * Champs obligatoires
          </p>
        </form>
      </div>

      {/* Informations complémentaires */}
      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        background: 'var(--gradient-soft)',
        borderRadius: '15px',
        border: '2px solid var(--secondary)'
      }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>
          📍 Informations pratiques
        </h3>
        <div style={{ lineHeight: '1.8', opacity: 0.9 }}>
          <p style={{ marginBottom: '0.8rem' }}>
            <strong>Adresse:</strong> Bordeaux, France
          </p>
          <p style={{ marginBottom: '0.8rem' }}>
            <strong>Horaires:</strong> Lundi - Samedi, sur rendez-vous uniquement
          </p>
          <p style={{ marginBottom: '0.8rem' }}>
            <strong>Délai de réponse:</strong> Nous vous répondrons sous 24-48h
          </p>
          <p style={{ fontStyle: 'italic', fontSize: '0.95rem', marginTop: '1rem' }}>
            💡 Astuce: Pour un essayage de robe, vous pouvez aussi réserver directement depuis notre{' '}
            <a href="/" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
              catalogue de robes
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
