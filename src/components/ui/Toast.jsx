import { useEffect } from 'react'

/**
 * Toast — replaces all alert() calls
 * Types: success | error | info | warning
 * WCAG: aria-live="polite" for announcements
 */
export default function Toast({ message, type = 'info', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  const icons = {
    success: '✓',
    error:   '✕',
    warning: '⚠',
    info:    'i',
  }

  const colors = {
    success: 'bg-[var(--color-success)] text-white',
    error:   'bg-[var(--color-error)] text-white',
    warning: 'bg-[var(--color-warning)] text-white',
    info:    'bg-[var(--color-text-primary)] text-white',
  }

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-[var(--space-6)] left-1/2 -translate-x-1/2 z-[var(--z-toast)] w-[calc(100%-var(--space-12))] max-w-[390px]"
    >
      <div className={`flex items-center gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-4)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] animate-fade-in ${colors[type]}`}>
        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-xs font-bold flex-shrink-0" aria-hidden="true">
          {icons[type]}
        </span>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          aria-label="Cerrar notificación"
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
