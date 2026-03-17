import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'

const MOCK_MESSAGES = {
  c1: [
    { id: 'm1', text: 'Hola, vi tu servicio de App Móvil. Me interesa saber más.',  sent: true,  time: '10:10' },
    { id: 'm2', text: 'Claro, con gusto te cuento. ¿Qué tipo de app necesitas?',     sent: false, time: '10:12' },
    { id: 'm3', text: 'Una app para gestión de inventario, preferiblemente iOS.',    sent: true,  time: '10:15' },
    { id: 'm4', text: 'Perfecto, trabajamos con React Native. Te mando el brief hoy', sent: false, time: '10:24' },
  ],
  c2: [
    { id: 'm5', text: 'Necesito una estrategia de contenido para mi marca.',         sent: true,  time: '9:00' },
    { id: 'm6', text: 'Podemos empezar la próxima semana, ¿te parece?',             sent: false, time: '9:30' },
  ],
}

const NAMES = { c1: 'Sofia Martínez', c2: 'Carlos Reyes', c3: 'Ana Beltrán' }

export default function Conversation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState(MOCK_MESSAGES[id] || [])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage(e) {
    e.preventDefault()
    if (!input.trim()) return
    setMessages(m => [...m, { id: Date.now().toString(), text: input.trim(), sent: true, time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) }])
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-dvh bg-[var(--color-bg-primary)]">

      {/* Header */}
      <header className="flex items-center gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-4)] border-b border-[var(--color-border-light)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] flex-shrink-0">
        <button onClick={() => navigate('/chat')} aria-label="Volver a mensajes"
          className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] border border-[var(--color-stroke)] flex items-center justify-center text-[var(--color-text-secondary)] flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <Avatar src={null} alt={NAMES[id] || 'Usuario'} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-[var(--color-text-primary)] truncate">{NAMES[id] || 'Conversación'}</p>
          <p className="text-base text-[var(--color-success)]">Disponible</p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-[var(--space-5)] py-[var(--space-5)]" aria-live="polite" aria-label="Conversación">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-[var(--color-text-muted)] mt-8">
            Inicia la conversación
          </p>
        ) : (
          <div className="flex flex-col gap-[var(--space-2)]">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                <div className={[
                  'max-w-[80%] px-[var(--space-4)] py-[var(--space-3)] text-base leading-relaxed',
                  msg.sent
                    ? 'bg-[var(--color-primary)] text-white rounded-[var(--radius-chat-bubble)_var(--radius-chat-bubble)_0_var(--radius-chat-bubble)]'
                    : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-[var(--radius-chat-bubble)_var(--radius-chat-bubble)_var(--radius-chat-bubble)_0]',
                ].join(' ')}>
                  <p>{msg.text}</p>
                  <p className={`text-2xs mt-[var(--space-1)] ${msg.sent ? 'text-white/50' : 'text-[var(--color-text-muted)]'} text-right`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <form onSubmit={sendMessage}
        className="flex items-center gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-4)] border-t border-[var(--color-border-light)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] flex-shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          aria-label="Escribe un mensaje"
          className="flex-1 bg-[var(--color-bg-secondary)] border border-[var(--color-stroke)] rounded-full px-[var(--space-5)] py-[var(--space-3)] text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
        />
        <button type="submit" aria-label="Enviar mensaje"
          disabled={!input.trim()}
          className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    </div>
  )
}
