import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import NavBar from '../components/layout/NavBar'
import { useAuth } from '../hooks/useAuth'
import { isMockMode, fetchMyTransactions } from '../lib/supabase'

const MOCK_TRANSACTIONS = [
  { id: 't1', service: 'Diseño de App Móvil',     seller: 'Sofia Martínez', amount: '$800 USD',  status: 'completed', date: '12 Mar 2026' },
  { id: 't2', service: 'Estrategia de Contenido', seller: 'Carlos Reyes',   amount: '$400 USD',  status: 'pending',   date: '10 Mar 2026' },
  { id: 't3', service: 'Video Corporativo',        seller: 'Ana Beltrán',    amount: '$1,500 USD', status: 'pending',  date: '8 Mar 2026'  },
  { id: 't4', service: 'Auditoría SEO',            seller: 'Lucía Vargas',   amount: '$200 USD',  status: 'completed', date: '1 Mar 2026'  },
]

const STATUS_LABELS   = { pending: 'Pendiente', completed: 'Completado', disputed: 'En disputa', refunded: 'Reembolsado' }
const STATUS_VARIANTS = { pending: 'warning', completed: 'success', disputed: 'error', refunded: 'role' }

export default function Transactions() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(!isMockMode)

  useEffect(() => {
    if (isMockMode || !currentUser) return
    fetchMyTransactions(currentUser.id)
      .then(setTransactions)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [currentUser])

  const displayTransactions = isMockMode ? MOCK_TRANSACTIONS : transactions

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)]">
      <header className="px-[var(--space-6)] pt-[var(--space-8)] pb-[var(--space-5)] border-b border-[var(--color-border-light)]">
        <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-1)]">
          <button onClick={() => navigate(-1)} aria-label="Volver"
            className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] border border-[var(--color-stroke)] flex items-center justify-center text-[var(--color-text-secondary)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">EliteMarket</p>
        </div>
        <h1 className="text-md font-black text-[var(--color-text-primary)]">Mis pedidos</h1>
      </header>

      <main className="flex-1 px-[var(--space-5)] py-[var(--space-6)] pb-32">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
          </div>
        ) : displayTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-md font-bold text-[var(--color-text-primary)]">Sin pedidos</p>
            <p className="text-sm text-[var(--color-text-tertiary)] mt-[var(--space-2)]">
              Aquí verás el historial de tus pedidos
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-[var(--space-3)]" role="list" aria-label="Historial de pedidos">
            {displayTransactions.map(tx => (
              <li key={tx.id}>
                <article className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-[var(--space-5)]">
                  <div className="flex items-start justify-between gap-[var(--space-3)]">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-bold text-[var(--color-text-primary)] truncate">{tx.service}</h2>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-[var(--space-1)]">{tx.seller}</p>
                      <p className="text-2xs text-[var(--color-text-muted)] mt-[var(--space-1)]">{tx.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-[var(--space-2)] flex-shrink-0">
                      <p className="text-base font-black text-[var(--color-text-primary)]">{tx.amount}</p>
                      <Badge variant={STATUS_VARIANTS[tx.status]}>{STATUS_LABELS[tx.status]}</Badge>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>

      <NavBar />
    </div>
  )
}
