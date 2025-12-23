import { useState, useEffect } from 'react'
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
  const [appointmentForm, setAppointmentForm] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  })

  useEffect(() => {
    fetchDresses()
    fetchVideoSettings()
  }, [])

  // Intersection Observer pour l'animation au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    // Observer toutes les cartes de robes
    const cards = document.querySelectorAll('.dress-card')
    cards.forEach((card) => observer.observe(card))

    return () => {
      cards.forEach((card) => observer.unobserve(card))
    }
  }, [filteredDresses])

  async function fetchVideoSettings() {
    if (!supabase) return

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .in('setting_key', ['hero_video_url', 'hero_video_start'])

    if (!error && data) {
      data.forEach(setting => {
        if (setting.setting_key === 'hero_video_url') {
          setVideoUrl(setting.setting_value)
        } else if (setting.setting_key === 'hero_video_start') {
          setVideoStart(setting.setting_value)
        }
      })
    }
  }

  async function fetchDresses() {
    // Données de démonstration
    const fallbackData = [
      { id: 1, name: "Aurore", style: "Princesse", description: "Robe volumineuse avec jupe en tulle et bustier brodé de perles.", price: 2490, category: "princesse" },
      { id: 2, name: "Séréna", style: "Sirène", description: "Silhouette ajustée jusqu'aux genoux puis évasée. Dentelle française.", price: 2890, category: "sirene" },
      { id: 3, name: "Luna", style: "Empire", description: "Taille haute sous la poitrine, fluide et élégante.", price: 1990, category: "empire" },
      { id: 4, name: "Céleste", style: "Bohème", description: "Dentelle délicate, manches longues et coupe fluide.", price: 2290, category: "boheme" },
      { id: 5, name: "Marguerite", style: "Princesse", description: "Jupe en organza avec traîne royale. Cristaux Swarovski.", price: 3490, category: "princesse" },
      { id: 6, name: "Ophélie", style: "Sirène", description: "Robe sculptante en crêpe avec détails en dentelle.", price: 2690, category: "sirene" }
    ]

    // Si Supabase est configuré, récupérer les données
    if (supabase) {
      const { data, error } = await supabase
        .from('dresses')
        .select('*')
        .order('id', { ascending: true })

      if (!error && data) {
        setDresses(data)
        setFilteredDresses(data)
        return
      }
    }

    // Sinon, utiliser les données de démo
    setDresses(fallbackData)
    setFilteredDresses(fallbackData)
  }

  function filterDresses(category) {
    setActiveFilter(category)
    if (category === 'all') {
      setFilteredDresses(dresses)
    } else {
      setFilteredDresses(dresses.filter(dress => dress.category === category))
    }
  }

  function scrollToCollection() {
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
  }

  function openModal(dress) {
    setSelectedDress(dress)
    setCurrentImageIndex(0)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setSelectedDress(null)
    setCurrentImageIndex(0)
  }

  function bookAppointment(dress) {
    if (!user) {
      alert('Vous devez être connecté pour prendre rendez-vous')
      return
    }
    setSelectedDress(dress)
    setAppointmentForm({ ...appointmentForm, email: user.email })
    setAppointmentModalOpen(true)
    setModalOpen(false)
  }

  async function submitAppointment(e) {
    e.preventDefault()

    if (!supabase || !user) {
      alert('Vous devez être connecté pour prendre rendez-vous')
      return
    }

    const { error } = await supabase
      .from('appointments')
      .insert({
        user_id: user.id,
        dress_id: selectedDress.id,
        first_name: appointmentForm.firstName,
        last_name: appointmentForm.lastName,
        email: appointmentForm.email,
        phone: appointmentForm.phone,
        preferred_date: appointmentForm.preferredDate || null,
        preferred_time: appointmentForm.preferredTime || null,
        message: appointmentForm.message,
        status: 'pending'
      })

    if (error) {
      alert('Erreur lors de la création du rendez-vous: ' + error.message)
    } else {
      alert('Rendez-vous demandé avec succès ! Vous pouvez le suivre dans "Mon Compte".')
      setAppointmentModalOpen(false)
      setAppointmentForm({
        firstName: '',
        lastName: '',
        email: user.email,
        phone: '',
        preferredDate: '',
        preferredTime: '',
        message: ''
      })
    }
  }

  async function addToFavorites(dress) {
    if (!user) {
      alert('Vous devez être connecté pour ajouter aux favoris')
      return
    }

    if (!supabase) {
      alert('Supabase non configuré')
      return
    }

    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        dress_id: dress.id
      })

    if (error) {
      if (error.code === '23505') {
        alert('Cette robe est déjà dans vos favoris !')
      } else {
        alert('Erreur: ' + error.message)
      }
    } else {
      alert(`La robe "${dress.name}" a été ajoutée à vos favoris ♥\nRetrouvez-la dans "Mon Compte"`)
    }
  }

  return (
    <>
      <section className="hero">
        {/* Vidéo YouTube en arrière-plan */}
        <div className="hero-video-background">
          <iframe
            src={`https://www.youtube.com/embed/${videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1] || 'k1gj5wCLAhc'}?autoplay=1&mute=1&loop=1&playlist=${videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1] || 'k1gj5wCLAhc'}&controls=0&showinfo=0&rel=0&modestbranding=1&start=${videoStart}`}
            title="Background video"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '177.77777778vh',
              minWidth: '100vw',
              height: '56.25vw',
              minHeight: '100vh',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              border: 'none'
            }}
          />
          <div className="hero-video-overlay"></div>
        </div>

        <div className="hero-content">
          <h1>Coline Cleiren <strong>Couture</strong></h1>
          <p>Couture et sur-mesure à Bordeaux • Créations Uniques</p>
          <button className="cta-button" onClick={scrollToCollection}>
            Découvrir
          </button>
        </div>
      </section>

      <div className="filters" id="collection">
        <div className="filter-bar">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => filterDresses('all')}
          >
            Toutes
          </button>
          <button
            className={`filter-btn ${activeFilter === 'princesse' ? 'active' : ''}`}
            onClick={() => filterDresses('princesse')}
          >
            Princesse
          </button>
          <button
            className={`filter-btn ${activeFilter === 'sirene' ? 'active' : ''}`}
            onClick={() => filterDresses('sirene')}
          >
            Sirène
          </button>
          <button
            className={`filter-btn ${activeFilter === 'empire' ? 'active' : ''}`}
            onClick={() => filterDresses('empire')}
          >
            Empire
          </button>
          <button
            className={`filter-btn ${activeFilter === 'boheme' ? 'active' : ''}`}
            onClick={() => filterDresses('boheme')}
          >
            Bohème
          </button>
        </div>
      </div>

      <div className="collection">
        {filteredDresses.map((dress) => (
          <DressCard
            key={dress.id}
            dress={dress}
            onViewDetails={openModal}
            onBookAppointment={bookAppointment}
          />
        ))}
      </div>

      {modalOpen && selectedDress && (
        <div className="modal active" onClick={(e) => e.target.className === 'modal active' && closeModal()}>
          <div className="modal-content" style={{ maxWidth: '1200px', width: '90%' }}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '3rem',
              padding: '2rem'
            }}>
              {/* Carrousel d'images à gauche */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '100%',
                  height: '600px',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                  <img
                    src={selectedDress.image_url}
                    alt={selectedDress.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x600?text=' + encodeURIComponent(selectedDress.name)
                    }}
                  />

                  {/* Flèches de navigation (pour futures images multiples) */}
                  <button
                    onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                    disabled={currentImageIndex === 0}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      fontSize: '1.5rem',
                      cursor: currentImageIndex === 0 ? 'not-allowed' : 'pointer',
                      opacity: currentImageIndex === 0 ? 0.3 : 1,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                    disabled={currentImageIndex === 0}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      fontSize: '1.5rem',
                      cursor: 'not-allowed',
                      opacity: 0.3,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}
                  >
                    →
                  </button>
                </div>

                {/* Indicateur d'image (1/1 pour l'instant) */}
                <div style={{
                  textAlign: 'center',
                  marginTop: '1rem',
                  fontSize: '0.9rem',
                  opacity: 0.7
                }}>
                  Photo 1 sur 1
                </div>
              </div>

              {/* Détails à droite */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--primary)',
                  color: 'var(--accent)',
                  display: 'inline-block',
                  alignSelf: 'flex-start',
                  marginBottom: '1rem',
                  fontWeight: '600',
                  borderRadius: '4px'
                }}>
                  {selectedDress.style}
                </div>

                <h2 className="dress-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                  {selectedDress.name}
                </h2>

                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'var(--accent)',
                  marginBottom: '2rem'
                }}>
                  {selectedDress.price}€
                </div>

                <div style={{
                  flex: 1,
                  marginBottom: '2rem'
                }}>
                  <h3 style={{
                    fontSize: '1.2rem',
                    marginBottom: '1rem',
                    fontFamily: 'Cormorant Garamond, serif'
                  }}>
                    Description
                  </h3>
                  <p style={{
                    fontSize: '1.05rem',
                    lineHeight: '1.8',
                    opacity: 0.9
                  }}>
                    {selectedDress.description || 'Une magnifique robe de mariée qui saura vous sublimer le jour de votre mariage.'}
                  </p>

                  {/* Caractéristiques supplémentaires */}
                  <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    background: 'var(--primary)',
                    borderRadius: '8px'
                  }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      marginBottom: '1rem',
                      fontFamily: 'Cormorant Garamond, serif'
                    }}>
                      Informations
                    </h3>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      fontSize: '0.95rem',
                      lineHeight: '2'
                    }}>
                      <li>✨ Modèle disponible à l'essayage</li>
                      <li>📏 Ajustements sur mesure possibles</li>
                      <li>🎨 Personnalisation selon vos souhaits</li>
                      <li>📅 Rendez-vous sans engagement</li>
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  flexDirection: 'column'
                }}>
                  <button
                    className="action-btn btn-primary"
                    onClick={() => bookAppointment(selectedDress)}
                    style={{
                      padding: '1rem 2rem',
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}
                  >
                    📅 Prendre Rendez-vous
                  </button>
                  <button
                    className="action-btn btn-secondary"
                    onClick={() => addToFavorites(selectedDress)}
                    style={{
                      padding: '1rem 2rem',
                      fontSize: '1.1rem'
                    }}
                  >
                    ❤️ Ajouter aux Favoris
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {appointmentModalOpen && selectedDress && (
        <div className="modal active" onClick={(e) => e.target.className === 'modal active' && setAppointmentModalOpen(false)}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setAppointmentModalOpen(false)}>×</button>
            <div className="modal-body">
              <h2 className="dress-title" style={{ marginBottom: '1.5rem' }}>
                Demander un rendez-vous
              </h2>
              <p style={{ marginBottom: '1.5rem' }}>
                Pour la robe <strong>{selectedDress.name}</strong> ({selectedDress.style})
              </p>

              <form className="proposal-form" onSubmit={submitAppointment}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input
                      type="text"
                      value={appointmentForm.firstName}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, firstName: e.target.value })}
                      required
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="form-group">
                    <label>Nom *</label>
                    <input
                      type="text"
                      value={appointmentForm.lastName}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, lastName: e.target.value })}
                      required
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={appointmentForm.email}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, email: e.target.value })}
                      required
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Téléphone *</label>
                    <input
                      type="tel"
                      value={appointmentForm.phone}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, phone: e.target.value })}
                      required
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date préférée</label>
                    <input
                      type="date"
                      value={appointmentForm.preferredDate}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, preferredDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label>Heure préférée</label>
                    <input
                      type="time"
                      value={appointmentForm.preferredTime}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, preferredTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Message (optionnel)</label>
                  <textarea
                    value={appointmentForm.message}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, message: e.target.value })}
                    placeholder="Informations complémentaires..."
                  />
                </div>

                <button type="submit" className="submit-proposal-btn">
                  Confirmer le rendez-vous
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
