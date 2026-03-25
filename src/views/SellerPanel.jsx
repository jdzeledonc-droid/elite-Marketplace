import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'
import NavBar from '../components/layout/NavBar'
import { MOCK_MY_SELLER } from '../lib/mockData'
import { useAuth } from '../hooks/useAuth'
import { isMockMode, fetchMySellerProfile, updateSellerItems, updateSellerBrand, uploadSellerImage, uploadItemImage, fetchMyLeads } from '../lib/supabase'

// Generate a simple unique id for new items
function newId() {
  return `i${Date.now().toString(36)}`
}

// Returns the initial empty form for a given boothType
function emptyItem(boothType) {
  if (boothType === 'catalog') return { id: newId(), title: '', price: '', image: null, stock: '' }
  if (boothType === 'courses')  return { id: newId(), title: '', price: '', duration: '', level: '', image: null }
  return { id: newId(), title: '', price: '', delivery: '', image: null }  // services / hybrid
}

export default function SellerPanel() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [seller, setSeller] = useState(isMockMode ? MOCK_MY_SELLER : null)
  const [loading, setLoading] = useState(!isMockMode)
  const [activeTab, setActiveTab] = useState('services')
  const [leads, setLeads] = useState([])
  const [leadsLoading, setLeadsLoading] = useState(false)

  // Item modal state
  const [editingItem, setEditingItem]       = useState(null)   // null = closed, object = editing/adding
  const [isNewItem, setIsNewItem]           = useState(false)
  const [itemSaving, setItemSaving]         = useState(false)
  const [itemImageFile, setItemImageFile]   = useState(null)
  const [itemImagePreview, setItemImagePreview] = useState(null)

  // Profile modal state
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm]       = useState({ title: '', tagline: '', cover_url: '' })
  const [profileSaving, setProfileSaving]   = useState(false)

  const BRAND_ACCENT_OPTIONS = [
    { key: 'black',  color: '#000000' },
    { key: 'blue',   color: '#3b82f6' },
    { key: 'green',  color: '#10b981' },
    { key: 'red',    color: '#ef4444' },
    { key: 'yellow', color: '#f59e0b' },
    { key: 'purple', color: '#8b5cf6' },
    { key: 'orange', color: '#f97316' },
    { key: 'teal',   color: '#14b8a6' },
    { key: 'pink',   color: '#ec4899' },
  ]

  const [brandForm, setBrandForm] = useState({
    title: '', tagline: '', bio: '', accent: 'black',
    location: '', instagram: '', whatsapp: '', facebook: '', tiktok: '', website: '',
    keywords: [],
  })
  const [brandAvatarFile, setBrandAvatarFile]         = useState(null)
  const [brandCoverFile, setBrandCoverFile]           = useState(null)
  const [brandAvatarPreview, setBrandAvatarPreview]   = useState(null)
  const [brandCoverPreview, setBrandCoverPreview]     = useState(null)
  const [brandSaving, setBrandSaving]                 = useState(false)
  const [keywordInput, setKeywordInput]               = useState('')
  const [toast, setToast]                             = useState(null)

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

  useEffect(() => {
    if (!seller) return
    setBrandForm({
      title:     seller.title    ?? '',
      tagline:   seller.tagline  ?? '',
      bio:       seller.bio      ?? '',
      accent:    seller.accent   ?? 'black',
      location:  seller.location ?? '',
      instagram: seller.socialLinks?.instagram ?? '',
      whatsapp:  seller.socialLinks?.whatsapp  ?? '',
      facebook:  seller.socialLinks?.facebook  ?? '',
      tiktok:    seller.socialLinks?.tiktok    ?? '',
      website:   seller.socialLinks?.website   ?? '',
      keywords:  seller.keywords ?? [],
    })
  }, [seller])

  useEffect(() => {
    return () => {
      if (brandAvatarPreview) URL.revokeObjectURL(brandAvatarPreview)
      if (brandCoverPreview)  URL.revokeObjectURL(brandCoverPreview)
    }
  }, [brandAvatarPreview, brandCoverPreview])

  const BOOTH_TAB_LABEL = { services: 'Servicios', catalog: 'Productos', courses: 'Cursos', hybrid: 'Catálogo' }

  const TABS = [
    { key: 'services', label: BOOTH_TAB_LABEL[seller?.boothType] ?? 'Servicios' },
    { key: 'leads',    label: 'Contactos' },
    { key: 'stats',    label: 'Estadísticas' },
    { key: 'brand',    label: 'Marca' },
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
    setItemImageFile(null)
    setItemImagePreview(null)
  }

  function closeItemModal() {
    setEditingItem(null)
    setIsNewItem(false)
    if (itemImagePreview) URL.revokeObjectURL(itemImagePreview)
    setItemImageFile(null)
    setItemImagePreview(null)
  }

  function setItemField(field, value) {
    setEditingItem(prev => ({ ...prev, [field]: value }))
  }

  function handleItemImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setItemImagePreview(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file) })
    setItemImageFile(file)
  }

  async function saveItem() {
    if (!editingItem.title.trim() || !editingItem.price.trim()) return
    setItemSaving(true)

    let image = editingItem.image ?? null
    if (itemImageFile) {
      if (!isMockMode) {
        try { image = await uploadItemImage(currentUser.id, editingItem.id, itemImageFile) } catch (_) { /* silent */ }
      } else {
        image = itemImagePreview
      }
    }

    const itemWithImage = { ...editingItem, image }
    let newItems
    if (isNewItem) {
      newItems = [...seller.items, itemWithImage]
    } else {
      newItems = seller.items.map(i => i.id === editingItem.id ? itemWithImage : i)
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
      try {
        await updateSellerBrand(seller.id, {
          title:     profileForm.title,
          tagline:   profileForm.tagline,
          cover_url: profileForm.cover_url,
        })
      } catch (_) { /* silent */ }
    }
    setProfileSaving(false)
  }

  // ── Brand handlers ─────────────────────────────────────────────────────────

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setBrandAvatarPreview(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file) })
    setBrandAvatarFile(file)
  }

  function handleCoverChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setBrandCoverPreview(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file) })
    setBrandCoverFile(file)
  }

  function addKeyword() {
    const kw = keywordInput.trim()
    if (!kw || brandForm.keywords.length >= 10 || brandForm.keywords.includes(kw)) return
    setBrandForm(prev => ({ ...prev, keywords: [...prev.keywords, kw] }))
    setKeywordInput('')
  }

  function removeKeyword(kw) {
    setBrandForm(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }))
  }

  async function saveBrand() {
    setBrandSaving(true)
    try {
      let avatar_url = seller.avatar ?? null
      let cover_url  = seller.cover  ?? null

      if (!isMockMode) {
        if (brandAvatarFile) avatar_url = await uploadSellerImage(currentUser.id, brandAvatarFile, 'avatar')
        if (brandCoverFile)  cover_url  = await uploadSellerImage(currentUser.id, brandCoverFile, 'cover')
      } else {
        if (brandAvatarPreview) avatar_url = brandAvatarPreview
        if (brandCoverPreview)  cover_url  = brandCoverPreview
      }

      const social_links = Object.fromEntries(
        Object.entries({
          instagram: brandForm.instagram,
          whatsapp:  brandForm.whatsapp,
          facebook:  brandForm.facebook,
          tiktok:    brandForm.tiktok,
          website:   brandForm.website,
        }).filter(([, v]) => v.trim())
      )

      if (!isMockMode) {
        await updateSellerBrand(seller.id, {
          title:        brandForm.title,
          tagline:      brandForm.tagline,
          bio:          brandForm.bio      || null,
          location:     brandForm.location || null,
          social_links,
          keywords:     brandForm.keywords,
          avatar_url,
          cover_url,
          accent:       brandForm.accent,
        })
      }

      setSeller(prev => ({
        ...prev,
        title:       brandForm.title,
        tagline:     brandForm.tagline,
        bio:         brandForm.bio      || null,
        accent:      brandForm.accent,
        location:    brandForm.location || null,
        socialLinks: social_links,
        keywords:    brandForm.keywords,
        avatar:      avatar_url,
        cover:       cover_url,
      }))
      setBrandAvatarFile(null)
      setBrandCoverFile(null)
      setBrandAvatarPreview(null)
      setBrandCoverPreview(null)
      setToast({ message: 'Marca actualizada', type: 'success' })
    } catch (err) {
      setToast({ message: err.message ?? 'Error al guardar', type: 'error' })
    } finally {
      setBrandSaving(false)
    }
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
        <p className="text-md font-bold text-[var(--color-text-primary)]">Aún no tienes tienda</p>
        <p className="text-sm text-[var(--color-text-tertiary)]">Completa el registro para crear tu tienda</p>
        <Button variant="primary" onClick={() => navigate('/onboarding')}>Crear mi tienda</Button>
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
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('brand')} aria-label="Editar mi marca">
              Mi Marca
            </Button>
            <Button variant="secondary" size="sm"
              onClick={() => seller && navigate(`/seller/${seller.id}`)}
              disabled={!seller} aria-label="Ver mi tienda pública">
              Ver mi tienda
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
              {leadsLoading ? '…' : `${displayLeads.length} contactos`}
            </p>
            {leadsLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
              </div>
            ) : displayLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-md font-bold text-[var(--color-text-primary)]">Sin contactos aún</p>
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
                { label: 'Visitas a mi tienda', value: '248' },
                { label: 'Contactos recibidos', value: '12'  },
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

        {/* Marca */}
        {activeTab === 'brand' && (
          <section id="tabpanel-brand" role="tabpanel" aria-label="Gestor de marca" className="flex flex-col gap-[var(--space-6)]">

            {/* Identidad Visual */}
            <div>
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-4)]">
                Identidad Visual
              </p>
              <div className="flex gap-[var(--space-4)] items-start mb-[var(--space-5)]">
                {/* Avatar */}
                <label className="cursor-pointer flex-shrink-0" aria-label="Cambiar avatar">
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
                    onChange={handleAvatarChange} />
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[var(--color-bg-tertiary)] border-2 border-dashed border-[var(--color-border-medium)] flex items-center justify-center">
                    {(brandAvatarPreview || seller.avatar) ? (
                      <img src={brandAvatarPreview ?? seller.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                </label>

                {/* Cover */}
                <label className="cursor-pointer flex-1" aria-label="Cambiar cover">
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
                    onChange={handleCoverChange} />
                  <div className="relative h-16 rounded-[var(--radius-xl)] overflow-hidden bg-[var(--color-bg-tertiary)] border-2 border-dashed border-[var(--color-border-medium)] flex items-center justify-center">
                    {(brandCoverPreview || seller.cover) ? (
                      <img src={brandCoverPreview ?? seller.cover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <p className="text-xs text-[var(--color-text-muted)]">Portada</p>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                </label>
              </div>

              {/* Accent color picker */}
              <div className="flex gap-[var(--space-3)]" role="group" aria-label="Color de acento">
                {BRAND_ACCENT_OPTIONS.map(({ key, color }) => (
                  <button key={key} type="button"
                    onClick={() => setBrandForm(prev => ({ ...prev, accent: key }))}
                    aria-label={`Color ${key}`} aria-pressed={brandForm.accent === key}
                    className={['w-7 h-7 rounded-full transition-transform',
                      brandForm.accent === key ? 'scale-125 ring-2 ring-offset-2 ring-[var(--color-text-primary)]' : '',
                    ].join(' ')}
                    style={{ background: color }} />
                ))}
              </div>
            </div>

            {/* Perfil Público */}
            <div className="flex flex-col gap-[var(--space-4)]">
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
                Perfil Público
              </p>
              <Input label="Claim profesional"
                value={brandForm.title}
                onChange={e => setBrandForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: UX Generalist" />
              <Input label="Tagline"
                value={brandForm.tagline}
                onChange={e => setBrandForm(prev => ({ ...prev, tagline: e.target.value }))}
                placeholder="Diseño que convierte visitantes en clientes" />
              <div>
                <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-[var(--space-2)] ml-[var(--space-1)]">
                  Sobre mí
                </p>
                <textarea
                  value={brandForm.bio}
                  onChange={e => { if (e.target.value.length <= 300) setBrandForm(prev => ({ ...prev, bio: e.target.value })) }}
                  placeholder="Cuéntale a los clientes quién eres y qué haces..."
                  rows={3}
                  className="w-full px-[var(--space-4)] py-[var(--space-3)] rounded-[var(--radius-xl)] border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text-primary)] resize-none focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
                <p className="text-2xs text-[var(--color-text-muted)] text-right mt-[var(--space-1)]">
                  {brandForm.bio.length}/300
                </p>
              </div>
            </div>

            {/* Ubicación + Redes */}
            <div className="flex flex-col gap-[var(--space-4)]">
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
                Ubicación + Redes
              </p>
              <Input label="Ciudad / Provincia"
                value={brandForm.location}
                onChange={e => setBrandForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="San José, Costa Rica" />
              {[
                { key: 'instagram', label: 'Instagram', placeholder: '@usuario' },
                { key: 'whatsapp',  label: 'WhatsApp',  placeholder: '+50688888888' },
                { key: 'facebook',  label: 'Facebook',  placeholder: 'usuario o URL' },
                { key: 'tiktok',    label: 'TikTok',    placeholder: '@usuario' },
                { key: 'website',   label: 'Sitio web', placeholder: 'https://...' },
              ].map(({ key, label, placeholder }) => (
                <Input key={key} label={label}
                  value={brandForm[key]}
                  onChange={e => setBrandForm(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder} />
              ))}
            </div>

            {/* Keywords SEO */}
            <div>
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-[var(--space-3)]">
                Keywords SEO
                <span className="normal-case font-normal ml-[var(--space-2)]">({brandForm.keywords.length}/10)</span>
              </p>
              <div className="flex gap-[var(--space-2)] mb-[var(--space-3)]">
                <input
                  value={keywordInput}
                  onChange={e => setKeywordInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword() } }}
                  placeholder="Ej: diseño web"
                  className="flex-1 px-[var(--space-4)] py-[var(--space-3)] rounded-[var(--radius-xl)] border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  disabled={brandForm.keywords.length >= 10}
                />
                <button type="button" onClick={addKeyword}
                  disabled={!keywordInput.trim() || brandForm.keywords.length >= 10}
                  className="px-[var(--space-4)] py-[var(--space-3)] rounded-[var(--radius-xl)] bg-[var(--color-bg-tertiary)] text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-border-medium)] transition-colors disabled:opacity-40">
                  + Añadir
                </button>
              </div>
              {brandForm.keywords.length > 0 && (
                <div className="flex flex-wrap gap-[var(--space-2)]">
                  {brandForm.keywords.map(kw => (
                    <button key={kw} type="button" onClick={() => removeKeyword(kw)}
                      className="flex items-center gap-[var(--space-1)] px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border-light)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-error)]/10 hover:border-[var(--color-error)]/30 hover:text-[var(--color-error)] transition-colors"
                      aria-label={`Eliminar keyword ${kw}`}>
                      {kw}
                      <span aria-hidden="true" className="text-xs opacity-60">×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Guardar */}
            <Button variant="primary" className="w-full" onClick={saveBrand} disabled={brandSaving}>
              {brandSaving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </section>
        )}
      </main>

      <NavBar />

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

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

            {/* Imagen opcional */}
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-[var(--space-2)] ml-[var(--space-1)]">
                Imagen (opcional)
              </p>
              <label className="cursor-pointer block" aria-label="Subir imagen">
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
                  onChange={handleItemImageChange} />
                <div className="relative h-28 rounded-[var(--radius-xl)] overflow-hidden bg-[var(--color-bg-tertiary)] border-2 border-dashed border-[var(--color-border-medium)] flex items-center justify-center">
                  {(itemImagePreview || editingItem.image) ? (
                    <img src={itemImagePreview ?? editingItem.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-[var(--space-2)]">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                          stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="text-xs text-[var(--color-text-muted)]">Toca para subir imagen</p>
                    </div>
                  )}
                  {(itemImagePreview || editingItem.image) && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-bold">Cambiar imagen</p>
                    </div>
                  )}
                </div>
              </label>
            </div>

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
