/**
 * Avatar — user/seller profile image with optional verified badge
 * Sizes: sm (48px) | md (64px) | lg (112px)
 * WCAG: alt is required
 */
export default function Avatar({ src, alt, size = 'md', verified = false, className = '' }) {
  const sizes = {
    sm: 'w-[var(--avatar-sm)] h-[var(--avatar-sm)]',
    md: 'w-[var(--avatar-md)] h-[var(--avatar-md)]',
    lg: 'w-[var(--avatar-lg)] h-[var(--avatar-lg)]',
  }

  const badgeSizes = {
    sm: 'w-4 h-4 -bottom-0.5 -right-0.5',
    md: 'w-5 h-5 -bottom-0.5 -right-0.5',
    lg: 'w-7 h-7 bottom-0 right-0',
  }

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div className={`${sizes[size]} rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-inner)]`}>
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-tertiary)] font-semibold"
            aria-label={alt}
          >
            {alt ? alt.charAt(0).toUpperCase() : '?'}
          </div>
        )}
      </div>

      {verified && (
        <span
          className={`absolute ${badgeSizes[size]} bg-[var(--color-verified)] rounded-full flex items-center justify-center`}
          aria-label="Vendedor verificado"
          role="img"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
    </div>
  )
}
