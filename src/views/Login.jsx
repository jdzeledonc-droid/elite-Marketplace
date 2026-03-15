import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'

/**
 * Login — pantalla de inicio de sesión
 * Ruta: /login
 */
export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)

  function validate() {
    const e = {}
    if (!form.email) e.email = 'El email es requerido'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    if (!form.password) e.password = 'La contraseña es requerida'
    return e
  }

  async function handleSubmit(evt) {
    evt.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setErrors({})
    // Mock — replace with supabase.auth.signInWithPassword()
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    navigate('/')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)] px-[var(--space-6)]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div className="pt-[var(--space-8)] pb-[var(--space-6)]">
        <button
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-secondary)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="mb-[var(--space-10)]">
        <p className="text-[var(--text-xs)] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-2)]">
          Bienvenido
        </p>
        <h1 className="text-[var(--text-4xl)] font-black text-[var(--color-text-primary)] leading-tight">
          Inicia sesión
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[var(--space-5)]">
        <Input
          id="email" label="Email" type="email"
          value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="tu@email.com" error={errors.email} autoComplete="email"
        />
        <Input
          id="password" label="Contraseña" type="password"
          value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          placeholder="••••••••" error={errors.password} autoComplete="current-password"
        />
        <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full mt-[var(--space-2)]">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>

      <div className="mt-auto pb-[var(--space-10)] pt-[var(--space-8)] text-center">
        <p className="text-[var(--text-sm)] text-[var(--color-text-tertiary)]">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-bold text-[var(--color-text-primary)] underline underline-offset-2">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
