import { useRef, useState, useEffect } from 'react'

export default function Carousel({ children, itemWidth = 400 }) {
  const carouselRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (!carouselRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    const carousel = carouselRef.current
    if (carousel) {
      carousel.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      return () => {
        carousel.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [children])

  const scroll = (direction) => {
    if (!carouselRef.current) return

    const scrollAmount = itemWidth + 16 // itemWidth + gap
    const newPosition = direction === 'left'
      ? carouselRef.current.scrollLeft - scrollAmount
      : carouselRef.current.scrollLeft + scrollAmount

    carouselRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    })
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Flèche gauche */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          style={{
            position: 'absolute',
            left: '-20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            background: 'var(--gradient-sunset)',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(255, 107, 138, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1.1)'
            e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 138, 0.6)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1)'
            e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 138, 0.4)'
          }}
        >
          ‹
        </button>
      )}

      {/* Carrousel */}
      <div
        ref={carouselRef}
        style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          paddingBottom: '1rem',
          scrollbarWidth: 'thin',
          WebkitOverflowScrolling: 'touch'
        }}
        className="custom-scrollbar"
      >
        {children}
      </div>

      {/* Flèche droite */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          style={{
            position: 'absolute',
            right: '-20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            background: 'var(--gradient-sunset)',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(255, 107, 138, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1.1)'
            e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 138, 0.6)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1)'
            e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 138, 0.4)'
          }}
        >
          ›
        </button>
      )}
    </div>
  )
}
