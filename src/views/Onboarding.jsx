import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { CATEGORY_GROUPS } from '../lib/mockData'
import { supabase, isMockMode } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const ACCENT_OPTIONS = [
  { key: 'black',  color: '#000000' },
  { key: 'blue',   color: '#3b82f6' },
  { key: 'green',  color: '#10b981' },
  { key: 'red',    color: '#ef4444' },
  { key: 'yellow', color: '#f59e0b' },
  { key: 'purple', color: '#8b5cf6' },
  { key: 'orange', color: '#f97316' },
  { key: 'teal',   color: '#14b8a6' },
  { key: 'pink',   color: '#ec4899' },
]
const TOTAL_STEPS = 4

const BOOTH_TYPE_BY_GROUP = {
  educacion: 'courses',
  moda: 'catalog',
  'productos-cr': 'catalog',
  local: 'hybrid',
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    group: '',
    category: '',
    tagline: '',
    accent: 'black',
    services: [{ title: '', price: '' }],
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const activeGroup = CATEGORY_GROUPS.find(g => g.id === data.group)

  function validate() {
    const e = {}
    if (step === 0) {
      if (!data.group) e.group = 'Elige una categoría'
      else if (!data.category) e.category = 'Elige una especialidad'
    }
    if (step === 1 && !data.tagline.trim()) e.tagline = 'Escribe tu tagline'
    return e
  }

  function next() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep(s => s + 1)
  }

  async function handleFinish() {
    if (isMockMode || !currentUser) { navigate('/sell'); return }
    setSaving(true)
    setSaveError(null)
    try {
      const base = (currentUser.name || currentUser.email.split('@')[0])
        .toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)
      const username = `${base}${Date.now().toString(36)}`
      const boothType = BOOTH_TYPE_BY_GROUP[data.group] ?? 'services'
      const items = data.services
        .filter(s => s.title.trim())
        .map((s, i) => ({ id: `s${i + 1}`, title: s.title, price: s.price, delivery: '7 días' }))
      const { error } = await supabase.from('sellers').insert({
        profile_id:    currentUser.id,
        username,
        name:          currentUser.name || username,
        title:         data.category,
        tagline:       data.tagline,
        group_id:      data.group,
        category:      data.category,
        booth_type:    boothType,
        accent:        data.accent,
        items,
        is_active:     true,
      })
      if (error) throw error
      navigate('/sell')
    } catch (err) {
      setSaveError('No se pudo guardar tu booth. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  function addService() {
    setData(d => ({ ...d, services: [...d.services, { title: '', price: '' }] }))
  }

  function updateService(i, field, value) {
    setData(d => {
      const services = [...d.services]
      services[i] = { ...services[i], [field]: value }
      return { ...d, services }
    })
  }

  const progress = (step / (TOTAL_STEPS - 1)) * 100

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)] px-[var(--space-6)]">

      {/* Progress bar */}
      <div className="pt-[var(--space-8)] pb-[var(--space-6)]">
        <div className="flex items-center justify-between mb-[var(--space-3)]">
          <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
            Paso {step + 1} de {TOTAL_STEPS}
          </p>
          {step < TOTAL_STEPS - 1 && (
            <button onClick={() => navigate('/')}
              className="text-xs text-[var(--color-text-tertiary)] underline underline-offset-2">
              Omitir
            </button>
          )}
        </div>
        <div className="h-1 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden"
          role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label="Progreso del onboarding">
          <div className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Step 0 — Especialidad */}
      {step === 0 && (
        <div className="flex-1 flex flex-col animate-fade-in overflow-y-auto">
          <h1 className="text-4xl font-black text-[var(--color-text-primary)] leading-tight mb-[var(--space-2)]">
            Tu especialidad
          </h1>
          <p className="text-base text-[var(--color-text-tertiary)] mb-[var(--space-5)]">
            Ayuda a los compradores a encontrarte
          </p>

          {/* Level 1 — Groups */}
          <div className="flex gap-[var(--space-2)] flex-wrap mb-[var(--space-2)]"
            role="group" aria-label="Categoría principal">
            {CATEGORY_GROUPS.map(group => (
              <button key={group.id} type="button"
                onClick={() => setData(d => ({ ...d, group: group.id, category: '' }))}
                aria-pressed={data.group === group.id}
                className={[
                  'px-[var(--space-4)] py-[var(--space-2)] rounded-full text-xs font-bold border-2 transition-all',
                  data.group === group.id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                    : 'border-[var(--color-border-medium)] text-[var(--color-text-secondary)]',
                ].join(' ')}>
                {group.label}
              </button>
            ))}
          </div>
          {errors.group && (
            <p role="alert" className="text-xs text-[var(--color-error)] mb-[var(--space-3)]">
              {errors.group}
            </p>
          )}

          {/* Level 2 — Subcategories */}
          {activeGroup && (
            <div className="flex flex-col gap-[var(--space-3)] mt-[var(--space-4)]"
              role="group" aria-label="Especialidad">
              {activeGroup.subcategories.map(sub => (
                <button key={sub} type="button"
                  onClick={() => { setData(d => ({ ...d, category: sub })); setErrors({}) }}
                  aria-pressed={data.category === sub}
                  className={[
                    'p-[var(--space-5)] rounded-[var(--radius-2xl)] border-2 text-left transition-all active:scale-[0.98]',
                    data.category === sub
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-[var(--color-border-light)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]',
                  ].join(' ')}>
                  <span className="text-lg font-bold block">{sub}</span>
                </button>
              ))}
            </div>
          )}
          {errors.category && (
            <p role="alert" className="text-xs text-[var(--color-error)] mt-[var(--space-3)]">
              {errors.category}
            </p>
          )}
        </div>
      )}

      {/* Step 1 — Tu booth */}
      {step === 1 && (
        <div className="flex-1 flex flex-col animate-fade-in">
          <h1 className="text-4xl font-black text-[var(--color-text-primary)] leading-tight mb-[var(--space-2)]">
            Tu booth
          </h1>
          <p className="text-base text-[var(--color-text-tertiary)] mb-[var(--space-8)]">
            Tu espacio personal en EliteMarket
          </p>
          <div className="flex flex-col gap-[var(--space-6)]">
            <Input id="tagline" label="Tagline"
              value={data.tagline}
              onChange={e => setData(d => ({ ...d, tagline: e.target.value }))}
              placeholder="Diseño que convierte visitantes en clientes"
              error={errors.tagline} />

            <div>
              <p className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-[0.2em] mb-[var(--space-3)] ml-[var(--space-1)]">
                Color de acento
              </p>
              <div className="flex gap-[var(--space-3)]" role="group" aria-label="Color de acento">
                {ACCENT_OPTIONS.map(({ key, color }) => (
                  <button key={key} type="button"
                    onClick={() => setData(d => ({ ...d, accent: key }))}
                    aria-label={`Color ${key}`} aria-pressed={data.accent === key}
                    className={[
                      'w-10 h-10 rounded-full transition-transform',
                      data.accent === key ? 'scale-125 ring-2 ring-offset-2 ring-[var(--color-text-primary)]' : '',
                    ].join(' ')}
                    style={{ background: color }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Servicios */}
      {step === 2 && (
        <div className="flex-1 flex flex-col animate-fade-in overflow-y-auto">
          <h1 className="text-4xl font-black text-[var(--color-text-primary)] leading-tight mb-[var(--space-2)]">
            Tus servicios
          </h1>
          <p className="text-base text-[var(--color-text-tertiary)] mb-[var(--space-8)]">
            Agrega al menos uno
          </p>
          <div className="flex flex-col gap-[var(--space-4)]">
            {data.services.map((svc, i) => (
              <div key={i} className="bg-[var(--color-bg-secondary)] rounded-[var(--radius-2xl)] p-[var(--space-5)] flex flex-col gap-[var(--space-4)]">
                <Input id={`svc-title-${i}`} label={`Servicio ${i + 1}`}
                  value={svc.title}
                  onChange={e => updateService(i, 'title', e.target.value)}
                  placeholder="Diseño de App Móvil" />
                <Input id={`svc-price-${i}`} label="Precio"
                  value={svc.price}
                  onChange={e => updateService(i, 'price', e.target.value)}
                  placeholder="Desde $500 USD" />
              </div>
            ))}
            {data.services.length < 5 && (
              <button type="button" onClick={addService}
                className="flex items-center gap-[var(--space-3)] text-sm font-semibold text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors py-[var(--space-2)]">
                <span className="w-7 h-7 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-base leading-none">+</span>
                Agregar servicio
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3 — Listo */}
      {step === 3 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="w-24 h-24 rounded-[var(--radius-3xl)] bg-[var(--color-primary)] flex items-center justify-center mb-[var(--space-8)] shadow-[var(--shadow-xl)]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-4xl font-black text-[var(--color-text-primary)] mb-[var(--space-3)]">
            Todo listo
          </h1>
          <p className="text-base text-[var(--color-text-tertiary)] max-w-[280px] leading-relaxed">
            Tu booth está configurado. Puedes añadir más detalles desde tu panel.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="pb-[var(--space-10)] pt-[var(--space-6)] flex flex-col gap-[var(--space-3)]">
        {saveError && (
          <p role="alert" className="text-xs text-[var(--color-error)] text-center">
            {saveError}
          </p>
        )}
        <div className="flex gap-[var(--space-3)]">
        {step > 0 && step < TOTAL_STEPS - 1 && (
          <Button variant="secondary" size="lg" onClick={() => setStep(s => s - 1)} className="flex-1">
            Atrás
          </Button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <Button variant="primary" size="lg" onClick={next} className="flex-1">
            Continuar
          </Button>
        ) : (
          <Button variant="primary" size="lg" onClick={handleFinish} disabled={saving} className="flex-1">
            {saving ? 'Guardando…' : 'Ir a mi panel'}
          </Button>
        )}
        </div>
      </div>
    </div>
  )
}
