import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import DressCard from '../components/DressCard'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dresses, setDresses] = useState([])
  const [filteredDresses, setFilteredDresses] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDress, setSelectedDress] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false)
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=k1gj5wCLAhc')
  const [videoStart, setVideoStart] = useState('51')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [appointmentForm, setAppointmentForm] = useState({
    firstName: '', lastName: '', email: user?.email || '',
    phone: '', preferredDate: '', preferredTime: '', message: ''
  })

  useEffect(() => {
    fetchDresses()
    fetchSettings()
  }, [])

  // Ajoute la classe 'visible' quand les cartes entrent dans le viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    )
    const cards = document.querySelectorAll('.dress-card, .dress-card-elegant')
    cards.forEach(c => observer.observe(c))
    return () => cards.forEach(c => observer.unobserve(c))
  }, [filteredDresses])

  // Header transparent sur le hero
  useEffect(() => {
    const header = document.querySelector('.header')
    if (!header) return
    const heroEl = document.querySelector('.hero-image')
    if (!heroEl) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          header.classList.add('header--transparent')
        } else {
          header.classList.remove('header--transparent')
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(heroEl)
    return () => observer.disconnect()
  }, [])

  async function fetchSettings() {
    if (!supabase) return
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .in('setting_key', ['hero_video_url', 'hero_video_start', 'hero_image_url'])
    if (!error && data) {
      data.forEach(s => {
        if (s.setting_key === 'hero_video_url') setVideoUrl(s.setting_value)
        else if (s.setting_key === 'hero_video_start') setVideoStart(s.setting_value)
        else if (s.setting_key === 'hero_image_url') setHeroImageUrl(s.setting_value)
      })
    }
  }

  async function fetchDresses() {
    const fallback = [
      { id: 1, name: "Aurore",     style: "Princesse", description: "Robe volumineuse avec jupe en tulle et bustier brodé de perles.", price: 2490, category: "princesse" },
      { id: 2, name: "Séréna",     style: "Sirène",    description: "Silhouette ajustée jusqu'aux genoux puis évasée. Dentelle française.", price: 2890, category: "sirene" },
      { id: 3, name: "Luna",       style: "Empire",    description: "Taille haute sous la poitrine, fluide et élégante.", price: 1990, category: "empire" },
      { id: 4, name: "Céleste",    style: "Bohème",    description: "Dentelle délicate, manches longues et coupe fluide.", price: 2290, category: "boheme" },
      { id: 5, name: "Marguerite", style: "Princesse", description: "Jupe en organza avec traîne royale.", price: 3490, category: "princesse" },
      { id: 6, name: "Ophélie",    style: "Sirène",    description: "Robe sculptante en crêpe avec détails en dentelle.", price: 2690, category: "sirene" },
    ]
    if (supabase) {
      const { data, error } = await supabase.from('dresses').select('*').order('id', { ascending: true })
      if (!error && data && data.length > 0) {
        setDresses(data); setFilteredDresses(data); return
      }
    }
    setDresses(fallback); setFilteredDresses(fallback)
  }

  function filterDresses(cat) {
    setActiveFilter(cat)
    setFilteredDresses(cat === 'all' ? dresses : dresses.filter(d => d.category === cat))
  }

  function scrollToCollection() {
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
  }

  function openModal(dress) { setSelectedDress(dress); setCurrentImageIndex(0); setModalOpen(true) }
  function closeModal()      { setModalOpen(false); setSelectedDress(null); setCurrentImageIndex(0) }

  function bookAppointment(dress) {
    if (!user) { alert('Vous devez être connecté pour prendre rendez-vous'); return }
    setSelectedDress(dress)
    setAppointmentForm({ ...appointmentForm, email: user.email })
    setAppointmentModalOpen(true)
    setModalOpen(false)
  }

  async function submitAppointment(e) {
    e.preventDefault()
    if (!supabase || !user) { alert('Vous devez être connecté'); return }
    const { error } = await supabase.from('appointments').insert({
      user_id: user.id, dress_id: selectedDress.id,
      first_name: appointmentForm.firstName, last_name: appointmentForm.lastName,
      email: appointmentForm.email, phone: appointmentForm.phone,
      preferred_date: appointmentForm.preferredDate || null,
      preferred_time: appointmentForm.preferredTime || null,
      message: appointmentForm.message, status: 'pending'
    })
    if (error) { alert('Erreur: ' + error.message) }
    else {
      alert('Rendez-vous demandé avec succès.')
      setAppointmentModalOpen(false)
      setAppointmentForm({ firstName:'', lastName:'', email: user.email, phone:'', preferredDate:'', preferredTime:'', message:'' })
    }
  }

  async function addToFavorites(dress) {
    if (!user || !supabase) { alert('Vous devez être connecté'); return }
    const { error } = await supabase.from('favorites').insert({ user_id: user.id, dress_id: dress.id })
    if (error) {
      alert(error.code === '23505' ? 'Déjà dans vos favoris.' : 'Erreur: ' + error.message)
    } else {
      alert(`"${dress.name}" ajoutée aux favoris.`)
    }
  }

  // Extrait l'ID vidéo YouTube
  const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1] || 'k1gj5wCLAhc'
  const embedSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&cc_load_policy=0&iv_load_policy=3&start=${videoStart}`

  // Dernière robe pour le bouton Collection
  const latestDress = dresses[dresses.length - 1]

  return (
    <>
      {/* ─── 1. HERO IMAGE ─────────────────────────────────────────── */}
      <section className="hero-image">
        {heroImageUrl ? (
          <img src={heroImageUrl} alt="Coline Cleiren Couture" className="hero-image__img" />
        ) : (
          <div className="hero-image__placeholder" />
        )}
        <div className="hero-image__overlay" />
        <div className="hero-image__content">
          <button className="hero-label-btn" onClick={scrollToCollection}>
            Collection 2026
          </button>
        </div>
      </section>

      {/* ─── 2. SECTION VIDÉO ──────────────────────────────────────── */}
      <section className="hero-video-section">
        <div className="hero-video-wrapper">
          {videoPlaying ? (
            <iframe
              src={embedSrc}
              title="Coline Cleiren Couture"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="hero-video-iframe"
            />
          ) : (
            <div className="hero-video-poster" onClick={() => setVideoPlaying(true)}>
              <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt="Vidéo"
                className="hero-video-poster__img"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <div className="hero-video-poster__overlay" />
              <button className="hero-video-play" aria-label="Lire la vidéo">
                <span className="hero-video-play__icon">▶</span>
              </button>
            </div>
          )}

          {/* Label centré sur la vidéo */}
          <div className="hero-video-label" onClick={scrollToCollection}>
            <span className="hero-video-label__line" />
            <span className="hero-video-label__text">Collection 2026</span>
            <span className="hero-video-label__line" />
          </div>
        </div>
      </section>

      {/* ─── 3. COLLECTION ─────────────────────────────────────────── */}
      <div className="filters" id="collection">
        <div className="filter-bar">
          {[
            { key: 'all',       label: 'Toutes'    },
            { key: 'princesse', label: 'Princesse' },
            { key: 'sirene',    label: 'Sirène'    },
            { key: 'empire',    label: 'Empire'    },
            { key: 'boheme',    label: 'Bohème'    },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`filter-btn ${activeFilter === key ? 'active' : ''}`}
              onClick={() => filterDresses(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="collection">
        {filteredDresses.map((dress, i) => (
          <DressCard key={dress.id} dress={dress} index={i} onViewDetails={openModal} onBookAppointment={bookAppointment} />
        ))}
      </div>

      {/* ─── MODAL DÉTAIL ROBE ─────────────────────────────────────── */}
      {modalOpen && selectedDress && (
        <div className="modal active" onClick={e => e.target.className === 'modal active' && closeModal()}>
          <div className="modal-content" style={{ maxWidth: '1100px', width: '90%' }}>
            <button className="modal-close" onClick={closeModal}>Fermer</button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', padding: '3rem' }}>

              {/* Image */}
              <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg)' }}>
                <img
                  src={selectedDress.image_url}
                  alt={selectedDress.name}
                  style={{ width: '100%', height: '600px', objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.style.display = 'none' }}
                />
              </div>

              {/* Infos */}
              <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '1rem' }}>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.58rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.8rem' }}>
                  {selectedDress.style}
                </div>
                <h2 className="dress-title" style={{ fontSize: '2rem', marginBottom: '1.5rem', letterSpacing: '4px' }}>
                  {selectedDress.name}
                </h2>
                {selectedDress.price && (
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 300, letterSpacing: '1px', color: 'var(--text)', marginBottom: '2rem' }}>
                    {selectedDress.price} €
                  </div>
                )}
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text)', opacity: 0.85, marginBottom: '2rem' }}>
                  {selectedDress.description || 'Une création unique, réalisée à la main dans notre atelier de Bordeaux.'}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, fontFamily: 'Montserrat, sans-serif', fontSize: '0.6rem', letterSpacing: '1.5px', lineHeight: '2.5', color: 'var(--muted)', textTransform: 'uppercase', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '2.5rem' }}>
                  <li>Modèle disponible à l'essayage</li>
                  <li>Ajustements sur mesure possibles</li>
                  <li>Rendez-vous sans engagement</li>
                </ul>
                <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                  <button className="action-btn btn-primary" style={{ flex: 1 }} onClick={() => bookAppointment(selectedDress)}>
                    Prendre rendez-vous
                  </button>
                  <button className="action-btn btn-secondary" onClick={() => addToFavorites(selectedDress)}>
                    Favoris
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL RENDEZ-VOUS ─────────────────────────────────────── */}
      {appointmentModalOpen && selectedDress && (
        <div className="modal active" onClick={e => e.target.className === 'modal active' && setAppointmentModalOpen(false)}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setAppointmentModalOpen(false)}>Fermer</button>
            <div className="modal-body">
              <h2 className="dress-title" style={{ fontSize: '1.5rem', letterSpacing: '4px', marginBottom: '0.5rem' }}>
                Prendre rendez-vous
              </h2>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: 'var(--muted)', marginBottom: '2.5rem' }}>
                Pour la robe {selectedDress.name}
              </p>
              <form className="proposal-form" onSubmit={submitAppointment}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input type="text" value={appointmentForm.firstName} onChange={e => setAppointmentForm({ ...appointmentForm, firstName: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Nom *</label>
                    <input type="text" value={appointmentForm.lastName} onChange={e => setAppointmentForm({ ...appointmentForm, lastName: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" value={appointmentForm.email} onChange={e => setAppointmentForm({ ...appointmentForm, email: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Téléphone *</label>
                    <input type="tel" value={appointmentForm.phone} onChange={e => setAppointmentForm({ ...appointmentForm, phone: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date préférée</label>
                    <input type="date" value={appointmentForm.preferredDate} onChange={e => setAppointmentForm({ ...appointmentForm, preferredDate: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="form-group">
                    <label>Heure préférée</label>
                    <input type="time" value={appointmentForm.preferredTime} onChange={e => setAppointmentForm({ ...appointmentForm, preferredTime: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea value={appointmentForm.message} onChange={e => setAppointmentForm({ ...appointmentForm, message: e.target.value })} placeholder="Informations complémentaires..." />
                </div>
                <button type="submit" className="submit-proposal-btn">Confirmer la demande</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
