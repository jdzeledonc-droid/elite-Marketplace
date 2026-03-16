import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/ui/SearchBar'
import SellerCard from '../components/ui/SellerCard'
import NavBar from '../components/layout/NavBar'
import { MOCK_SELLERS, CATEGORY_GROUPS } from '../lib/mockData'

/**
 * Home — exploración y búsqueda de vendedores
 * Ruta: /
 */
export default function Home() {
  const [query, setQuery] = useState('')
  const [activeGroup, setActiveGroup] = useState(null)
  const [activeSubcategory, setActiveSubcategory] = useState(null)
  const navigate = useNavigate()

  const currentGroup = activeGroup
    ? CATEGORY_GROUPS.find(g => g.id === activeGroup)
    : null

  const filtered = useMemo(() => {
    return MOCK_SELLERS.filter(seller => {
      const matchesGroup = !activeGroup || seller.group === activeGroup
      const matchesSub   = !activeSubcategory || seller.category === activeSubcategory
      const matchesQuery =
        !query ||
        seller.name.toLowerCase().includes(query.toLowerCase()) ||
        seller.tagline.toLowerCase().includes(query.toLowerCase()) ||
        seller.category.toLowerCase().includes(query.toLowerCase())
      return matchesGroup && matchesSub && matchesQuery
    })
  }, [query, activeGroup, activeSubcategory])

  function selectGroup(groupId) {
    if (activeGroup === groupId) {
      setActiveGroup(null)
      setActiveSubcategory(null)
    } else {
      setActiveGroup(groupId)
      setActiveSubcategory(null)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)]">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-[var(--z-overlay)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border-b border-[var(--color-border-light)] px-[var(--space-6)] pt-[var(--space-8)] pb-[var(--space-5)]">
        <div className="flex items-center justify-between mb-[var(--space-5)]">
          <div>
            <p className="text-[var(--text-xs)] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
              EliteMarket
            </p>
            <h1 className="text-[var(--text-2xl)] font-black text-[var(--color-text-primary)] leading-tight">
              Servicios premium
            </h1>
          </div>

          <button
            onClick={() => navigate('/profile')}
            aria-label="Ver perfil"
            className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-border-medium)] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        <SearchBar value={query} onChange={setQuery} resultsCount={filtered.length} />

        {/* ── Grupos (nivel 1) ── */}
        <div
          className="flex gap-[var(--space-2)] mt-[var(--space-4)] overflow-x-auto pb-[var(--space-1)]"
          role="group"
          aria-label="Filtrar por categoría"
        >
          <button
            onClick={() => { setActiveGroup(null); setActiveSubcategory(null) }}
            aria-pressed={!activeGroup}
            className={[
              'flex-shrink-0 px-[var(--space-4)] py-[var(--space-2)] rounded-full text-[var(--text-xs)] font-bold transition-colors',
              !activeGroup
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-medium)]',
            ].join(' ')}
          >
            Todos
          </button>
          {CATEGORY_GROUPS.map(group => (
            <button
              key={group.id}
              onClick={() => selectGroup(group.id)}
              aria-pressed={activeGroup === group.id}
              className={[
                'flex-shrink-0 px-[var(--space-4)] py-[var(--space-2)] rounded-full text-[var(--text-xs)] font-bold transition-colors',
                activeGroup === group.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-medium)]',
              ].join(' ')}
            >
              {group.label}
            </button>
          ))}
        </div>

        {/* ── Subcategorías (nivel 2) — solo si hay grupo activo ── */}
        {currentGroup && (
          <div
            className="flex gap-[var(--space-2)] mt-[var(--space-2)] overflow-x-auto pb-[var(--space-1)]"
            role="group"
            aria-label={`Subcategorías de ${currentGroup.label}`}
          >
            {currentGroup.subcategories.map(sub => (
              <button
                key={sub}
                onClick={() => setActiveSubcategory(activeSubcategory === sub ? null : sub)}
                aria-pressed={activeSubcategory === sub}
                className={[
                  'flex-shrink-0 px-[var(--space-3)] py-[var(--space-1)] rounded-full text-[var(--text-2xs)] font-bold border transition-colors',
                  activeSubcategory === sub
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : 'border-[var(--color-border-medium)] text-[var(--color-text-tertiary)] hover:border-[var(--color-text-muted)]',
                ].join(' ')}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="flex-1 px-[var(--space-5)] py-[var(--space-6)] pb-32">
        <p className="text-[var(--text-xs)] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-5)]">
          {query
            ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`
            : activeSubcategory
              ? activeSubcategory
              : activeGroup
                ? currentGroup?.label
                : 'Destacados'}
        </p>

        {filtered.length > 0 ? (
          <ul className="flex flex-col gap-[var(--space-4)]" role="list" aria-label="Vendedores">
            {filtered.map(seller => (
              <li key={seller.id}>
                <SellerCard seller={seller} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-[var(--radius-2xl)] bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-[var(--space-5)]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[var(--color-text-muted)]" aria-hidden="true">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-[var(--text-md)] font-bold text-[var(--color-text-primary)]">Sin resultados</p>
            <p className="text-[var(--text-sm)] text-[var(--color-text-tertiary)] mt-[var(--space-2)]">
              Intenta con otro término o categoría
            </p>
          </div>
        )}
      </main>

      <NavBar />
    </div>
  )
}
