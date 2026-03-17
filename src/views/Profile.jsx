import { useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import NavBar from '../components/layout/NavBar'
import { useAuth } from '../hooks/useAuth'

export default function Profile() {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()

  const MENU_ITEMS = [
    { label: 'Mis pedidos',      icon: '📋', path: '/transactions' },
    { label: 'Mis mensajes',     icon: '💬', path: '/chat' },
    { label: 'Panel vendedor',   icon: '🏪', path: '/sell' },
    { label: 'Configuración',    icon: '⚙️', path: '/settings' },
    { label: 'Ayuda',            icon: '❓', path: '/help' },
  ]

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)]">
      <header className="px-[var(--space-6)] pt-[var(--space-8)] pb-[var(--space-6)] border-b border-[var(--color-border-light)]">
        <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-1)]">
          EliteMarket
        </p>
        <h1 className="text-lg font-black text-[var(--color-text-primary)]">Mi perfil</h1>
      </header>

      <main className="flex-1 pb-32">
        {/* Profile card */}
        <div className="flex items-center gap-[var(--space-5)] px-[var(--space-6)] py-[var(--space-6)] border-b border-[var(--color-border-light)]">
          <Avatar src={currentUser.avatar} alt={currentUser.name} size="lg" verified={currentUser.is_verified} />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-[var(--color-text-primary)]">{currentUser.name}</h2>
            <p className="text-sm text-[var(--color-text-tertiary)] truncate mt-[var(--space-1)]">{currentUser.email}</p>
            <div className="mt-[var(--space-3)]">
              <Badge variant="role">{currentUser.user_role === 'buyer' ? 'Comprador' : 'Vendedor'}</Badge>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav aria-label="Opciones de perfil">
          <ul role="list">
            {MENU_ITEMS.map(item => (
              <li key={item.label}>
                <button
                  onClick={() => item.path !== '#' && navigate(item.path)}
                  className="w-full flex items-center gap-[var(--space-4)] px-[var(--space-6)] py-[var(--space-5)] hover:bg-[var(--color-bg-secondary)] transition-colors active:bg-[var(--color-bg-tertiary)]"
                  aria-label={item.label}
                >
                  <span className="text-xl w-6 text-center" aria-hidden="true">{item.icon}</span>
                  <span className="flex-1 text-left text-base font-medium text-[var(--color-text-primary)]">
                    {item.label}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[var(--color-text-muted)]" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="mx-[var(--space-6)] h-px bg-[var(--color-border-light)]" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="px-[var(--space-6)] pt-[var(--space-6)]">
          <Button variant="destructive" size="lg" className="w-full"
            onClick={() => { logout(); navigate('/login') }}>
            Cerrar sesión
          </Button>
        </div>
      </main>

      <NavBar />
    </div>
  )
}
