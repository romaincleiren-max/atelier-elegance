import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mode démo sans Supabase
    if (!supabase) {
      setLoading(false)
      return
    }

    // Vérifier la session active
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    signUp: (email, password) => supabase ? supabase.auth.signUp({ email, password }) : Promise.reject(new Error('Supabase non configuré')),
    signIn: (email, password) => supabase ? supabase.auth.signInWithPassword({ email, password }) : Promise.reject(new Error('Supabase non configuré')),
    signOut: () => supabase ? supabase.auth.signOut() : Promise.resolve(),
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
