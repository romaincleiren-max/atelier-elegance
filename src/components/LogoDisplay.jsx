import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function LogoDisplay({ placement, className = '', style = {} }) {
  const [logos, setLogos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogos()
  }, [placement])

  async function fetchLogos() {
    if (!supabase) return
    
    const { data, error } = await supabase
      .from('logos')
      .select('*')
      .eq('placement', placement)
      .eq('active', true)
      .order('display_order', { ascending: true })

    if (!error && data) {
      setLogos(data)
    }
    setLoading(false)
  }

  if (loading || logos.length === 0) return null

  return (
    <div className={className} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', ...style }}>
      {logos.map((logo) => {
        const logoStyle = {
          maxWidth: logo.width ? logo.width + 'px' : '150px',
          maxHeight: logo.height ? logo.height + 'px' : '60px',
          objectFit: 'contain'
        }

        const logoImage = (
          <img
            key={logo.id}
            src={logo.image_url}
            alt={logo.name}
            title={logo.description || logo.name}
            style={logoStyle}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        )

        if (logo.link_url) {
          return (
            <a
              key={logo.id}
              href={logo.link_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block' }}
            >
              {logoImage}
            </a>
          )
        }

        return logoImage
      })}
    </div>
  )
}
