import { useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'
import NavBar from '../components/layout/NavBar'

const MOCK_CHATS = [
  { id: 'c1', name: 'Sofia Martínez', lastMsg: 'Perfecto, te mando el brief hoy', time: '10:24', unread: 2, avatar: null },
  { id: 'c2', name: 'Carlos Reyes',   lastMsg: 'Podemos empezar la próxima semana', time: 'Ayer',  unread: 0, avatar: null },
  { id: 'c3', name: 'Ana Beltrán',    lastMsg: 'El video queda genial', time: 'Lun',   unread: 0, avatar: null },
]

export default function ChatList() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)]">
      <header className="px-[var(--space-6)] pt-[var(--space-8)] pb-[var(--space-5)] border-b border-[var(--color-border-light)]">
        <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-1)]">
          EliteMarket
        </p>
        <h1 className="text-md font-black text-[var(--color-text-primary)]">Mensajes</h1>
      </header>

      <main className="flex-1 pb-24">
        {MOCK_CHATS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-[var(--space-6)]">
            <p className="text-md font-bold text-[var(--color-text-primary)]">Sin mensajes</p>
            <p className="text-sm text-[var(--color-text-tertiary)] mt-[var(--space-2)]">
              Contacta a un vendedor para empezar
            </p>
          </div>
        ) : (
          <ul role="list" aria-label="Conversaciones">
            {MOCK_CHATS.map(chat => (
              <li key={chat.id}>
                <button
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className="w-full flex items-center gap-[var(--space-4)] px-[var(--space-6)] py-[var(--space-4)] hover:bg-[var(--color-bg-secondary)] transition-colors active:bg-[var(--color-bg-tertiary)]"
                  aria-label={`Chat con ${chat.name}${chat.unread ? `, ${chat.unread} mensajes sin leer` : ''}`}
                >
                  <Avatar src={chat.avatar} alt={chat.name} size="md" />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-[var(--color-text-primary)] truncate">{chat.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)] flex-shrink-0 ml-[var(--space-2)]">{chat.time}</p>
                    </div>
                    <div className="flex items-center justify-between mt-[var(--space-1)]">
                      <p className="text-sm text-[var(--color-text-tertiary)] truncate">{chat.lastMsg}</p>
                      {chat.unread > 0 && (
                        <span className="ml-[var(--space-2)] flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-2xs font-bold flex items-center justify-center"
                          aria-label={`${chat.unread} sin leer`}>
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
                <div className="mx-[var(--space-6)] h-px bg-[var(--color-stroke)]" aria-hidden="true" />
              </li>
            ))}
          </ul>
        )}
      </main>

      <NavBar />
    </div>
  )
}
