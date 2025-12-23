import { useState } from 'react'
import DressSVG from './DressSVG'

export default function DressCard({ dress, onViewDetails, onBookAppointment }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="dress-card-elegant"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails(dress)}
      style={{
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        zIndex: isHovered ? 20 : 1,
        border: isHovered ? '3px solid #ff6b8a' : '3px solid transparent',
        borderRadius: '15px',
        boxShadow: isHovered
          ? '0 20px 60px rgba(255, 107, 138, 0.4)'
          : '0 4px 15px rgba(0,0,0,0.1)',
        background: 'white'
      }}
    >
      <div className="dress-image" style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px 12px 0 0',
        height: '300px',
        background: 'var(--primary)'
      }}>
        <DressSVG />
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'var(--gradient-sunset)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(255, 107, 138, 0.3)'
        }}>
          {dress.style}
        </div>
      </div>

      <div className="dress-info" style={{
        padding: '1.5rem',
        position: 'relative'
      }}>
        <h3 className="dress-title" style={{
          fontSize: '1.8rem',
          marginBottom: '0.5rem',
          color: 'var(--dark)'
        }}>
          {dress.name}
        </h3>

        <p className="dress-description" style={{
          fontSize: '0.95rem',
          opacity: 0.8,
          marginBottom: '1rem',
          lineHeight: '1.6',
          minHeight: '3rem'
        }}>
          {dress.description}
        </p>

        <div className="dress-price" style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'var(--accent)',
          marginBottom: '1rem',
          fontFamily: 'Cormorant Garamond, serif'
        }}>
          {dress.price}€
        </div>

        <div className="dress-actions" style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '1.5rem'
        }}>
          <button
            className="action-btn btn-primary"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails(dress)
            }}
            style={{
              flex: 1,
              padding: '0.9rem',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}
          >
            Détails
          </button>
          <button
            className="action-btn btn-secondary"
            onClick={(e) => {
              e.stopPropagation()
              onBookAppointment(dress)
            }}
            style={{
              flex: 1,
              padding: '0.9rem',
              fontSize: '0.95rem'
            }}
          >
            Essayer
          </button>
        </div>
      </div>
    </div>
  )
}
