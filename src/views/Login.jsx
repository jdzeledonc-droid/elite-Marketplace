import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import { useAuth } from '../hooks/useAuth'
import { isMockMode, sendPasswordResetEmail } from '../lib/supabase'
import { MOCK_USER } from '../lib/mockData'

/**
 * Login — pantalla de inicio de sesión
 * Ruta: /login
 */
export default function Login() {
  const navigate = useNavigate()
  const { login, signIn } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)

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
    try {
      if (isMockMode) {
        await new Promise(r => setTimeout(r, 800))
        login(MOCK_USER)
      } else {
        await signIn({ email: form.email, password: form.password })
      }
      navigate('/')
    } catch (err) {
      setToast({ message: err.message ?? 'Error al ingresar', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(evt) {
    evt.preventDefault()
    if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
      setToast({ message: 'Ingresa un email válido', type: 'error' })
      return
    }
    setLoading(true)
    try {
      if (!isMockMode) {
        await sendPasswordResetEmail(resetEmail)
      } else {
        await new Promise(r => setTimeout(r, 800))
      }
      setResetSent(true)
    } catch (err) {
      setToast({ message: err.message ?? 'Error al enviar el correo', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)] px-[var(--space-6)]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div className="pt-[var(--space-8)] pb-[var(--space-6)]">
        <button
          onClick={() => forgotMode ? (setForgotMode(false), setResetSent(false)) : navigate(-1)}
          aria-label="Volver"
          className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] border border-[var(--color-stroke)] flex items-center justify-center text-[var(--color-text-secondary)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {!forgotMode ? (
        <>
          <div className="mb-[var(--space-10)]">
            <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-2)]">
              Bienvenido
            </p>
            <h1 className="text-md font-black text-[var(--color-text-primary)] leading-tight">
              Inicia sesión
            </h1>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[var(--space-5)]">
            <Input
              id="email" label="Email" type="email"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="tu@email.com" error={errors.email} autoComplete="email"
            />
            <div className="flex flex-col gap-[var(--space-2)]">
              <Input
                id="password" label="Contraseña" type="password"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••" error={errors.password} autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="self-end text-xs font-semibold text-[var(--color-text-tertiary)] underline underline-offset-2 hover:text-[var(--color-text-primary)] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full mt-[var(--space-2)]">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </>
      ) : (
        <>
          <div className="mb-[var(--space-10)]">
            <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-2)]">
              Recuperar acceso
            </p>
            <h1 className="text-md font-black text-[var(--color-text-primary)] leading-tight">
              {resetSent ? '¡Correo enviado!' : '¿Olvidaste tu contraseña?'}
            </h1>
          </div>

          {resetSent ? (
            <div className="flex flex-col gap-[var(--space-5)]">
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Revisa tu correo <span className="font-bold text-[var(--color-text-primary)]">{resetEmail}</span> y sigue el link para crear una nueva contraseña.
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Revisa también la carpeta de spam si no lo ves.
              </p>
              <Button variant="secondary" size="lg" className="w-full mt-[var(--space-4)]"
                onClick={() => { setForgotMode(false); setResetSent(false) }}>
                Volver al login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} noValidate className="flex flex-col gap-[var(--space-5)]">
              <p className="text-sm text-[var(--color-text-tertiary)]">
                Ingresa tu email y te enviaremos instrucciones para recuperar tu contraseña.
              </p>
              <Input
                id="reset-email" label="Email" type="email"
                value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                placeholder="tu@email.com" autoComplete="email"
              />
              <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full mt-[var(--space-2)]">
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </Button>
            </form>
          )}
        </>
      )}

      <div className="mt-auto pb-[var(--space-10)] pt-[var(--space-8)] text-center">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-bold text-[var(--color-text-primary)] underline underline-offset-2">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
