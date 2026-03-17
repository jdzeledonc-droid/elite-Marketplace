import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import { useAuth } from '../hooks/useAuth'
import { isMockMode } from '../lib/supabase'

const ROLES = [
  { value: 'buyer',  label: 'Comprador', desc: 'Busco servicios digitales' },
  { value: 'seller', label: 'Vendedor',  desc: 'Ofrezco mis servicios' },
]

/**
 * Register — pantalla de registro (buyer onboarding incluido en paso 1)
 * Ruta: /register
 */
export default function Register() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' })
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'El nombre es requerido'
    if (!form.email) e.email = 'El email es requerido'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    if (!form.password) e.password = 'La contraseña es requerida'
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres'
    return e
  }

  async function handleSubmit(evt) {
    evt.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setErrors({})
    try {
      if (isMockMode) {
        await new Promise(r => setTimeout(r, 900))
      } else {
        await signUp({ email: form.email, password: form.password, name: form.name, role: form.role })
      }
      navigate(form.role === 'seller' ? '/onboarding' : '/')
    } catch (err) {
      setToast({ message: err.message ?? 'Error al registrarse', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)] px-[var(--space-6)]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div className="pt-[var(--space-8)] pb-[var(--space-6)]">
        <button
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] border border-[var(--color-stroke)] flex items-center justify-center text-[var(--color-text-secondary)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="mb-[var(--space-8)]">
        <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-2)]">
          Nuevo en EliteMarket
        </p>
        <h1 className="text-base font-black text-[var(--color-text-primary)] leading-tight">
          Crea tu cuenta
        </h1>
      </div>

      {/* Role selector — buyer onboarding */}
      <div className="mb-[var(--space-6)]">
        <p className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-[0.2em] mb-[var(--space-3)]">
          Soy...
        </p>
        <div className="flex gap-[var(--space-3)]" role="group" aria-label="Tipo de cuenta">
          {ROLES.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm(f => ({ ...f, role: value }))}
              aria-pressed={form.role === value}
              className={[
                'flex-1 flex flex-col items-start p-[var(--space-5)] rounded-[var(--radius-2xl)] border-2 transition-colors text-left',
                form.role === value
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                  : 'border-[var(--color-stroke)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]',
              ].join(' ')}
            >
              <span className="font-bold text-md mb-[var(--space-1)]">{label}</span>
              <span className={`text-md ${form.role === value ? 'text-white/70' : 'text-[var(--color-text-tertiary)]'}`}>
                {desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[var(--space-5)]">
        <Input
          id="name" label="Nombre completo"
          value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Tu nombre" error={errors.name} autoComplete="name"
        />
        <Input
          id="email" label="Email" type="email"
          value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="tu@email.com" error={errors.email} autoComplete="email"
        />
        <Input
          id="password" label="Contraseña" type="password"
          value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          placeholder="Mínimo 8 caracteres" error={errors.password} autoComplete="new-password"
        />
        <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full mt-[var(--space-2)]">
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>

      <div className="mt-auto pb-[var(--space-10)] pt-[var(--space-8)] text-center">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-bold text-[var(--color-text-primary)] underline underline-offset-2">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
