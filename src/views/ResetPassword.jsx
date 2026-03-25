import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import { supabase } from '../lib/supabase'

/**
 * ResetPassword — landing page del link de recuperación de contraseña
 * Ruta: /reset-password (pública — Supabase redirige aquí con token en URL)
 */
export default function ResetPassword() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)

  // Supabase procesa el token del URL hash automáticamente.
  // Esperamos el evento PASSWORD_RECOVERY para confirmar que la sesión es válida.
  useEffect(() => {
    if (!supabase) { navigate('/login', { replace: true }); return }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })

    // Si la sesión ya fue procesada (llegó por hash en la URL), también funciona
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  function validate() {
    const e = {}
    if (!form.next) e.next = 'Ingresa la nueva contraseña'
    else if (form.next.length < 8) e.next = 'Mínimo 8 caracteres'
    if (form.next !== form.confirm) e.confirm = 'Las contraseñas no coinciden'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: form.next })
      if (error) throw error
      setDone(true)
    } catch (err) {
      setToast({ message: err.message ?? 'Error al actualizar contraseña', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)] px-[var(--space-6)]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div className="pt-[var(--space-8)] pb-[var(--space-6)]">
        <button
          onClick={() => navigate('/login')}
          aria-label="Ir al login"
          className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] border border-[var(--color-stroke)] flex items-center justify-center text-[var(--color-text-secondary)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="mb-[var(--space-10)]">
        <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-2)]">
          Recuperar acceso
        </p>
        <h1 className="text-md font-black text-[var(--color-text-primary)] leading-tight">
          {done ? '¡Contraseña actualizada!' : 'Nueva contraseña'}
        </h1>
      </div>

      {done ? (
        <div className="flex flex-col gap-[var(--space-5)]">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión.
          </p>
          <Button variant="primary" size="lg" className="w-full mt-[var(--space-4)]"
            onClick={() => navigate('/login', { replace: true })}>
            Ir al login
          </Button>
        </div>
      ) : !ready ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[var(--space-5)]">
          <Input
            id="new-password" label="Nueva contraseña" type="password"
            value={form.next} onChange={e => setForm(f => ({ ...f, next: e.target.value }))}
            placeholder="Mínimo 8 caracteres"
            error={errors.next} autoComplete="new-password"
          />
          <Input
            id="confirm-password" label="Confirmar contraseña" type="password"
            value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
            placeholder="Repite la nueva contraseña"
            error={errors.confirm} autoComplete="new-password"
          />
          <Button type="submit" variant="primary" size="lg" disabled={saving} className="w-full mt-[var(--space-2)]">
            {saving ? 'Guardando...' : 'Guardar contraseña'}
          </Button>
        </form>
      )}
    </div>
  )
}
