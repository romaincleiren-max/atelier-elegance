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
  const [editingLogo, setEditingLogo] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    placement: 'footer',
    display_order: 1,
    active: true,
    width: null,
    height: null,
    link_url: ''
  })

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


  async function handleSubmit(e) {
    e.preventDefault()
    if (!supabase) return

    if (!formData.name || !formData.image_url) {
      alert('Le nom et l\'URL de l\'image sont obligatoires')
      return
    }

    // Validation de sécurité des URLs
    if (formData.image_url && !isValidImageUrl(formData.image_url)) {
      alert("URL d'image invalide. Utilisez uniquement des URLs https:// d'images valides")
      return
    }

    try {
      const logoData = {
        name: formData.name,
        description: formData.description,
        image_url: formData.image_url,
        placement: formData.placement,
        display_order: formData.display_order,
        active: formData.active,
        width: formData.width || null,
        height: formData.height || null,
        link_url: formData.link_url || null
      }

      if (editingLogo) {
        const { error } = await supabase
          .from('logos')
          .update(logoData)
          .eq('id', editingLogo.id)

        if (error) throw error
        alert('Logo modifié avec succès!')
      } else {
        const { error } = await supabase
          .from('logos')
          .insert([logoData])

        if (error) throw error
        alert('Logo ajouté avec succès!')
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
      name: logo.name,
      description: logo.description || '',
      image_url: logo.image_url,
      placement: logo.placement,
      display_order: logo.display_order,
      active: logo.active,
      width: logo.width || null,
      height: logo.height || null,
      link_url: logo.link_url || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingLogo(null)
    setFormData({
      name: '',
      description: '',
      image_url: '',
      placement: 'footer',
      display_order: logos.length + 1,
      active: true,
      width: null,
      height: null,
      link_url: ''
    })
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
          {editingLogo ? 'Modifier le logo' : 'Ajouter un logo'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Nom */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Nom *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Logo Instagram"
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

            {/* URL de l'image */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                URL de l'image *
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://exemple.com/logo.png"
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid var(--secondary)',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              {formData.image_url && (
                <div style={{ marginTop: '1rem' }}>
                  <img
                    src={formData.image_url}
                    alt="Aperçu"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '150px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '2px solid var(--secondary)'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Placement */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Emplacement *
              </label>
              <select
                value={formData.placement}
                onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid var(--secondary)',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="header">En-tête</option>
                <option value="footer">Pied de page</option>
                <option value="hero">Section Hero</option>
                <option value="sponsors">Sponsors</option>
                <option value="partenaires">Partenaires</option>
                <option value="sidebar">Barre latérale</option>
              </select>
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
                placeholder="Description optionnelle"
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

            {/* Lien URL (optionnel) */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Lien URL (optionnel)
              </label>
              <input
                type="url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="https://exemple.com"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid var(--secondary)',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Dimensions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Largeur (px)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.width || ''}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Auto"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '2px solid var(--secondary)',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Hauteur (px)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.height || ''}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Auto"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '2px solid var(--secondary)',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Ordre
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '2px solid var(--secondary)',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            {/* Actif */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                Logo actif (visible sur le site)
              </label>
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem'
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
        Logos actuels ({logos.length})
      </h2>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</p>
      ) : logos.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
          Aucun logo. Ajoutez-en un ci-dessus!
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {logos.map((logo) => (
            <div key={logo.id} style={{
              background: logo.active ? 'white' : '#f3f4f6',
              borderRadius: '15px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: logo.active ? '2px solid var(--secondary)' : '2px solid #d1d5db',
              opacity: logo.active ? 1 : 0.7
            }}>
              <div style={{
                width: '100%',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8f9fa',
                padding: '1rem'
              }}>
                <img
                  src={logo.image_url}
                  alt={logo.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible'
                  }}
                />
              </div>
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
                    {logo.name}
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
                <p style={{ fontSize: '0.85rem', color: 'var(--accent)', marginBottom: '0.5rem', fontWeight: '600' }}>
                  📍 {logo.placement === 'header' ? 'En-tête' :
                     logo.placement === 'footer' ? 'Pied de page' :
                     logo.placement === 'hero' ? 'Section Hero' :
                     logo.placement === 'sponsors' ? 'Sponsors' :
                     logo.placement === 'partenaires' ? 'Partenaires' : 'Barre latérale'}
                </p>
                {logo.description && (
                  <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1rem' }}>
                    {logo.description}
                  </p>
                )}
                {(logo.width || logo.height) && (
                  <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '0.5rem' }}>
                    Taille: {logo.width || 'auto'} × {logo.height || 'auto'} px
                  </p>
                )}
                {logo.link_url && (
                  <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1rem' }}>
                    🔗 <a href={logo.link_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                      Lien actif
                    </a>
                  </p>
                )}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  padding: '0.5rem',
                  background: logo.active ? '#d1fae5' : '#fee2e2',
                  borderRadius: '8px'
                }}>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: logo.active ? '#10b981' : '#ef4444'
                  }}>
                    {logo.active ? '✓ Actif' : '✗ Inactif'}
                  </span>
                </div>
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
