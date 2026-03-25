import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import NavBar from '../components/layout/NavBar'
import { MOCK_SELLERS } from '../lib/mockData'
import { useAuth } from '../hooks/useAuth'
import { isMockMode, fetchMySellerProfile, updateSellerItems, updateSellerProfile, fetchMyLeads } from '../lib/supabase'

// Generate a simple unique id for new items
function newId() {
  return `i${Date.now().toString(36)}`
}

// Returns the initial empty form for a given boothType
function emptyItem(boothType) {
  if (boothType === 'catalog') return { id: newId(), title: '', price: '', image: null, stock: '' }
  if (boothType === 'courses')  return { id: newId(), title: '', price: '', duration: '', level: '' }
  return { id: newId(), title: '', price: '', delivery: '' }  // services / hybrid
}

export default function SellerPanel() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [seller, setSeller] = useState(isMockMode ? MOCK_SELLERS[0] : null)
  const [loading, setLoading] = useState(!isMockMode)
  const [activeTab, setActiveTab] = useState('services')
  const [leads, setLeads] = useState([])
  const [leadsLoading, setLeadsLoading] = useState(false)

  // Item modal state
  const [editingItem, setEditingItem]   = useState(null)   // null = closed, object = editing/adding
  const [isNewItem, setIsNewItem]       = useState(false)
  const [itemSaving, setItemSaving]     = useState(false)

  // Profile modal state
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm]       = useState({ title: '', tagline: '', cover_url: '' })
  const [profileSaving, setProfileSaving]   = useState(false)

  useEffect(() => {
    if (isMockMode || !currentUser) return
    fetchMySellerProfile(currentUser.id)
      .then(setSeller)
      .finally(() => setLoading(false))
  }, [currentUser])

  useEffect(() => {
    if (isMockMode || !currentUser) return
    setLeadsLoading(true)
    fetchMyLeads(currentUser.id)
      .then(setLeads)
      .catch(() => {})
      .finally(() => setLeadsLoading(false))
  }, [currentUser])

  const BOOTH_TAB_LABEL = { services: 'Servicios', catalog: 'Productos', courses: 'Cursos', hybrid: 'Catálogo' }

  const TABS = [
    { key: 'services', label: BOOTH_TAB_LABEL[seller?.boothType] ?? 'Servicios' },
    { key: 'leads',    label: 'Leads' },
    { key: 'stats',    label: 'Stats' },
  ]

  const MOCK_LEADS = [
    { id: 'l1', buyer: 'María G.',  service: 'Diseño de App Móvil', status: 'pending',   time: 'Hace 2h' },
    { id: 'l2', buyer: 'Pedro R.',  service: 'Auditoría UX',        status: 'contacted', time: 'Hace 1d' },
    { id: 'l3', buyer: 'Laura M.',  service: 'Sistema de Diseño',   status: 'closed',    time: 'Hace 3d' },
  ]

  const displayLeads = isMockMode ? MOCK_LEADS : leads

  const STATUS_LABELS   = { pending: 'Pendiente', contacted: 'Contactado', closed: 'Cerrado' }
  const STATUS_VARIANTS = { pending: 'warning', contacted: 'success', closed: 'role' }

  // ── Item handlers ─────────────────────────────────────────────────────────

  function openAddItem() {
    setIsNewItem(true)
    setEditingItem(emptyItem(seller.boothType))
  }

  function openEditItem(item) {
    setIsNewItem(false)
    setEditingItem({ ...item })
  }

  function closeItemModal() {
    setEditingItem(null)
    setIsNewItem(false)
  }

  function setItemField(field, value) {
    setEditingItem(prev => ({ ...prev, [field]: value }))
  }

  async function saveItem() {
    if (!editingItem.title.trim() || !editingItem.price.trim()) return
    setItemSaving(true)

    let newItems
    if (isNewItem) {
      newItems = [...seller.items, editingItem]
    } else {
      newItems = seller.items.map(i => i.id === editingItem.id ? editingItem : i)
    }

    setSeller(prev => ({ ...prev, items: newItems }))
    closeItemModal()

    if (!isMockMode) {
      try { await updateSellerItems(seller.id, newItems) } catch (_) { /* silent */ }
    }
    setItemSaving(false)
  }

  async function deleteItem() {
    const newItems = seller.items.filter(i => i.id !== editingItem.id)
    setSeller(prev => ({ ...prev, items: newItems }))
    closeItemModal()

    if (!isMockMode) {
      try { await updateSellerItems(seller.id, newItems) } catch (_) { /* silent */ }
    }
  }

  // ── Profile handlers ──────────────────────────────────────────────────────

  function openEditProfile() {
    setProfileForm({
      title:     seller.title     ?? '',
      tagline:   seller.tagline   ?? '',
      cover_url: seller.cover     ?? '',
    })
    setEditingProfile(true)
  }

  function setProfileField(field, value) {
    setProfileForm(prev => ({ ...prev, [field]: value }))
  }

  async function saveProfile() {
    if (!profileForm.title.trim()) return
    setProfileSaving(true)

    setSeller(prev => ({
      ...prev,
      title:   profileForm.title,
      tagline: profileForm.tagline,
      cover:   profileForm.cover_url || null,
    }))
    setEditingProfile(false)

    if (!isMockMode) {
      try { await updateSellerProfile(seller.id, profileForm) } catch (_) { /* silent */ }
    }
    setProfileSaving(false)
  }

  // ── Render guards ─────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center min-h-dvh">
      <div className="w-6 h-6 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
    </div>
  )

  if (!seller) return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)]">
      <header className="px-[var(--space-6)] pt-[var(--space-8)] pb-[var(--space-5)] border-b border-[var(--color-border-light)]">
        <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Mi panel</p>
        <h1 className="text-base font-black text-[var(--color-text-primary)]">{currentUser?.name}</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-[var(--space-6)] text-center gap-[var(--space-4)]">
        <p className="text-md font-bold text-[var(--color-text-primary)]">Aún no tienes booth</p>
        <p className="text-sm text-[var(--color-text-tertiary)]">Completa el onboarding para crear tu tienda</p>
        <Button variant="primary" onClick={() => navigate('/onboarding')}>Crear mi booth</Button>
      </main>
      <NavBar />
    </div>
  )

  // ── Field config per boothType ─────────────────────────────────────────────
  const isServices = seller.boothType === 'services' || seller.boothType === 'hybrid'
  const isCatalog  = seller.boothType === 'catalog'
  const isCourses  = seller.boothType === 'courses'

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)]">

      {/* Header */}
      <header className="px-[var(--space-6)] pt-[var(--space-8)] pb-[var(--space-5)] border-b border-[var(--color-border-light)]">
        <div className="flex items-center gap-[var(--space-4)] mb-[var(--space-5)]">
          <Avatar src={currentUser?.avatar} alt={currentUser?.name ?? ''} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Mi panel</p>
            <h1 className="text-base font-black text-[var(--color-text-primary)] truncate">{currentUser?.name}</h1>
          </div>
          <div className="flex gap-[var(--space-2)] shrink-0">
            <Button variant="ghost" size="sm" onClick={openEditProfile} aria-label="Editar perfil del booth">
              Editar perfil
            </Button>
            <Button variant="secondary" size="sm"
              onClick={() => seller && navigate(`/seller/${seller.id}`)}
              disabled={!seller} aria-label="Ver mi booth público">
              Ver booth
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-[var(--space-1)]" role="tablist" aria-label="Panel de vendedor">
          {TABS.map(tab => (
            <button key={tab.key} role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`tabpanel-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex-1 py-[var(--space-3)] rounded-[var(--radius-lg)] text-sm font-bold transition-colors',
                activeTab === tab.key
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)]',
              ].join(' ')}>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Tab panels */}
      <main className="flex-1 px-[var(--space-5)] py-[var(--space-6)] pb-32">

        {/* Servicios / Productos / Cursos */}
        {activeTab === 'services' && (
          <section id="tabpanel-services" role="tabpanel" aria-label="Mis servicios" className="animate-fade-in">
            <div className="flex items-center justify-between mb-[var(--space-5)]">
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
                {seller.items.length} {BOOTH_TAB_LABEL[seller.boothType]?.toLowerCase() ?? 'servicios'}
              </p>
              <Button variant="ghost" size="sm" onClick={openAddItem}>+ Agregar</Button>
            </div>
            <ul className="flex flex-col gap-[var(--space-3)]" role="list">
              {seller.items.map(svc => (
                <li key={svc.id}>
                  <article className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-[var(--space-5)]">
                    <div className="flex items-start justify-between gap-[var(--space-3)]">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-[var(--color-text-primary)] truncate">{svc.title}</h2>
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-[var(--space-1)]">
                          {isCatalog && `Stock: ${svc.stock} · `}{svc.price}
                          {(isServices) && ` · ${svc.delivery}`}
                          {isCourses && ` · ${svc.duration} · ${svc.level}`}
                        </p>
                      </div>
                      <Button variant="secondary" size="sm"
                        onClick={() => openEditItem(svc)}
                        aria-label={`Editar ${svc.title}`}>
                        Editar
                      </Button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Leads */}
        {activeTab === 'leads' && (
          <section id="tabpanel-leads" role="tabpanel" aria-label="Leads" className="animate-fade-in">
            <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-5)]">
              {leadsLoading ? '…' : `${displayLeads.length} leads`}
            </p>
            {leadsLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
              </div>
            ) : displayLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-md font-bold text-[var(--color-text-primary)]">Sin leads aún</p>
                <p className="text-sm text-[var(--color-text-tertiary)] mt-[var(--space-2)]">
                  Aquí verás los mensajes de clientes interesados
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-[var(--space-3)]" role="list">
                {displayLeads.map(lead => (
                  <li key={lead.id}>
                    <article className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-[var(--space-5)]">
                      <div className="flex items-start justify-between gap-[var(--space-3)]">
                        <div>
                          <p className="text-base font-bold text-[var(--color-text-primary)]">{lead.buyer}</p>
                          <p className="text-xs text-[var(--color-text-tertiary)] mt-[var(--space-1)]">{lead.service}</p>
                          <p className="text-2xs text-[var(--color-text-muted)] mt-[var(--space-1)]">{lead.time}</p>
                        </div>
                        <Badge variant={STATUS_VARIANTS[lead.status]}>{STATUS_LABELS[lead.status]}</Badge>
                      </div>
                      {lead.status === 'pending' && (
                        <Button variant="primary" size="sm" className="w-full mt-[var(--space-4)]"
                          onClick={() => navigate('/chat')}>
                          Responder
                        </Button>
                      )}
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Stats */}
        {activeTab === 'stats' && (
          <section id="tabpanel-stats" role="tabpanel" aria-label="Estadísticas" className="animate-fade-in">
            <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-5)]">
              Este mes
            </p>
            <div className="grid grid-cols-2 gap-[var(--space-3)]">
              {[
                { label: 'Visitas al booth',  value: '248' },
                { label: 'Leads recibidos',   value: '12'  },
                { label: 'Rating promedio',   value: '4.9' },
                { label: 'Servicios activos', value: String(seller.items.length) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-[var(--space-5)]">
                  <p className="text-3xl font-black text-[var(--color-text-primary)]">{value}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-[var(--space-1)] leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <NavBar />

      {/* ── Item modal ──────────────────────────────────────────────────────── */}
      <Modal
        isOpen={editingItem !== null}
        onClose={closeItemModal}
        title={isNewItem ? `Agregar ${BOOTH_TAB_LABEL[seller.boothType]?.slice(0, -1).toLowerCase() ?? 'servicio'}` : 'Editar'}
      >
        {editingItem && (
          <div className="flex flex-col gap-[var(--space-5)]">
            <Input
              label="Título"
              value={editingItem.title}
              onChange={e => setItemField('title', e.target.value)}
              placeholder={isCatalog ? 'Ej: Blusa Bordada Tropical' : isCourses ? 'Ej: Diseño Gráfico Básico' : 'Ej: Diseño de App Móvil'}
            />
            <Input
              label="Precio"
              value={editingItem.price}
              onChange={e => setItemField('price', e.target.value)}
              placeholder={isCatalog ? 'Ej: ₡18,000' : 'Ej: Desde $800 USD'}
            />
            {isServices && (
              <Input
                label="Entrega"
                value={editingItem.delivery ?? ''}
                onChange={e => setItemField('delivery', e.target.value)}
                placeholder="Ej: 7 días"
              />
            )}
            {isCatalog && (
              <Input
                label="Stock"
                type="number"
                value={editingItem.stock ?? ''}
                onChange={e => setItemField('stock', e.target.value)}
                placeholder="Ej: 10"
              />
            )}
            {isCourses && (
              <>
                <Input
                  label="Duración"
                  value={editingItem.duration ?? ''}
                  onChange={e => setItemField('duration', e.target.value)}
                  placeholder="Ej: 8 horas"
                />
                <Input
                  label="Nivel"
                  value={editingItem.level ?? ''}
                  onChange={e => setItemField('level', e.target.value)}
                  placeholder="Ej: Principiante"
                />
              </>
            )}

            <Button
              variant="primary"
              className="w-full"
              onClick={saveItem}
              disabled={itemSaving || !editingItem.title.trim() || !editingItem.price.trim()}
            >
              {itemSaving ? 'Guardando…' : 'Guardar'}
            </Button>

            {!isNewItem && (
              <button
                onClick={deleteItem}
                className="w-full py-[var(--space-3)] text-sm font-bold text-[var(--color-error)] hover:opacity-70 transition-opacity"
              >
                Eliminar
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* ── Profile modal ───────────────────────────────────────────────────── */}
      <Modal
        isOpen={editingProfile}
        onClose={() => setEditingProfile(false)}
        title="Editar perfil"
      >
        <div className="flex flex-col gap-[var(--space-5)]">
          <Input
            label="Claim profesional"
            value={profileForm.title}
            onChange={e => setProfileField('title', e.target.value)}
            placeholder="Ej: UX Generalist"
          />
          <Input
            label="Tagline"
            value={profileForm.tagline}
            onChange={e => setProfileField('tagline', e.target.value)}
            placeholder="Ej: Diseño que convierte visitantes en clientes"
          />
          <Input
            label="URL de portada"
            value={profileForm.cover_url}
            onChange={e => setProfileField('cover_url', e.target.value)}
            placeholder="https://…  (vacío = gradiente automático)"
          />
          <Button
            variant="primary"
            className="w-full"
            onClick={saveProfile}
            disabled={profileSaving || !profileForm.title.trim()}
          >
            {profileSaving ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </Modal>

    </div>
  )
}
