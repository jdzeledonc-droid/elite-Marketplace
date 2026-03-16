import { useNavigate } from 'react-router-dom'
import Avatar from './Avatar'
import Badge from './Badge'
import { ACCENT_COLORS } from '../../lib/mockData'

/**
 * SellerCard — search result / featured seller card
 * Figma: AP3mfBiEQCRtve451jn06M
 */
const ITEMS_LABEL = { services: 'servicio', catalog: 'producto', courses: 'curso', hybrid: 'producto' }

export default function SellerCard({ seller }) {
  const navigate = useNavigate()
  const accent = ACCENT_COLORS[seller.accent] || ACCENT_COLORS.black
  const itemsCount = seller.items?.length ?? 0
  const itemLabel = ITEMS_LABEL[seller.boothType] || 'servicio'

  return (
    <article
      onClick={() => navigate(`/seller/${seller.id}`)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/seller/${seller.id}`) }}
      tabIndex={0}
      role="button"
      className="bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-[var(--radius-3xl)] overflow-hidden shadow-[var(--shadow-sm)] cursor-pointer active:scale-[0.98] transition-transform focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2"
      aria-label={`Ver perfil de ${seller.name}, ${seller.category}`}
    >
      {/* Cover image / gradient */}
      <div className="relative h-36 flex-shrink-0">
        {seller.cover ? (
          <img
            src={seller.cover}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `linear-gradient(135deg, ${accent.bg} 0%, ${accent.bg}99 100%)` }}
            aria-hidden="true"
          />
        )}

        {/* Badge overlay */}
        {(seller.badge === 'hecho-en-cr' || seller.badge === 'local') && (
          <div className="absolute top-[var(--space-3)] right-[var(--space-3)]">
            <Badge variant={seller.badge}>
              {seller.badge === 'hecho-en-cr' ? '🇨🇷 Hecho en CR' : '📍 Local'}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-[var(--space-5)] pt-[var(--space-3)] pb-[var(--space-5)]">

        {/* Avatar + name + rating */}
        <div className="flex items-start gap-[var(--space-3)]">
          <div className="-mt-9">
            <Avatar src={seller.avatar} alt={seller.name} size="md" verified={seller.is_verified} />
          </div>
          <div className="flex-1 min-w-0 pt-[var(--space-1)]">
            <h3 className="text-[var(--text-md)] font-bold text-[var(--color-text-primary)] truncate">
              {seller.name}
            </h3>
            <Badge variant="category" className="mt-[var(--space-1)]">
              {seller.category}
            </Badge>
          </div>
          <div className="flex items-center gap-[var(--space-1)] pt-[var(--space-2)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--color-warning)]" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-[var(--text-sm)] font-bold text-[var(--color-text-primary)]">
              {seller.rating}
            </span>
            <span className="text-[var(--text-2xs)] text-[var(--color-text-tertiary)]">
              ({seller.reviews})
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p className="mt-[var(--space-3)] text-[var(--text-sm)] text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
          {seller.tagline}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-[var(--space-3)] mt-[var(--space-3)]">
          <span className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
            {itemsCount} {itemLabel}{itemsCount !== 1 ? 's' : ''}
          </span>
          {seller.items?.[0] && (
            <>
              <span className="text-[var(--color-border-medium)]" aria-hidden="true">·</span>
              <span className="text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)]">
                desde {seller.items[0].price}
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
