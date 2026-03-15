/**
 * SearchBar — primary interaction pattern for EliteMarket
 * WCAG: role="search", aria-label, aria-live on results count
 */
export default function SearchBar({ value, onChange, placeholder = 'Buscar servicios...', resultsCount, className = '' }) {
  return (
    <div role="search" className={`relative ${className}`}>
      <div className="relative flex items-center">
        <svg
          className="absolute left-[var(--space-5)] text-[var(--color-text-tertiary)] pointer-events-none"
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>

        <input
          type="search"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Buscar servicios y vendedores"
          className="w-full bg-[var(--color-bg-primary)] border-2 border-[var(--color-border-light)] rounded-[var(--radius-4xl)] pl-[var(--space-12)] pr-[var(--space-5)] py-[var(--space-4)] text-[var(--text-sm)] font-medium shadow-[var(--shadow-sm)] outline-none focus:border-[var(--color-primary)] transition-colors"
        />

        {value && (
          <button
            onClick={() => onChange('')}
            aria-label="Limpiar búsqueda"
            className="absolute right-[var(--space-4)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Live region for screen readers */}
      {value && (
        <p
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {resultsCount !== undefined ? `${resultsCount} resultados para ${value}` : 'Buscando...'}
        </p>
      )}
    </div>
  )
}
