/**
 * Input — controlled form field with label and error state
 * WCAG: label is always visible, error announced via aria-describedby
 */
export default function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  className = '',
  ...props
}) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`
  const errorId = `${inputId}-error`

  return (
    <div className={`flex flex-col gap-[var(--space-2)] ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[var(--text-xs)] font-bold text-[var(--color-text-tertiary)] uppercase tracking-[0.2em] ml-[var(--space-1)]"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? 'true' : undefined}
        className={[
          'w-full bg-[var(--color-bg-primary)] border-2 rounded-[var(--radius-lg)]',
          'px-[var(--space-6)] py-[var(--space-4)]',
          'text-[var(--text-sm)] font-medium font-[var(--font-family)]',
          'shadow-[var(--shadow-sm)] outline-none transition-colors',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          error
            ? 'border-[var(--color-error)] focus:border-[var(--color-error)]'
            : 'border-[var(--color-border-light)] focus:border-[var(--color-primary)]',
        ].join(' ')}
        {...props}
      />

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-[var(--text-xs)] text-[var(--color-error)] ml-[var(--space-1)]"
        >
          {error}
        </p>
      )}
    </div>
  )
}
