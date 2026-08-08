import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    // Pour l'instant : juste un retour visuel (pas encore branché à un service)
    setSent(true)
    setEmail('')
  }

  return (
    <section className="newsletter-section">
      <p className="newsletter-label">Newsletter</p>
      <h2 className="newsletter-title">
        Suivre l'atelier, <em>recevoir les nouvelles collections</em>
      </h2>

      {sent ? (
        <p className="newsletter-confirm">Merci — vous serez parmi les premiers informés.</p>
      ) : (
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <div className="newsletter-input-wrap">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Votre adresse e-mail"
              required
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-btn" aria-label="S'inscrire">
              →
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
