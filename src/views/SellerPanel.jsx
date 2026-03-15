import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import NavBar from '../components/layout/NavBar'
import { MOCK_USER, MOCK_SELLERS } from '../lib/mockData'

export default function SellerPanel() {
  const navigate = useNavigate()
  const seller = MOCK_SELLERS[0]
  const [activeTab, setActiveTab] = useState('services')

  const TABS = [
    { key: 'services', label: 'Servicios' },
    { key: 'leads',    label: 'Leads' },
    { key: 'stats',    label: 'Stats' },
  ]

  const MOCK_LEADS = [
    { id: 'l1', buyer: 'María G.', service: 'Diseño de App Móvil', status: 'pending',   time: 'Hace 2h' },
    { id: 'l2', buyer: 'Pedro R.', service: 'Auditoría UX',        status: 'contacted', time: 'Hace 1d' },
    { id: 'l3', buyer: 'Laura M.', service: 'Sistema de Diseño',   status: 'closed',    time: 'Hace 3d' },
  ]

  const STATUS_LABELS = { pending: 'Pendiente', contacted: 'Contactado', closed: 'Cerrado' }
  const STATUS_VARIANTS = { pending: 'warning', contacted: 'success', closed: 'role' }

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)]">

      {/* Header */}
      <header className="px-[var(--space-6)] pt-[var(--space-8)] pb-[var(--space-5)] border-b border-[var(--color-border-light)]">
        <div className="flex items-center gap-[var(--space-4)] mb-[var(--space-5)]">
          <Avatar src={MOCK_USER.avatar} alt={MOCK_USER.name} size="md" />
          <div className="flex-1">
            <p className="text-[var(--text-xs)] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Mi panel</p>
            <h1 className="text-[var(--text-xl)] font-black text-[var(--color-text-primary)]">{MOCK_USER.name}</h1>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/seller/1')}
            aria-label="Ver mi booth público">
            Ver booth
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-[var(--space-1)]" role="tablist" aria-label="Panel de vendedor">
          {TABS.map(tab => (
            <button key={tab.key} role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`tabpanel-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex-1 py-[var(--space-3)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-bold transition-colors',
                activeTab === tab.key
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)]',
              ].join(' ')}>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Tab panels */}
      <main className="flex-1 px-[var(--space-5)] py-[var(--space-6)] pb-32">

        {/* Servicios */}
        {activeTab === 'services' && (
          <section id="tabpanel-services" role="tabpanel" aria-label="Mis servicios" className="animate-fade-in">
            <div className="flex items-center justify-between mb-[var(--space-5)]">
              <p className="text-[var(--text-xs)] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
                {seller.services.length} servicios
              </p>
              <Button variant="ghost" size="sm">+ Agregar</Button>
            </div>
            <ul className="flex flex-col gap-[var(--space-3)]" role="list">
              {seller.services.map(svc => (
                <li key={svc.id}>
                  <article className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-[var(--space-5)]">
                    <div className="flex items-start justify-between gap-[var(--space-3)]">
                      <div className="flex-1">
                        <h2 className="text-[var(--text-base)] font-bold text-[var(--color-text-primary)]">{svc.title}</h2>
                        <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)] mt-[var(--space-1)]">
                          {svc.delivery} · {svc.price}
                        </p>
                      </div>
                      <Button variant="secondary" size="sm"
                        aria-label={`Editar ${svc.title}`}>
                        Editar
                      </Button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Leads */}
        {activeTab === 'leads' && (
          <section id="tabpanel-leads" role="tabpanel" aria-label="Leads" className="animate-fade-in">
            <p className="text-[var(--text-xs)] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-5)]">
              {MOCK_LEADS.length} leads
            </p>
            <ul className="flex flex-col gap-[var(--space-3)]" role="list">
              {MOCK_LEADS.map(lead => (
                <li key={lead.id}>
                  <article className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-[var(--space-5)]">
                    <div className="flex items-start justify-between gap-[var(--space-3)]">
                      <div>
                        <p className="text-[var(--text-base)] font-bold text-[var(--color-text-primary)]">{lead.buyer}</p>
                        <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)] mt-[var(--space-1)]">{lead.service}</p>
                        <p className="text-[var(--text-2xs)] text-[var(--color-text-muted)] mt-[var(--space-1)]">{lead.time}</p>
                      </div>
                      <Badge variant={STATUS_VARIANTS[lead.status]}>{STATUS_LABELS[lead.status]}</Badge>
                    </div>
                    {lead.status === 'pending' && (
                      <Button variant="primary" size="sm" className="w-full mt-[var(--space-4)]"
                        onClick={() => navigate('/chat')}>
                        Responder
                      </Button>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Stats */}
        {activeTab === 'stats' && (
          <section id="tabpanel-stats" role="tabpanel" aria-label="Estadísticas" className="animate-fade-in">
            <p className="text-[var(--text-xs)] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-5)]">
              Este mes
            </p>
            <div className="grid grid-cols-2 gap-[var(--space-3)]">
              {[
                { label: 'Visitas al booth', value: '248' },
                { label: 'Leads recibidos',  value: '12'  },
                { label: 'Rating promedio',  value: '4.9' },
                { label: 'Servicios activos', value: String(seller.services.length) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-[var(--space-5)]">
                  <p className="text-[var(--text-3xl)] font-black text-[var(--color-text-primary)]">{value}</p>
                  <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] mt-[var(--space-1)] leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <NavBar />
    </div>
  )
}
