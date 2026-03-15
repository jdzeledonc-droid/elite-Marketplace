import { useParams, useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import NavBar from '../components/layout/NavBar'
import { MOCK_SELLERS, ACCENT_COLORS } from '../lib/mockData'

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

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-secondary)]">
      <div className="relative h-48 flex-shrink-0" style={{ background: `linear-gradient(135deg, ${accent.bg} 0%, ${accent.bg}cc 100%)` }}>
        <button onClick={() => navigate(-1)} aria-label="Volver"
          className="absolute top-[var(--space-8)] left-[var(--space-5)] w-10 h-10 rounded-[var(--radius-lg)] bg-white/20 backdrop-blur-sm flex items-center justify-center"
          style={{ color: accent.text }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 bg-[var(--color-bg-primary)] rounded-[var(--radius-3xl)_var(--radius-3xl)_0_0] -mt-10 shadow-[var(--shadow-booth)] px-[var(--space-6)] pt-[var(--space-6)] pb-32">
        <div className="flex items-start gap-[var(--space-4)] mb-[var(--space-6)]">
          <div className="-mt-16">
            <Avatar src={seller.avatar} alt={seller.name} size="lg" verified={seller.is_verified} />
          </div>
          <div className="flex-1 pt-[var(--space-2)]">
            <h1 className="text-[var(--text-xl)] font-black text-[var(--color-text-primary)]">{seller.name}</h1>
            <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)] mt-[var(--space-1)]">@{seller.username}</p>
          </div>
        </div>

        <div className="flex gap-[var(--space-2)] flex-wrap mb-[var(--space-5)]">
          <Badge variant="category">{seller.category}</Badge>
          {seller.is_verified && <Badge variant="verified">Verificado</Badge>}
        </div>

        <p className="text-[var(--text-base)] text-[var(--color-text-secondary)] leading-relaxed mb-[var(--space-6)]">{seller.tagline}</p>

        <div className="flex gap-[var(--space-6)] mb-[var(--space-8)] pb-[var(--space-6)] border-b border-[var(--color-border-light)]">
          {[{ value: seller.rating, label: 'Rating' }, { value: seller.reviews, label: 'Reseñas' }, { value: seller.services.length, label: 'Servicios' }].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-[var(--text-2xl)] font-black text-[var(--color-text-primary)]">{value}</p>
              <p className="text-[var(--text-2xs)] text-[var(--color-text-muted)] uppercase tracking-[0.15em]">{label}</p>
            </div>
          ))}
        </div>

        <p className="text-[var(--text-xs)] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-4)]">Servicios</p>
        <ul className="flex flex-col gap-[var(--space-3)]" role="list">
          {seller.services.map(service => (
            <li key={service.id}>
              <article className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-[var(--space-5)]">
                <div className="flex items-start justify-between gap-[var(--space-3)]">
                  <div className="flex-1">
                    <h2 className="text-[var(--text-base)] font-bold text-[var(--color-text-primary)] mb-[var(--space-1)]">{service.title}</h2>
                    <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">Entrega en {service.delivery}</p>
                  </div>
                  <p className="text-[var(--text-sm)] font-bold text-[var(--color-text-primary)] flex-shrink-0">{service.price}</p>
                </div>
                <Button variant="primary" size="sm" className="w-full mt-[var(--space-4)]"
                  onClick={() => navigate('/chat')}>Contactar</Button>
              </article>
            </li>
          ))}
        </ul>
      </div>
      <NavBar />
    </div>
  )
}
