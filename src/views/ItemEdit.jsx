import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import NavBar from '../components/layout/NavBar'
import { useAuth } from '../hooks/useAuth'
import { isMockMode, updateSellerItems, uploadItemImage } from '../lib/supabase'

function newId() {
  return `i${Date.now().toString(36)}`
}

function emptyItem(boothType) {
  if (boothType === 'catalog') return { id: newId(), title: '', price: '', image: null, stock: '' }
  if (boothType === 'courses')  return { id: newId(), title: '', price: '', duration: '', level: '', image: null }
  return { id: newId(), title: '', price: '', delivery: '', image: null }
}

export default function ItemEdit() {
  const navigate    = useNavigate()
  const location    = useLocation()
  const { itemId }  = useParams()
  const { currentUser } = useAuth()

  const seller = location.state?.seller
  const isNew  = itemId === 'new'

  const [form, setForm] = useState(() =>
    isNew ? emptyItem(seller?.boothType) : { ...(location.state?.item ?? emptyItem(seller?.boothType)) }
  )
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving]             = useState(false)
  const [toast, setToast]               = useState(null)

  const isServices = seller?.boothType === 'services' || seller?.boothType === 'hybrid'
  const isCatalog  = seller?.boothType === 'catalog'
  const isCourses  = seller?.boothType === 'courses'

  const BOOTH_LABEL = { services: 'Servicio', catalog: 'Producto', courses: 'Curso', hybrid: 'Ítem' }
  const label = BOOTH_LABEL[seller?.boothType] ?? 'Ítem'

  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview) }
  }, [imagePreview])

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagePreview(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file) })
    setImageFile(file)
  }

  function setField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function save() {
    if (!form.title.trim() || !form.price.trim()) return
    setSaving(true)
    try {
      let image = form.image ?? null
      if (imageFile) {
        if (!isMockMode) {
          try { image = await uploadItemImage(currentUser.id, form.id, imageFile) } catch (_) {}
        } else {
          image = imagePreview
        }
      }

      const updatedItem = { ...form, image }
      const currentItems = seller.items ?? []
      const newItems = isNew
        ? [...currentItems, updatedItem]
        : currentItems.map(i => i.id === form.id ? updatedItem : i)

      if (!isMockMode) {
        await updateSellerItems(seller.id, newItems)
      }

      navigate('/sell', { replace: true, state: { updatedItems: newItems } })
    } catch (err) {
      setToast({ message: err.message ?? 'Error al guardar', type: 'error' })
      setSaving(false)
    }
  }

  async function deleteItem() {
    const newItems = (seller.items ?? []).filter(i => i.id !== form.id)
    if (!isMockMode) {
      try { await updateSellerItems(seller.id, newItems) } catch (_) {}
    }
    navigate('/sell', { replace: true, state: { updatedItems: newItems } })
  }

  if (!seller) {
    navigate('/sell', { replace: true })
    return null
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <header className="px-[var(--space-6)] pt-[var(--space-8)] pb-[var(--space-5)] border-b border-[var(--color-border-light)]">
        <div className="flex items-center gap-[var(--space-3)]">
          <button
            onClick={() => navigate('/sell')}
            aria-label="Volver al panel"
            className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] border border-[var(--color-stroke)] flex items-center justify-center text-[var(--color-text-secondary)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-md font-black text-[var(--color-text-primary)]">
            {isNew ? `Nuevo ${label}` : `Editar ${label}`}
          </h1>
        </div>
      </header>

      <main className="flex-1 px-[var(--space-6)] py-[var(--space-6)] pb-32 flex flex-col gap-[var(--space-5)]">

        <Input
          label="Título"
          value={form.title}
          onChange={e => setField('title', e.target.value)}
          placeholder={isCatalog ? 'Ej: Blusa Bordada Tropical' : isCourses ? 'Ej: Diseño Gráfico Básico' : 'Ej: Diseño de App Móvil'}
        />

        <Input
          label="Precio"
          value={form.price}
          onChange={e => setField('price', e.target.value)}
          placeholder={isCatalog ? 'Ej: ₡18,000' : 'Ej: Desde $800 USD'}
        />

        {isServices && (
          <Input
            label="Entrega"
            value={form.delivery ?? ''}
            onChange={e => setField('delivery', e.target.value)}
            placeholder="Ej: 7 días"
          />
        )}

        {isCatalog && (
          <Input
            label="Stock"
            type="number"
            value={form.stock ?? ''}
            onChange={e => setField('stock', e.target.value)}
            placeholder="Ej: 10"
          />
        )}

        {isCourses && (
          <>
            <Input
              label="Duración"
              value={form.duration ?? ''}
              onChange={e => setField('duration', e.target.value)}
              placeholder="Ej: 8 horas"
            />
            <Input
              label="Nivel"
              value={form.level ?? ''}
              onChange={e => setField('level', e.target.value)}
              placeholder="Ej: Principiante"
            />
          </>
        )}

        {/* Imagen */}
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-[var(--space-2)] ml-[var(--space-1)]">
            Imagen (opcional)
          </p>
          <label className="cursor-pointer block" aria-label="Subir imagen">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleImageChange}
            />
            <div className="relative h-44 rounded-[var(--radius-xl)] overflow-hidden bg-[var(--color-bg-tertiary)] border-2 border-dashed border-[var(--color-border-medium)] flex items-center justify-center">
              {(imagePreview || form.image) ? (
                <img src={imagePreview ?? form.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-[var(--space-2)]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                      stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-xs text-[var(--color-text-muted)]">Toca para subir imagen</p>
                  <p className="text-2xs text-[var(--color-text-muted)] opacity-70">JPG, PNG o WebP · máx 5 MB</p>
                </div>
              )}
              {(imagePreview || form.image) && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-bold">Cambiar imagen</p>
                </div>
              )}
            </div>
          </label>
        </div>

        <Button
          variant="primary"
          className="w-full mt-[var(--space-2)]"
          onClick={save}
          disabled={saving || !form.title.trim() || !form.price.trim()}
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>

        {!isNew && (
          <button
            onClick={deleteItem}
            className="w-full py-[var(--space-3)] text-sm font-bold text-[var(--color-error)] hover:opacity-70 transition-opacity"
          >
            Eliminar
          </button>
        )}
      </main>

      <NavBar />
    </div>
  )
}
