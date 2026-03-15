/**
 * Card — base container with border, shadow, radius
 * Variants: default | service | booth | glass
 */
export default function Card({ children, variant = 'default', className = '', onClick, ...props }) {
  const variants = {
    default: 'bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-[var(--space-6)] shadow-[var(--shadow-sm)]',
    service: 'bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[var(--radius-3xl)] p-[var(--space-8)]',
    booth:   'bg-[var(--color-bg-primary)] rounded-[var(--radius-3xl)_var(--radius-3xl)_0_0] shadow-[var(--shadow-booth)]',
    glass:   'bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-white/20 rounded-[var(--radius-2xl)] p-[var(--space-6)]',
  }

  const interactive = onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''

  return (
    <div
      className={`${variants[variant]} ${interactive} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}
