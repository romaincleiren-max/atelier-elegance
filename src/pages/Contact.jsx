import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Contact() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  async function handleSubmit(e) {
    e.preventDefault()

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.message) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires' })
      return
    }

    if (!supabase) {
      setMessage({ type: 'error', text: 'Service non disponible. Veuillez réessayer plus tard.' })
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from('contact_messages')
      .insert({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject || null,
        message: formData.message,
        status: 'new'
      })

    if (!error) {
      setMessage({
        type: 'success',
        text: 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.'
      })
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } else {
      setMessage({ type: 'error', text: 'Une erreur est survenue. Veuillez réessayer.' })
      console.error(error)
    }

    setLoading(false)
  }

  return (
    <div style={{ marginTop: '120px', padding: '2rem', maxWidth: '1000px', margin: '120px auto 0' }}>
      {/* Bouton Prendre RDV */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <a
          href="/book-appointment"
          className="btn-primary"
          style={{
            display: 'inline-block',
            padding: '1.2rem 3rem',
            fontSize: '1.2rem',
            fontWeight: '600',
            textDecoration: 'none',
            background: 'var(--gradient-sunset)',
            color: 'white',
            borderRadius: '50px',
            boxShadow: '0 8px 25px rgba(255, 107, 138, 0.3)',
            transition: 'all 0.3s ease',
            border: 'none'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-3px)'
            e.target.style.boxShadow = '0 12px 35px rgba(255, 107, 138, 0.4)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 138, 0.3)'
          }}
        >
          📅 Prendre Rendez-vous
        </a>
      </div>

      <h1 className="dress-title" style={{ marginBottom: '1rem', textAlign: 'center' }}>
        Contactez-nous
      </h1>

      <p style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '1.1rem', opacity: 0.8 }}>
        Une question ? Une demande particulière ? N'hésitez pas à nous envoyer un message.
      </p>

      {message.text && (
        <div style={{
          padding: '1rem',
          marginBottom: '2rem',
          background: message.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: message.type === 'error' ? '#ef4444' : '#10b981',
          borderRadius: '4px',
          border: `2px solid ${message.type === 'error' ? '#ef4444' : '#10b981'}`,
          textAlign: 'center',
          fontWeight: '600'
        }}>
          {message.text}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3rem',
        alignItems: 'start'
      }}>
        {/* Formulaire */}
        <div style={{
          background: 'white',
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', marginBottom: '1.5rem' }}>
            Envoyez-nous un message
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-row" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Sujet</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Ex: Question sur les tarifs, Demande de renseignements..."
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows="6"
                required
                placeholder="Votre message..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>
          </form>

          <p style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.7, textAlign: 'center' }}>
            * Champs obligatoires
          </p>
        </div>

        {/* Informations de contact */}
        <div>
          <div style={{
            background: 'white',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', marginBottom: '1.5rem' }}>
              Nos coordonnées
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                📍 Adresse
              </h3>
              <p style={{ lineHeight: '1.6' }}>
                123 Rue de l'Élégance<br />
                75001 Paris<br />
                France
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                📞 Téléphone
              </h3>
              <p>
                <a href="tel:0123456789" style={{ color: 'inherit', textDecoration: 'none' }}>
                  01 23 45 67 89
                </a>
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                📧 Email
              </h3>
              <p>
                <a href="mailto:contact@atelier-elegance.fr" style={{ color: 'inherit', textDecoration: 'none' }}>
                  contact@atelier-elegance.fr
                </a>
              </p>
            </div>

            <div>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                🕐 Horaires
              </h3>
              <p style={{ lineHeight: '1.8' }}>
                <strong>Lundi - Vendredi:</strong> 10h - 18h<br />
                <strong>Samedi:</strong> 10h - 17h<br />
                <strong>Dimanche:</strong> Fermé<br />
                <br />
                <em style={{ fontSize: '0.9rem', opacity: 0.8 }}>Sur rendez-vous uniquement</em>
              </p>
            </div>
          </div>

          <div style={{
            background: '#f0f9ff',
            padding: '1.5rem',
            borderRadius: '4px',
            border: '2px solid var(--accent)'
          }}>
            <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--accent)' }}>
              💡 Bon à savoir
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              Pour prendre rendez-vous pour un essayage, nous vous invitons à{' '}
              <a href="/account" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                créer un compte
              </a>{' '}
              et à réserver directement votre créneau depuis notre catalogue.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
