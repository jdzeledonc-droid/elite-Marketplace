/**
 * Button — EliteMarket primary interactive element
 * Variants: primary | secondary | ghost | destructive
 * Sizes: sm | md | lg
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-bold transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer border-0'

  const variants = {
    primary:     'bg-[var(--color-primary)] text-white shadow-lg hover:bg-[var(--color-primary-hover)] focus-visible:outline-[var(--color-primary)] uppercase tracking-[0.15em]',
    secondary:   'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] border border-[var(--color-border-medium)] shadow-sm hover:bg-[var(--color-bg-secondary)] focus-visible:outline-[var(--color-primary)]',
    ghost:       'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] focus-visible:outline-[var(--color-primary)]',
    destructive: 'bg-[var(--color-error)] text-white shadow-md hover:opacity-90 focus-visible:outline-[var(--color-error)]',
  }

  const sizes = {
    sm: 'px-[var(--space-4)] py-[var(--space-2)] text-[var(--text-2xs)] rounded-[var(--radius-md)]',
    md: 'px-[var(--space-6)] py-[var(--space-4)] text-[var(--text-2xs)] rounded-[var(--radius-lg)]',
    lg: 'px-[var(--space-8)] py-[var(--space-5)] text-[var(--text-sm)] rounded-[var(--radius-lg)]',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
