import { useEffect, useRef } from 'react'

/**
 * Modal — accessible dialog with focus trap
 * WCAG: role="dialog", aria-modal, focus trap, closes on Escape
 */
export default function Modal({ isOpen, onClose, title, children, className = '' }) {
  const overlayRef = useRef(null)
  const firstFocusRef = useRef(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  // Focus trap + Escape key — only re-runs when isOpen changes, not on every parent re-render
  useEffect(() => {
    if (!isOpen) return

    const previousFocus = document.activeElement
    firstFocusRef.current?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') onCloseRef.current()
      if (e.key !== 'Tab') return

      const focusable = overlayRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center"
      aria-hidden="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 w-full max-w-[430px] max-h-[85dvh] overflow-y-auto bg-[var(--color-bg-primary)] rounded-[var(--radius-3xl)_var(--radius-3xl)_0_0] p-[var(--space-8)] shadow-[var(--shadow-xl)] animate-fade-in ${className}`}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-[var(--color-border-medium)] rounded-full mx-auto mb-[var(--space-6)]" aria-hidden="true" />

        {title && (
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-[var(--space-6)]">
            {title}
          </h2>
        )}

        {/* First focusable element anchor */}
        <button
          ref={firstFocusRef}
          onClick={onClose}
          className="absolute top-[var(--space-6)] right-[var(--space-6)] w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-border-medium)] transition-colors"
          aria-label="Cerrar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {children}
      </div>
    </div>
  )
}
