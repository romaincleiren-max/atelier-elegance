import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useAdminCheck } from '../hooks/useAdminCheck'
import { isValidImageUrl } from '../lib/validation'

export default function AdminLogos() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useAdminCheck()
  const [logos, setLogos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingLogo, setEditingLogo] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    display_order: 1
  })
  const [uploadFile, setUploadFile] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/admin')
      return
    }
    fetchLogos()
  }, [user, navigate])

  async function fetchLogos() {
    if (!supabase) return
    setLoading(true)
    const { data, error } = await supabase
      .from('logos')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Erreur chargement logos:', error)
    } else {
      setLogos(data || [])
    }
    setLoading(false)
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploadFile(file)
    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      setFormData({ ...formData, image_url: publicUrl })
      alert('Image uploadée avec succès!')
    } catch (error) {
      console.error('Erreur upload:', error)
      alert('Erreur lors de l\'upload: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!supabase) return

    if (!formData.title || !formData.image_url) {
      alert('Le titre et l\'image sont obligatoires')
      return
    }

    // Validation de sécurité des URLs
    if (formData.image_url && !isValidImageUrl(formData.image_url)) {
      alert("URL d'image invalide. Utilisez uniquement des URLs https:// d'images valides")
      return
    }

    try {
      if (editingLogo) {
        const { error } = await supabase
          .from('logos')
          .update({
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url,
            display_order: formData.display_order
          })
          .eq('id', editingLogo.id)

        if (error) throw error
        alert('Logo modifiée avec succès!')
      } else {
        const { error } = await supabase
          .from('logos')
          .insert([formData])

        if (error) throw error
        alert('Logo ajoutée avec succès!')
      }

      resetForm()
      fetchLogos()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur: ' + error.message)
    }
  }

  async function handleDelete(logoId) {
    if (!supabase) return
    if (!confirm('Voulez-vous vraiment supprimer cette logo?')) return

    const { error } = await supabase
      .from('logos')
      .delete()
      .eq('id', logoId)

    if (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression')
    } else {
      alert('Logo supprimée')
      fetchLogos()
    }
  }

  function editLogo(logo) {
    setEditingLogo(logo)
    setFormData({
      title: logo.title,
      description: logo.description || '',
      image_url: logo.image_url,
      display_order: logo.display_order
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingLogo(null)
    setFormData({
      title: '',
      description: '',
      image_url: '',
      display_order: logos.length + 1
    })
    setUploadFile(null)
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
    <div style={{ marginTop: '120px', padding: '2rem', maxWidth: '1400px', margin: '120px auto 0' }}>
      <h1 className="dress-title" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        Gestion des Logos de l'Atelier
      </h1>

      {/* Formulaire d'ajout/modification */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: '3rem',
        border: '2px solid var(--secondary)'
      }}>
        <h2 className="dress-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          {editingLogo ? 'Modifier la logo' : 'Ajouter une logo'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Upload image */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid var(--secondary)',
                  borderRadius: '8px'
                }}
              />
              {uploading && <p style={{ marginTop: '0.5rem', color: 'var(--accent)' }}>Upload en cours...</p>}
              {formData.image_url && (
                <div style={{ marginTop: '1rem' }}>
                  <img
                    src={formData.image_url}
                    alt="Aperçu"
                    style={{
                      width: '200px',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid var(--secondary)'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Titre */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Titre *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid var(--secondary)',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid var(--secondary)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Ordre d'affichage */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Ordre d'affichage
              </label>
              <input
                type="number"
                min="1"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                style={{
                  width: '150px',
                  padding: '0.8rem',
                  border: '2px solid var(--secondary)',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={uploading}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.6 : 1
                }}
              >
                {editingLogo ? 'Modifier' : 'Ajouter'}
              </button>
              {editingLogo && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                  style={{ padding: '1rem 2rem', fontSize: '1rem' }}
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Liste des logos */}
      <h2 className="dress-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
        Logos actuelles ({logos.length})
      </h2>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</p>
      ) : logos.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
          Aucune logo. Ajoutez-en une ci-dessus!
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {logos.map((logo) => (
            <div key={logo.id} style={{
              background: 'white',
              borderRadius: '15px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '2px solid var(--secondary)'
            }}>
              <img
                src={logo.image_url}
                alt={logo.title}
                style={{
                  width: '100%',
                  height: '250px',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x250?text=Image+non+disponible'
                }}
              />
              <div style={{ padding: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '1.3rem',
                    marginBottom: '0.5rem'
                  }}>
                    {logo.title}
                  </h3>
                  <span style={{
                    background: 'var(--gradient-sunset)',
                    color: 'white',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    #{logo.display_order}
                  </span>
                </div>
                {logo.description && (
                  <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1rem' }}>
                    {logo.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => editLogo(logo)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(logo.id)}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      fontSize: '0.85rem',
                      background: 'transparent',
                      border: '2px solid #ef4444',
                      color: '#ef4444',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: '500',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#ef4444'
                      e.target.style.color = 'white'
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'transparent'
                      e.target.style.color = '#ef4444'
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
