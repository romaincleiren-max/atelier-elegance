import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { useAdminCheck } from '../hooks/useAdminCheck'
import { isValidUrl, isValidImageUrl } from '../lib/validation'

export default function AdminSettings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useAdminCheck()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [settings, setSettings] = useState({
    hero_video_url: '',
    hero_video_start: '51',
    accessories_banner_url: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    fetchSettings()
  }, [user, navigate])

  async function fetchSettings() {
    if (!supabase) return

    setLoading(true)
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .in('setting_key', ['hero_video_url', 'hero_video_start', 'accessories_banner_url'])

    if (!error && data) {
      const settingsObj = {}
      data.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value
      })
      setSettings(settingsObj)
    }
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!supabase) return

    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      // Validation des URLs
      if (settings.hero_video_url && !isValidUrl(settings.hero_video_url)) {
        throw new Error('URL de la vidéo invalide. Utilisez uniquement http:// ou https://')
      }

      if (settings.accessories_banner_url && !isValidImageUrl(settings.accessories_banner_url)) {
        throw new Error('URL de la bannière invalide. Utilisez une URL d\'image valide (http:// ou https://)')
      }

      // Validation du timestamp
      const timestamp = parseInt(settings.hero_video_start)
      if (isNaN(timestamp) || timestamp < 0) {
        throw new Error('Le timestamp de démarrage doit être un nombre positif')
      }

      // Mettre à jour l'URL de la vidéo
      const { error: urlError } = await supabase
        .from('site_settings')
        .update({ setting_value: settings.hero_video_url })
        .eq('setting_key', 'hero_video_url')

      if (urlError) throw urlError

      // Mettre à jour le timestamp de démarrage
      const { error: startError } = await supabase
        .from('site_settings')
        .update({ setting_value: settings.hero_video_start })
        .eq('setting_key', 'hero_video_start')

      if (startError) throw startError

      // Mettre à jour l'URL de la bannière accessoires
      const { error: bannerError } = await supabase
        .from('site_settings')
        .update({ setting_value: settings.accessories_banner_url })
        .eq('setting_key', 'accessories_banner_url')

      if (bannerError) throw bannerError

      setMessage({ type: 'success', text: 'Paramètres enregistrés avec succès ! Rechargez la page d\'accueil pour voir les changements.' })
    } catch (error) {
      console.error('[AdminSettings] Erreur de validation/sauvegarde')
      setMessage({ type: 'error', text: error.message || 'Erreur lors de l\'enregistrement' })
    } finally {
      setSaving(false)
    }
  }

  function extractVideoId(url) {
    // Extraire l'ID de la vidéo YouTube depuis différents formats d'URL
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  function getPreviewUrl() {
    const videoId = extractVideoId(settings.hero_video_url)
    if (!videoId) return null

    return `https://www.youtube.com/embed/${videoId}?start=${settings.hero_video_start || 0}&autoplay=0&mute=0&controls=1`
  }

  if (adminLoading) {
    return (
      <div style={{ marginTop: '120px', padding: '2rem', textAlign: 'center' }}>
        <p>Chargement...</p>
      </div>
    )
  }

  if (!user || !isAdmin) return null

  return (
    <div style={{ marginTop: '120px', padding: '2rem', maxWidth: '1000px', margin: '120px auto 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="dress-title" style={{ margin: 0 }}>
          Paramètres du Site
        </h1>
        <a
          href="/admin"
          style={{
            padding: '0.8rem 1.5rem',
            background: 'var(--gradient-sunset)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '25px',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          ← Retour Admin
        </a>
      </div>

      {message.text && (
        <div style={{
          padding: '1rem',
          marginBottom: '2rem',
          background: message.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: message.type === 'error' ? '#ef4444' : '#10b981',
          borderRadius: '8px',
          border: `2px solid ${message.type === 'error' ? '#ef4444' : '#10b981'}`,
          textAlign: 'center',
          fontWeight: '600'
        }}>
          {message.text}
        </div>
      )}

      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '2px solid var(--secondary)'
      }}>
        <h2 className="dress-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          Vidéo de fond de la page d'accueil
        </h2>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                URL de la vidéo YouTube *
              </label>
              <input
                type="url"
                value={settings.hero_video_url}
                onChange={(e) => setSettings({ ...settings, hero_video_url: e.target.value })}
                required
                placeholder="https://www.youtube.com/watch?v=..."
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid var(--secondary)',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>
                Formats acceptés: https://www.youtube.com/watch?v=... ou https://youtu.be/...
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Timestamp de démarrage (en secondes)
              </label>
              <input
                type="number"
                min="0"
                value={settings.hero_video_start}
                onChange={(e) => setSettings({ ...settings, hero_video_start: e.target.value })}
                placeholder="51"
                style={{
                  width: '150px',
                  padding: '0.8rem',
                  border: '2px solid var(--secondary)',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>
                La vidéo démarrera à partir de ce moment (0 = début)
              </p>
            </div>

            {/* Aperçu de la vidéo */}
            {getPreviewUrl() && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600' }}>
                  Aperçu de la vidéo
                </h3>
                <div style={{
                  position: 'relative',
                  paddingBottom: '56.25%',
                  height: 0,
                  overflow: 'hidden',
                  borderRadius: '8px',
                  border: '2px solid var(--secondary)'
                }}>
                  <iframe
                    src={getPreviewUrl()}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Bannière Accessoires */}
            <div style={{
              marginBottom: '2rem',
              padding: '2rem',
              background: 'var(--gradient-soft)',
              borderRadius: '12px',
              border: '2px solid var(--secondary)'
            }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontWeight: '600', fontFamily: 'Cormorant Garamond, serif' }}>
                Bannière Accessoires
              </h3>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  URL de l'image de la bannière
                </label>
                <input
                  type="url"
                  value={settings.accessories_banner_url}
                  onChange={(e) => setSettings({ ...settings, accessories_banner_url: e.target.value })}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '2px solid var(--secondary)',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
                <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>
                  Cette bannière apparaîtra en bas de la page d'accueil avec un bouton "Accessoires"
                </p>
              </div>

              {/* Aperçu de la bannière */}
              {settings.accessories_banner_url && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Aperçu de la bannière
                  </h4>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '200px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '2px solid var(--secondary)'
                  }}>
                    <img
                      src={settings.accessories_banner_url}
                      alt="Aperçu bannière"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '1rem 2rem',
                background: 'var(--gradient-sunset)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1
              }}
            >
              {saving ? 'Enregistrement...' : '💾 Enregistrer les paramètres'}
            </button>
          </form>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'var(--gradient-soft)',
        borderRadius: '15px',
        border: '2px solid var(--secondary)'
      }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent)', fontWeight: '600' }}>
          💡 Comment trouver une vidéo YouTube ?
        </h3>
        <ol style={{ lineHeight: '1.8', paddingLeft: '1.5rem' }}>
          <li>Allez sur YouTube et trouvez la vidéo que vous souhaitez utiliser</li>
          <li>Copiez l'URL complète depuis la barre d'adresse (ex: https://www.youtube.com/watch?v=abc123)</li>
          <li>Collez l'URL dans le champ ci-dessus</li>
          <li>Si vous voulez que la vidéo démarre à un moment précis, regardez la vidéo et notez le temps en secondes</li>
          <li>Cliquez sur "Enregistrer les paramètres"</li>
          <li>Rechargez la page d'accueil pour voir les changements</li>
        </ol>
      </div>
    </div>
  )
}
