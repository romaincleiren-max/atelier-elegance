import { useRef, useState } from 'react'
import DressSVG from './DressSVG'

// Hauteurs de base qui varient légèrement (±15%) selon la position dans la grille
const IMG_HEIGHTS = [520, 598, 468, 572, 494, 580, 476, 555]

export default function DressCard({ dress, onViewDetails, onBookAppointment, index = 0 }) {
  const [hovered, setHovered] = useState(false)
  const videoRef = useRef(null)

  const imgHeight = IMG_HEIGHTS[index % IMG_HEIGHTS.length]
  const isVideo = !!dress.video_url

  function handleMouseEnter() {
    setHovered(true)
    if (videoRef.current) videoRef.current.play().catch(() => {})
  }

  function handleMouseLeave() {
    setHovered(false)
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0 }
  }

  return (
    <div
      className="dress-card-elegant"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onViewDetails(dress)}
    >
      {/* Visuel — image ou vidéo */}
      <div className="dress-image" style={{ height: imgHeight + 'px', aspectRatio: 'unset' }}>

        {isVideo ? (
          <>
            <video
              ref={videoRef}
              src={dress.video_url}
              muted
              loop
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.7s ease', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
            />
            {/* Icône lecture */}
            {!hovered && (
              <div style={{
                position: 'absolute', top: '1rem', left: '1rem',
                background: 'rgba(245,240,235,0.75)', backdropFilter: 'blur(4px)',
                borderRadius: '50%', width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none'
              }}>
                <span style={{ fontSize: '0.6rem', color: 'var(--text)', marginLeft: 2 }}>▶</span>
              </div>
            )}
          </>
        ) : dress.image_url ? (
          <img
            src={dress.image_url}
            alt={dress.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.7s ease', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <DressSVG style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.7s ease' }} />
        )}

        {/* Overlay VOIR */}
        <div style={{
          position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'Montserrat, sans-serif', fontSize: '0.52rem', fontWeight: 300,
          letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--white)',
          background: 'rgba(28,28,26,0.5)', padding: '0.45rem 1.4rem',
          opacity: hovered ? 1 : 0, transition: 'opacity 0.3s', whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}>
          Voir
        </div>

        {/* Coeur favori */}
        {dress.name && (
          <button
            onClick={e => { e.stopPropagation(); onBookAppointment && onBookAppointment(dress) }}
            style={{
              position: 'absolute', bottom: '1rem', right: '1rem',
              background: 'none', border: 'none', cursor: 'pointer',
              opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
              padding: '4px', lineHeight: 1
            }}
            title="Prendre rendez-vous"
          >
            <svg width="16" height="14" viewBox="0 0 24 21" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M12 19.5C12 19.5 2 13 2 6.5C2 3.46 4.46 1 7.5 1C9.24 1 10.91 1.81 12 3.08C13.09 1.81 14.76 1 16.5 1C19.54 1 22 3.46 22 6.5C22 13 12 19.5 12 19.5Z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Infos sous l'image — seulement si la robe a un nom */}
      {dress.name && (
        <div className="dress-info">
          <div className="dress-style">{dress.style || dress.category}</div>
          <h3 className="dress-title">{dress.name}</h3>
          {dress.price && (
            <div className="dress-price">{dress.price} €</div>
          )}
        </div>
      )}
    </div>
  )
}
