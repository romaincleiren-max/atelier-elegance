import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { useAdminCheck } from '../hooks/useAdminCheck'

export default function AdminCollections() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useAdminCheck()
  const [dresses, setDresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingDress, setEditingDress] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    style: '',
    price: '',
    image_url: '',
    description: '',
    available: true
  })

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    fetchDresses()
  }, [user, navigate])

  async function fetchDresses() {
    if (!supabase) return

    setLoading(true)
    const { data, error } = await supabase
      .from('dresses')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setDresses(data)
    }
    setLoading(false)
  }

  async function saveDress() {
    if (!supabase) return

    if (!formData.name || !formData.style || !formData.price || !formData.image_url) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    const dressData = {
      name: formData.name,
      style: formData.style,
      price: parseFloat(formData.price),
      image_url: formData.image_url,
      description: formData.description || null,
      available: formData.available
    }

    let error

    if (editingDress) {
      // Mise à jour
      const result = await supabase
        .from('dresses')
        .update(dressData)
        .eq('id', editingDress.id)
      error = result.error
    } else {
      // Création
      const result = await supabase
        .from('dresses')
        .insert(dressData)
      error = result.error
    }

    if (!error) {
      alert(editingDress ? 'Robe modifiée !' : 'Robe ajoutée !')
      resetForm()
      fetchDresses()
    } else {
      alert('Erreur: ' + error.message)
    }
  }

  async function deleteDress(dressId) {
    if (!supabase) return
    if (!confirm('Voulez-vous vraiment supprimer cette robe ?\n\nAttention: les rendez-vous liés à cette robe ne seront pas supprimés.')) return

    const { error } = await supabase
      .from('dresses')
      .delete()
      .eq('id', dressId)

    if (!error) {
      alert('Robe supprimée')
      fetchDresses()
    } else {
      alert('Erreur: ' + error.message)
    }
  }

  function startEdit(dress) {
    setEditingDress(dress)
    setFormData({
      name: dress.name,
      style: dress.style,
      price: dress.price.toString(),
      image_url: dress.image_url,
      description: dress.description || '',
      available: dress.available
    })
    setIsCreating(true)
  }

  function resetForm() {
    setEditingDress(null)
    setIsCreating(false)
    setFormData({
      name: '',
      style: '',
      price: '',
      image_url: '',
      description: '',
      available: true
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
        Gestion des Collections
      </h1>

      {/* Bouton créer */}
      {!isCreating && (
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <button
            onClick={() => setIsCreating(true)}
            style={{
              padding: '1rem 2rem',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ➕ Ajouter une nouvelle robe
          </button>
        </div>
      )}

      {/* Formulaire création/édition */}
      {isCreating && (
        <div style={{
          background: 'white',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '3px solid var(--accent)'
        }}>
          <h2 style={{ marginBottom: '1.5rem', fontFamily: 'Cormorant Garamond, serif' }}>
            {editingDress ? 'Modifier la robe' : 'Nouvelle robe'}
          </h2>

          <div className="form-row" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label>Nom de la robe *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Robe Aurore"
              />
            </div>
            <div className="form-group">
              <label>Style *</label>
              <input
                type="text"
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                placeholder="Ex: Bohème, Classique, Moderne..."
              />
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label>Prix (€) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Ex: 1200"
                min="0"
                step="10"
              />
            </div>
            <div className="form-group">
              <label>URL de l'image *</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description détaillée de la robe..."
              rows="4"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              />
              <span>Robe disponible (visible sur le site)</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={saveDress}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {editingDress ? 'Enregistrer les modifications' : 'Créer la robe'}
            </button>
            <button
              onClick={resetForm}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des robes */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '3rem' }}>Chargement...</p>
      ) : dresses.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
          Aucune robe dans la collection. Ajoutez-en une !
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {dresses.map((dress) => (
            <div key={dress.id} style={{
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: dress.available ? '2px solid #10b981' : '2px solid #ef4444'
            }}>
              <img
                src={dress.image_url}
                alt={dress.name}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                      {dress.name}
                    </h3>
                    <p style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>
                      {dress.style}
                    </p>
                  </div>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    background: dress.available ? '#d1fae5' : '#fee2e2',
                    color: dress.available ? '#10b981' : '#ef4444'
                  }}>
                    {dress.available ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>

                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '1rem' }}>
                  {dress.price}€
                </p>

                {dress.description && (
                  <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1rem', lineHeight: '1.4' }}>
                    {dress.description.length > 100 ? dress.description.substring(0, 100) + '...' : dress.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => startEdit(dress)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => deleteDress(dress.id)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    🗑️ Supprimer
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
