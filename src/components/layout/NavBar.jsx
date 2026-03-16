import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/**
 * NavBar — bottom navigation bar
 * WCAG: aria-label on nav, aria-current="page" on active item, aria-label on icon buttons
 */
export default function NavBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const items = [
    {
      path: '/',
      label: 'Inicio',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      path: '/chat',
      label: 'Mensajes',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      path: '/sell',
      label: 'Vender',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      path: '/transactions',
      label: 'Pedidos',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      path: '/profile',
      label: 'Perfil',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
    },
  ]

  // Hide nav when not authenticated or on auth/onboarding screens
  if (!currentUser) return null
  const hidden = ['/login', '/register', '/onboarding'].includes(location.pathname)
  if (hidden) return null

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border-t border-[var(--color-border-light)] z-[var(--z-nav)]"
    >
      <ul className="flex items-center justify-around px-[var(--space-2)] py-[var(--space-3)]" role="list">
        {items.map(({ path, label, icon }) => {
          const isActive = location.pathname === path
          return (
            <li key={path}>
              <button
                onClick={() => navigate(path)}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex flex-col items-center gap-[var(--space-1)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-md)] transition-colors',
                  isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)]',
                ].join(' ')}
              >
                {icon}
                <span className="text-[var(--text-2xs)] font-semibold">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
