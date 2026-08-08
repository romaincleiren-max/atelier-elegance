import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Essayage() {
  const [atelierInfo, setAtelierInfo] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAtelierData()
  }, [])

  async function fetchAtelierData() {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Récupérer les infos de l'atelier
    const { data: info } = await supabase
      .from('atelier_info')
      .select('*')
      .single()

    if (info) setAtelierInfo(info)

    // Récupérer les photos
    const { data: photosData } = await supabase
      .from('atelier_photos')
      .select('*')
      .order('display_order', { ascending: true })

    if (photosData) setPhotos(photosData)

    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{ marginTop: '120px', padding: '2rem', textAlign: 'center' }}>
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '120px' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, white 100%)',
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <h1 className="dress-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Bienvenue chez Coline Cleiren
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', opacity: 0.8 }}>
          {atelierInfo?.description || 'Couture et sur-mesure à Bordeaux - Un atelier où vos rêves prennent vie'}
        </p>
      </div>

      {/* Contenu principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Section À propos */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="dress-title" style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
            Notre Atelier
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Basée à Bordeaux, Coline Cleiren vous accueille dans son atelier intimiste et chaleureux
                pour vous accompagner dans la création de vos pièces sur-mesure et vos retouches couture.
              </p>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Passionnée par la couture et le travail minutieux, Coline met son savoir-faire à votre service pour réaliser
                des créations uniques qui vous ressemblent et subliment votre style.
              </p>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                Chaque rendez-vous est un moment privilégié où nous prenons le temps de vous écouter,
                de comprendre vos envies et de concrétiser vos projets couture avec passion.
              </p>
            </div>

            <div style={{
              background: 'var(--primary)',
              padding: '2rem',
              borderRadius: '8px',
              border: '3px solid var(--secondary)'
            }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                Nous trouver
              </h3>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                <strong>{atelierInfo?.address || '123 Rue de l\'Élégance'}</strong><br />
                {atelierInfo?.postal_code || '75001'} {atelierInfo?.city || 'Paris'}
              </p>

              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: '1rem', marginTop: '2rem' }}>
                Horaires
              </h3>
              <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                {atelierInfo?.opening_hours ||
                  'Lundi - Vendredi: 10h - 18h\nSamedi: 10h - 17h\nDimanche: Fermé\n\nSur rendez-vous uniquement'}
              </div>

              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: '1rem', marginTop: '2rem' }}>
                Contact
              </h3>
              <p style={{ lineHeight: '1.6' }}>
                <a href={`tel:${atelierInfo?.phone || '0123456789'}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {atelierInfo?.phone || '01 23 45 67 89'}
                </a><br />
                <a href={`mailto:${atelierInfo?.email || 'contact@atelier-elegance.fr'}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {atelierInfo?.email || 'contact@atelier-elegance.fr'}
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Galerie photos */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="dress-title" style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
            Découvrez notre Atelier
          </h2>

          {photos.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {photos.map((photo) => (
                <div key={photo.id} style={{
                  background: 'white',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '2px solid var(--secondary)'
                }}>
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    style={{
                      width: '100%',
                      height: '300px',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=Image+non+disponible'
                    }}
                  />
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                      {photo.title}
                    </h3>
                    {photo.description && (
                      <p style={{ fontSize: '0.95rem', opacity: 0.8, lineHeight: '1.5' }}>
                        {photo.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: 'var(--gradient-soft)',
              padding: '3rem',
              borderRadius: '15px',
              textAlign: 'center',
              border: '2px dashed var(--secondary)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}></div>
              <h3 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '1.5rem',
                marginBottom: '1rem',
                background: 'var(--gradient-sunset)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Galerie de photos à venir
              </h3>
              <p style={{ fontSize: '1rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
                Découvrez bientôt notre atelier en images. Des photos seront ajoutées prochainement pour vous faire découvrir notre univers créatif.
              </p>
            </div>
          )}
        </section>

        {/* CTA Rendez-vous */}
        <section style={{
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%)',
          padding: '3rem',
          borderRadius: '8px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', marginBottom: '1rem' }}>
            Prête à créer votre robe de rêve ?
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.95 }}>
            Prenez rendez-vous dès maintenant pour découvrir notre collection et bénéficier de nos conseils personnalisés.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/book-appointment"
              style={{
                display: 'inline-block',
                padding: '1rem 2.5rem',
                background: 'white',
                color: 'var(--accent)',
                textDecoration: 'none',
                borderRadius: '50px',
                fontWeight: '600',
                fontSize: '1.1rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              Prendre rendez-vous
            </a>
            <a
              href="/"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                background: 'transparent',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '50px',
                fontWeight: '600',
                fontSize: '1.1rem',
                border: '2px solid white',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'white'
                e.target.style.color = 'var(--accent)'
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.color = 'white'
              }}
            >
              Découvrir la collection
            </a>
            <a
              href="/contact"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                background: 'transparent',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '50px',
                fontWeight: '600',
                fontSize: '1.1rem',
                border: '2px solid white',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'white'
                e.target.style.color = 'var(--accent)'
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.color = 'white'
              }}
            >
              Nous contacter
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
