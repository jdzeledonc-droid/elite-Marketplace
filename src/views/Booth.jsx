import { useParams, useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import NavBar from '../components/layout/NavBar'
import { MOCK_SELLERS, ACCENT_COLORS } from '../lib/mockData'

const BOOTH_LABEL = { services: 'Servicios', catalog: 'Productos', courses: 'Cursos', hybrid: 'Productos' }
const LEVEL_VARIANT = { Principiante: 'success', Intermedio: 'warning', Avanzado: 'error' }

export default function Booth() {
  const { id } = useParams()
  const navigate = useNavigate()
  const seller = MOCK_SELLERS.find(s => s.id === id)
  const accent = ACCENT_COLORS[seller?.accent] || ACCENT_COLORS.black

  if (!seller) return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-[var(--space-4)] px-[var(--space-6)]">
      <p className="text-[var(--text-lg)] font-bold">Vendedor no encontrado</p>
      <Button variant="secondary" onClick={() => navigate('/')}>Volver al inicio</Button>
    </div>
  )

  const itemsCount = seller.items?.length ?? 0

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-secondary)]">

      {/* ── Hero gradient ── */}
      <div className="relative h-48 flex-shrink-0" style={{ background: `linear-gradient(135deg, ${accent.bg} 0%, ${accent.bg}cc 100%)` }}>
        <button onClick={() => navigate(-1)} aria-label="Volver"
          className="absolute top-[var(--space-8)] left-[var(--space-5)] w-10 h-10 rounded-[var(--radius-lg)] bg-white/20 backdrop-blur-sm flex items-center justify-center"
          style={{ color: accent.text }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ── Card content ── */}
      <div className="flex-1 bg-[var(--color-bg-primary)] rounded-[var(--radius-3xl)_var(--radius-3xl)_0_0] -mt-10 shadow-[var(--shadow-booth)] px-[var(--space-6)] pt-[var(--space-6)] pb-32">

        {/* Avatar + name */}
        <div className="flex items-start gap-[var(--space-4)] mb-[var(--space-5)]">
          <div className="-mt-16">
            <Avatar src={seller.avatar} alt={seller.name} size="lg" verified={seller.is_verified} />
          </div>
          <div className="flex-1 pt-[var(--space-2)]">
            <h1 className="text-[var(--text-xl)] font-black text-[var(--color-text-primary)]">{seller.name}</h1>
            <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)] mt-[var(--space-1)]">@{seller.username}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-[var(--space-2)] flex-wrap mb-[var(--space-5)]">
          <Badge variant="category">{seller.category}</Badge>
          {seller.is_verified && <Badge variant="verified">Verificado</Badge>}
          {seller.badge === 'hecho-en-cr' && <Badge variant="hecho-en-cr">🇨🇷 Hecho en CR</Badge>}
          {seller.badge === 'local' && <Badge variant="local">📍 Local</Badge>}
        </div>

        <p className="text-[var(--text-base)] text-[var(--color-text-secondary)] leading-relaxed mb-[var(--space-6)]">
          {seller.tagline}
        </p>

        {/* Stats */}
        <div className="flex gap-[var(--space-6)] mb-[var(--space-8)] pb-[var(--space-6)] border-b border-[var(--color-border-light)]">
          {[
            { value: seller.rating, label: 'Rating' },
            { value: seller.reviews, label: 'Reseñas' },
            { value: itemsCount, label: BOOTH_LABEL[seller.boothType] ?? 'Items' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-[var(--text-2xl)] font-black text-[var(--color-text-primary)]">{value}</p>
              <p className="text-[var(--text-2xs)] text-[var(--color-text-muted)] uppercase tracking-[0.15em]">{label}</p>
            </div>
          ))}
        </div>

        {/* ── SERVICES booth ── */}
        {seller.boothType === 'services' && (
          <>
            <p className="text-[var(--text-xs)] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-4)]">
              Servicios
            </p>
            <ul className="flex flex-col gap-[var(--space-3)]" role="list">
              {seller.items.map(item => (
                <li key={item.id}>
                  <article className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-[var(--space-5)]">
                    <div className="flex items-start justify-between gap-[var(--space-3)]">
                      <div className="flex-1">
                        <h2 className="text-[var(--text-base)] font-bold text-[var(--color-text-primary)] mb-[var(--space-1)]">{item.title}</h2>
                        <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">Entrega en {item.delivery}</p>
                      </div>
                      <p className="text-[var(--text-sm)] font-bold text-[var(--color-text-primary)] flex-shrink-0">{item.price}</p>
                    </div>
                    <Button variant="primary" size="sm" className="w-full mt-[var(--space-4)]"
                      onClick={() => navigate('/chat')}>
                      Contactar
                    </Button>
                  </article>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* ── CATALOG booth ── */}
        {seller.boothType === 'catalog' && (
          <>
            <p className="text-[var(--text-xs)] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-4)]">
              Catálogo
            </p>
            <div className="grid grid-cols-2 gap-[var(--space-3)]">
              {seller.items.map(item => (
                <article key={item.id} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] overflow-hidden">
                  {/* Image placeholder */}
                  <div className="aspect-square bg-[var(--color-bg-tertiary)] flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[var(--color-border-medium)]" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="m21 15-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="p-[var(--space-3)]">
                    <p className="text-[var(--text-sm)] font-bold text-[var(--color-text-primary)] leading-tight mb-[var(--space-1)]">
                      {item.title}
                    </p>
                    <p className="text-[var(--text-base)] font-black text-[var(--color-primary)]">{item.price}</p>
                    {item.stock !== null && (
                      <p className="text-[var(--text-2xs)] text-[var(--color-text-muted)] mt-[var(--space-1)]">
                        {item.stock > 0 ? `${item.stock} disponibles` : 'Sin stock'}
                      </p>
                    )}
                    <Button variant="primary" size="sm" className="w-full mt-[var(--space-3)]"
                      onClick={() => navigate('/chat')}>
                      Pedir
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {/* ── COURSES booth ── */}
        {seller.boothType === 'courses' && (
          <>
            <p className="text-[var(--text-xs)] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-4)]">
              Cursos disponibles
            </p>
            <ul className="flex flex-col gap-[var(--space-3)]" role="list">
              {seller.items.map(item => (
                <li key={item.id}>
                  <article className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-[var(--space-5)]">
                    <div className="flex items-start justify-between gap-[var(--space-3)] mb-[var(--space-3)]">
                      <h2 className="text-[var(--text-base)] font-bold text-[var(--color-text-primary)] flex-1 leading-tight">
                        {item.title}
                      </h2>
                      <p className="text-[var(--text-base)] font-black text-[var(--color-primary)] flex-shrink-0">{item.price}</p>
                    </div>
                    <div className="flex items-center gap-[var(--space-3)]">
                      <Badge variant={LEVEL_VARIANT[item.level] ?? 'role'}>{item.level}</Badge>
                      <span className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">{item.duration}</span>
                    </div>
                    <Button variant="primary" size="sm" className="w-full mt-[var(--space-4)]"
                      onClick={() => navigate('/chat')}>
                      Inscribirse
                    </Button>
                  </article>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* ── HYBRID booth (catalog + services) ── */}
        {seller.boothType === 'hybrid' && (
          <>
            <p className="text-[var(--text-xs)] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-4)]">
              Menú / Catálogo
            </p>
            <ul className="flex flex-col gap-[var(--space-3)] mb-[var(--space-8)]" role="list">
              {seller.items.map(item => (
                <li key={item.id}>
                  <div className="flex items-center justify-between py-[var(--space-3)] border-b border-[var(--color-border-light)]">
                    <p className="text-[var(--text-base)] font-medium text-[var(--color-text-primary)]">{item.title}</p>
                    <p className="text-[var(--text-base)] font-bold text-[var(--color-text-primary)]">{item.price}</p>
                  </div>
                </li>
              ))}
            </ul>

            {seller.services?.length > 0 && (
              <>
                <p className="text-[var(--text-xs)] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-4)]">
                  Servicios
                </p>
                <ul className="flex flex-col gap-[var(--space-3)]" role="list">
                  {seller.services.map(svc => (
                    <li key={svc.id}>
                      <article className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-[var(--space-5)]">
                        <div className="flex items-start justify-between gap-[var(--space-3)]">
                          <div className="flex-1">
                            <h2 className="text-[var(--text-base)] font-bold text-[var(--color-text-primary)] mb-[var(--space-1)]">{svc.title}</h2>
                            <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">{svc.delivery}</p>
                          </div>
                          <p className="text-[var(--text-sm)] font-bold text-[var(--color-text-primary)] flex-shrink-0">{svc.price}</p>
                        </div>
                        <Button variant="primary" size="sm" className="w-full mt-[var(--space-4)]"
                          onClick={() => navigate('/chat')}>
                          Contactar
                        </Button>
                      </article>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>

      <NavBar />
    </div>
  )
}
