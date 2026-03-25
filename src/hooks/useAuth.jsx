import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isMockMode } from '../lib/supabase'
import { MOCK_USER } from '../lib/mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(!isMockMode)

  useEffect(() => {
    if (isMockMode) return

    // Safety net: if Supabase never responds, unblock the app after 6s
    const timeout = setTimeout(() => setLoading(false), 6000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout)
      if (session?.user) loadProfile(session.user)
      else setLoading(false)
    }).catch(() => { clearTimeout(timeout); setLoading(false) })

    let subscription = null
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) loadProfile(session.user)
        else { setCurrentUser(null); setLoading(false) }
      })
      subscription = data.subscription
    } catch (_) {
      setLoading(false)
    }

    return () => { clearTimeout(timeout); subscription?.unsubscribe() }
  }, [])

  async function loadProfile(authUser) {
    try {
      let { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, user_role, is_verified')
        .eq('id', authUser.id)
        .single()

      // Si no existe el perfil (usuario registrado antes de las migraciones), crearlo
      if (!profile) {
        const name = authUser.user_metadata?.full_name ?? authUser.email
        const role = authUser.user_metadata?.user_role ?? 'buyer'
        await supabase.from('profiles').upsert({ id: authUser.id, full_name: name, user_role: role })
        profile = { full_name: name, avatar_url: null, user_role: role, is_verified: false }
      }

      setCurrentUser({
        id:          authUser.id,
        email:       authUser.email,
        name:        profile.full_name  ?? authUser.email,
        avatar:      profile.avatar_url ?? null,
        user_role:   profile.user_role  ?? 'buyer',
        is_verified: profile.is_verified ?? false,
      })
    } catch (_) {
      setCurrentUser({ id: authUser.id, email: authUser.email, name: authUser.email, avatar: null, user_role: 'buyer', is_verified: false })
    } finally {
      setLoading(false)
    }
  }

  // ── Mock helpers (VITE_MOCK_MODE=true) ──────────────────────
  function login(user) { setCurrentUser(user) }
  function logout() {
    if (!isMockMode) supabase.auth.signOut()
    setCurrentUser(null)
  }

  function updateCurrentUser(updates) {
    setCurrentUser(prev => prev ? { ...prev, ...updates } : prev)
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
    <AuthContext.Provider value={{ currentUser, loading, login, logout, signIn, signUp, updateCurrentUser }}>
      {loading ? null : children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
