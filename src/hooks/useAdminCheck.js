import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'

export function useAdminCheck() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/')
      setLoading(false)
      return
    }

    // Vérifier si l'utilisateur a le rôle admin
    const userRole = user.user_metadata?.role

    if (userRole === 'admin') {
      setIsAdmin(true)
    } else {
      // Rediriger vers la page d'accueil si pas admin
      navigate('/')
    }

    setLoading(false)
  }, [user, navigate])

  return { isAdmin, loading }
}
