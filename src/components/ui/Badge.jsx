/**
 * Badge — small label chip
 * Variants: verified | role | category | success | warning | error
 */
export default function Badge({ children, variant = 'role', className = '' }) {
  const base = 'inline-flex items-center font-bold uppercase tracking-[0.25em] text-[var(--text-2xs)] px-[var(--space-4)] py-[var(--space-1)] rounded-full'

  const variants = {
    verified: 'bg-[var(--color-verified)] text-white',
    role:     'bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]',
    category: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
    success:  'bg-[var(--color-success)]/10 text-[var(--color-success)]',
    warning:  'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
    error:    'bg-[var(--color-error)]/10 text-[var(--color-error)]',
  }

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
