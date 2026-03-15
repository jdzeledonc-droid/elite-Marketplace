import { useNavigate } from 'react-router-dom'
import Avatar from './Avatar'
import Badge from './Badge'
import { ACCENT_COLORS } from '../../lib/mockData'

/**
 * SellerCard — search result / featured seller card
 * Figma: AP3mfBiEQCRtve451jn06M
 */
export default function SellerCard({ seller }) {
  const navigate = useNavigate()
  const accent = ACCENT_COLORS[seller.accent] || ACCENT_COLORS.black

  return (
    <article
      onClick={() => navigate(`/seller/${seller.id}`)}
      className="bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-[var(--radius-3xl)] p-[var(--space-6)] shadow-[var(--shadow-sm)] cursor-pointer active:scale-[0.98] transition-transform"
      aria-label={`Ver perfil de ${seller.name}, ${seller.category}`}
    >
      {/* Header row */}
      <div className="flex items-start gap-[var(--space-4)]">
        <Avatar
          src={seller.avatar}
          alt={seller.name}
          size="md"
          verified={seller.is_verified}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[var(--space-2)] flex-wrap">
            <h3 className="text-[var(--text-md)] font-bold text-[var(--color-text-primary)] truncate">
              {seller.name}
            </h3>
          </div>
          <Badge variant="category" className="mt-[var(--space-1)]">
            {seller.category}
          </Badge>
        </div>

        {/* Accent dot */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
          style={{ background: accent.bg }}
          aria-hidden="true"
        />
      </div>

      {/* Tagline */}
      <p className="mt-[var(--space-4)] text-[var(--text-sm)] text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
        {seller.tagline}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-[var(--space-4)] mt-[var(--space-4)]">
        <div className="flex items-center gap-[var(--space-1)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--color-warning)]" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="text-[var(--text-sm)] font-bold text-[var(--color-text-primary)]">
            {seller.rating}
          </span>
          <span className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
            ({seller.reviews})
          </span>
        </div>

        <span className="text-[var(--color-border-medium)]" aria-hidden="true">·</span>

        <span className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          {seller.services.length} servicio{seller.services.length !== 1 ? 's' : ''}
        </span>

        {seller.services[0] && (
          <>
            <span className="text-[var(--color-border-medium)]" aria-hidden="true">·</span>
            <span className="text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)]">
              {seller.services[0].price}
            </span>
          </>
        )}
      </div>
    </article>
  )
}
