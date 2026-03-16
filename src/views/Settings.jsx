import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import NavBar from '../components/layout/NavBar'
import { useAuth } from '../hooks/useAuth'

/**
 * Settings — configuración de cuenta
 * Ruta: /settings
 */
export default function Settings() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [toast, setToast] = useState(null)
  const [activeSection, setActiveSection] = useState('account')

  const [accountForm, setAccountForm] = useState({
    name: currentUser?.name ?? '',
    email: currentUser?.email ?? '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const SECTIONS = [
    { key: 'account',       label: 'Cuenta' },
    { key: 'password',      label: 'Contraseña' },
    { key: 'notifications', label: 'Notificaciones' },
  ]

  const [notifPrefs, setNotifPrefs] = useState({
    newLead:    true,
    newMessage: true,
    marketing:  false,
  })

  async function saveAccount(e) {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    setSaving(false)
    setToast({ message: 'Cambios guardados', type: 'success' })
  }

  function validatePassword() {
    const errs = {}
    if (!passwordForm.current) errs.current = 'Ingresa tu contraseña actual'
    if (!passwordForm.next) errs.next = 'Ingresa la nueva contraseña'
    else if (passwordForm.next.length < 8) errs.next = 'Mínimo 8 caracteres'
    if (passwordForm.next !== passwordForm.confirm) errs.confirm = 'Las contraseñas no coinciden'
    return errs
  }

  async function savePassword(e) {
    e.preventDefault()
    const errs = validatePassword()
    if (Object.keys(errs).length) { setPasswordErrors(errs); return }
    setPasswordErrors({})
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    setSaving(false)
    setPasswordForm({ current: '', next: '', confirm: '' })
    setToast({ message: 'Contraseña actualizada', type: 'success' })
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Header */}
      <header className="px-[var(--space-6)] pt-[var(--space-8)] pb-[var(--space-5)] border-b border-[var(--color-border-light)]">
        <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-5)]">
          <button onClick={() => navigate('/profile')} aria-label="Volver al perfil"
            className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-secondary)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-[var(--text-2xl)] font-black text-[var(--color-text-primary)]">Configuración</h1>
        </div>

        {/* Section tabs */}
        <div className="flex gap-[var(--space-1)]" role="tablist" aria-label="Secciones de configuración">
          {SECTIONS.map(s => (
            <button key={s.key} role="tab"
              aria-selected={activeSection === s.key}
              onClick={() => setActiveSection(s.key)}
              className={[
                'flex-1 py-[var(--space-2)] rounded-[var(--radius-lg)] text-[var(--text-xs)] font-bold transition-colors',
                activeSection === s.key
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)]',
              ].join(' ')}>
              {s.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-[var(--space-6)] py-[var(--space-6)] pb-32">

        {/* Account */}
        {activeSection === 'account' && (
          <form onSubmit={saveAccount} noValidate className="flex flex-col gap-[var(--space-5)] animate-fade-in">
            <Input id="settings-name" label="Nombre completo"
              value={accountForm.name}
              onChange={e => setAccountForm(f => ({ ...f, name: e.target.value }))}
            />
            <Input id="settings-email" label="Email" type="email"
              value={accountForm.email}
              onChange={e => setAccountForm(f => ({ ...f, email: e.target.value }))}
            />

            {/* Danger zone */}
            <div className="mt-[var(--space-4)] pt-[var(--space-6)] border-t border-[var(--color-border-light)]">
              <p className="text-[var(--text-xs)] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-4)]">
                Zona peligrosa
              </p>
              <button type="button"
                className="text-[var(--text-sm)] font-semibold text-[var(--color-error)] underline underline-offset-2">
                Eliminar cuenta
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" disabled={saving} className="w-full mt-[var(--space-2)]">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </form>
        )}

        {/* Password */}
        {activeSection === 'password' && (
          <form onSubmit={savePassword} noValidate className="flex flex-col gap-[var(--space-5)] animate-fade-in">
            <Input id="pass-current" label="Contraseña actual" type="password"
              value={passwordForm.current}
              onChange={e => setPasswordForm(f => ({ ...f, current: e.target.value }))}
              placeholder="••••••••"
              error={passwordErrors.current}
              autoComplete="current-password"
            />
            <Input id="pass-new" label="Nueva contraseña" type="password"
              value={passwordForm.next}
              onChange={e => setPasswordForm(f => ({ ...f, next: e.target.value }))}
              placeholder="Mínimo 8 caracteres"
              error={passwordErrors.next}
              autoComplete="new-password"
            />
            <Input id="pass-confirm" label="Confirmar contraseña" type="password"
              value={passwordForm.confirm}
              onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
              placeholder="Repite la nueva contraseña"
              error={passwordErrors.confirm}
              autoComplete="new-password"
            />
            <Button type="submit" variant="primary" size="lg" disabled={saving} className="w-full mt-[var(--space-2)]">
              {saving ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>
        )}

        {/* Notifications */}
        {activeSection === 'notifications' && (
          <div className="flex flex-col gap-[var(--space-1)] animate-fade-in">
            <p className="text-[var(--text-xs)] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-4)]">
              Preferencias
            </p>
            {[
              { key: 'newLead',    label: 'Nuevo lead',       desc: 'Cuando un comprador te contacta' },
              { key: 'newMessage', label: 'Nuevo mensaje',    desc: 'Mensajes en tus conversaciones' },
              { key: 'marketing',  label: 'Novedades',        desc: 'Tips, actualizaciones y promociones' },
            ].map(({ key, label, desc }) => (
              <div key={key}>
                <button
                  role="switch"
                  aria-checked={notifPrefs[key]}
                  onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                  className="w-full flex items-center justify-between py-[var(--space-5)] text-left"
                >
                  <div>
                    <p className="text-[var(--text-base)] font-medium text-[var(--color-text-primary)]">{label}</p>
                    <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)] mt-[var(--space-1)]">{desc}</p>
                  </div>
                  {/* Toggle */}
                  <div className={[
                    'w-12 h-7 rounded-full transition-colors flex-shrink-0 flex items-center px-1',
                    notifPrefs[key] ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border-medium)]',
                  ].join(' ')}>
                    <div className={[
                      'w-5 h-5 rounded-full bg-white shadow transition-transform',
                      notifPrefs[key] ? 'translate-x-5' : 'translate-x-0',
                    ].join(' ')} />
                  </div>
                </button>
                <div className="h-px bg-[var(--color-border-light)]" aria-hidden="true" />
              </div>
            ))}
          </div>
        )}
      </main>

      <NavBar />
    </div>
  )
}
