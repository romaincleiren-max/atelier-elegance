import { useRef, useState, useEffect } from 'react'

export default function Carousel({ children, itemWidth = 400 }) {
  const carouselRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftStart, setScrollLeftStart] = useState(0)

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

  // Drag to scroll handlers
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeftStart(carouselRef.current.scrollLeft)
    carouselRef.current.style.cursor = 'grabbing'
    carouselRef.current.style.userSelect = 'none'
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    carouselRef.current.style.cursor = 'grab'
    carouselRef.current.style.userSelect = 'auto'
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 1.5 // Scroll speed multiplier - plus fluide
    carouselRef.current.scrollLeft = scrollLeftStart - walk
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
      carouselRef.current.style.cursor = 'grab'
    }
  }

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft)
    setScrollLeftStart(carouselRef.current.scrollLeft)
  }

  const handleTouchMove = (e) => {
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 1.5 // Plus fluide
    carouselRef.current.scrollLeft = scrollLeftStart - walk
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Flèche gauche */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          aria-label="Précédent"
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
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: 0.9
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1.15)'
            e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 138, 0.6)'
            e.target.style.opacity = '1'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1)'
            e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 138, 0.4)'
            e.target.style.opacity = '0.9'
          }}
        >
          ‹
        </button>
      )}

      {/* Carrousel avec drag-to-scroll */}
      <div
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          scrollBehavior: isDragging ? 'auto' : 'smooth',
          paddingBottom: '1rem',
          scrollbarWidth: 'thin',
          WebkitOverflowScrolling: 'touch',
          cursor: 'grab',
          scrollSnapType: 'x mandatory'
        }}
        className="custom-scrollbar carousel-parallax"
      >
        {children}
      </div>

      {/* Flèche droite */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          aria-label="Suivant"
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
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: 0.9
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1.15)'
            e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 138, 0.6)'
            e.target.style.opacity = '1'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1)'
            e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 138, 0.4)'
            e.target.style.opacity = '0.9'
          }}
        >
          ›
        </button>
      )}
    </div>
  )
}
