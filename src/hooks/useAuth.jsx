import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isMockMode } from '../lib/supabase'
import { MOCK_USER } from '../lib/mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(!isMockMode)

  useEffect(() => {
    if (isMockMode) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfile(session.user)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadProfile(session.user)
      else { setCurrentUser(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(authUser) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, user_role, is_verified')
      .eq('id', authUser.id)
      .single()

    setCurrentUser({
      id:          authUser.id,
      email:       authUser.email,
      name:        profile?.full_name  ?? authUser.email,
      avatar:      profile?.avatar_url ?? null,
      user_role:   profile?.user_role  ?? 'buyer',
      is_verified: profile?.is_verified ?? false,
    })
    setLoading(false)
  }

  // ── Mock helpers (VITE_MOCK_MODE=true) ──────────────────────
  function login(user) { setCurrentUser(user) }
  function logout() {
    if (!isMockMode) supabase.auth.signOut()
    setCurrentUser(null)
  }

  // ── Real auth ────────────────────────────────────────────────
  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signUp({ email, password, name, role }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, user_role: role } },
    })
    if (error) throw error
    return data
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, signIn, signUp }}>
      {loading ? null : children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
