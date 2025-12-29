import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'

/**
 * Hook pour vérifier si l'utilisateur est admin sans redirection
 * Utilisé pour l'affichage conditionnel dans le Header
 */
export function useAdminStatus() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    // Vérifier si l'utilisateur a le rôle admin
    const userRole = user.user_metadata?.role
    setIsAdmin(userRole === 'admin')
    setLoading(false)
  }, [user])

  return { isAdmin, loading }
}
