/**
 * Badge — small label chip
 * Variants: verified | role | category | success | warning | error
 */
export default function Badge({ children, variant = 'role', className = '' }) {
  const base = 'inline-flex items-center font-bold uppercase tracking-[3.5px] text-2xs leading-[21px] px-4 py-1 rounded-full'

  const variants = {
    verified:    'bg-[var(--color-verified)]/15 text-[var(--color-text-primary)]',
    role:        'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]',
    category:    'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]',
    success:     'bg-[var(--color-success)]/10 text-[var(--color-text-primary)]',
    warning:     'bg-[var(--color-warning)]/10 text-[var(--color-text-primary)]',
    error:       'bg-[var(--color-error)]/10 text-[var(--color-text-primary)]',
    'hecho-en-cr': 'bg-[#e8f5e9] text-[var(--color-text-primary)]',
    local:       'bg-[#e3f2fd] text-[var(--color-text-primary)]',
    level:       'bg-transparent border border-[var(--color-stroke)] text-[var(--color-text-secondary)]',
  }

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
