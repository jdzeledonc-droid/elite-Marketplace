# Gestor de Marca — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tab "Marca" en SellerPanel para gestionar identidad visual, perfil público, ubicación, redes sociales y keywords SEO; display público en Booth y SellerCard.

**Architecture:** DB migration añade 4 columnas a `sellers`. Supabase Storage bucket `seller-media` para subida real de imágenes con RLS. `supabase.js` expone `uploadSellerImage` y `updateSellerBrand`. SellerPanel gana un tab "Marca" con 4 secciones en scroll. Booth y SellerCard renderizan los nuevos campos de forma condicional.

**Tech Stack:** React 19, Supabase JS client, Supabase MCP (apply_migration), isMockMode toggle, CSS Custom Properties (var(--*))

**Spec:** `docs/superpowers/specs/2026-03-24-gestor-de-marca-design.md`
**Jira:** Epic KAN-92, Tasks KAN-93–KAN-98

---

## File Map

| Archivo | Acción | Responsabilidad |
|---------|--------|-----------------|
| Supabase MCP | `apply_migration` | Columnas DB + bucket Storage + RLS |
| `src/lib/supabase.js` | Modificar | `uploadSellerImage`, `updateSellerBrand`, `normalizeSeller` actualizado, eliminar `updateSellerProfile` |
| `src/views/SellerPanel.jsx` | Modificar | Tab "Marca" con estado de marca, handlers, JSX completo |
| `src/views/Booth.jsx` | Modificar | Componente `BrandSection` + integración en las 4 templates |
| `src/components/ui/SellerCard.jsx` | Modificar | Location tag opcional |

---

## Task 1: DB Migration + Supabase Storage

**Files:**
- Apply via: `mcp__plugin_supabase_supabase__apply_migration` (project_id: `hqsevvdabrsumbbyzpha`)

### Contexto

La tabla `sellers` no tiene campos para bio, ubicación, redes sociales ni keywords. El bucket de Storage tampoco existe aún.

- [ ] **Step 1: Aplicar migration**

Migration name: `add_brand_fields_to_sellers`

```sql
-- Nuevas columnas en sellers
ALTER TABLE sellers
  ADD COLUMN IF NOT EXISTS bio          text,
  ADD COLUMN IF NOT EXISTS location     text,
  ADD COLUMN IF NOT EXISTS social_links jsonb  DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS keywords     text[] DEFAULT '{}'::text[];

-- Bucket seller-media (público para lectura)
INSERT INTO storage.buckets (id, name, public)
VALUES ('seller-media', 'seller-media', true)
ON CONFLICT (id) DO NOTHING;

-- Política: lectura pública de cualquier objeto
CREATE POLICY IF NOT EXISTS "public_read_seller_media"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'seller-media');

-- Política: solo el seller autenticado puede subir a su carpeta
CREATE POLICY IF NOT EXISTS "seller_upload_own_media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'seller-media' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Política: el seller puede actualizar su propia media
CREATE POLICY IF NOT EXISTS "seller_update_own_media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'seller-media' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Política: el seller puede eliminar su propia media
CREATE POLICY IF NOT EXISTS "seller_delete_own_media"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'seller-media' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );
```

- [ ] **Step 2: Verificar columnas**

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'sellers'
  AND column_name IN ('bio', 'location', 'social_links', 'keywords');
```

Expected: 4 filas.

- [ ] **Step 3: Verificar bucket**

```sql
SELECT id, name, public FROM storage.buckets WHERE id = 'seller-media';
```

Expected: 1 fila con `public = true`.

---

## Task 2: `supabase.js` — uploadSellerImage, updateSellerBrand, normalizeSeller

**Files:**
- Modify: `src/lib/supabase.js`

### Contexto

`normalizeSeller()` no mapea los 4 campos nuevos. `updateSellerProfile` será reemplazada por `updateSellerBrand`. No existe aún `uploadSellerImage`.

- [ ] **Step 1: Actualizar `normalizeSeller`**

Cambiar (añadir 4 líneas dentro del return del objeto):

```js
// Antes: (al final de normalizeSeller, después de services)
  items:       row.items   ?? [],
  services:    row.services ?? [],
}
```

Por:

```js
  items:       row.items       ?? [],
  services:    row.services    ?? [],
  bio:         row.bio         ?? null,
  location:    row.location    ?? null,
  socialLinks: row.social_links ?? {},
  keywords:    row.keywords    ?? [],
}
```

- [ ] **Step 2: Reemplazar `updateSellerProfile` por `updateSellerBrand`**

Eliminar la función `updateSellerProfile` existente:

```js
export async function updateSellerProfile(sellerId, { title, tagline, cover_url }) {
  const { error } = await supabase
    .from('sellers')
    .update({ title, tagline, cover_url })
    .eq('id', sellerId)
  if (error) throw error
}
```

Reemplazar por:

```js
export async function updateSellerBrand(sellerId, {
  title, tagline, bio, location, social_links, keywords,
  avatar_url, cover_url, accent,
}) {
  const { error } = await supabase
    .from('sellers')
    .update({ title, tagline, bio, location, social_links, keywords, avatar_url, cover_url, accent })
    .eq('id', sellerId)
  if (error) throw error
}
```

- [ ] **Step 3: Añadir `uploadSellerImage` antes de `updateSellerBrand`**

```js
export async function uploadSellerImage(profileId, file, type) {
  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
  const MAX_SIZE = 5 * 1024 * 1024
  if (!ACCEPTED.includes(file.type)) throw new Error('Formato no permitido. Usa JPG, PNG o WebP.')
  if (file.size > MAX_SIZE) throw new Error('La imagen es muy grande. Máximo 5 MB.')
  const ext = file.name.split('.').pop().toLowerCase() || 'jpg'
  const path = `${type}s/${profileId}/${type}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('seller-media')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from('seller-media').getPublicUrl(path)
  return data.publicUrl
}
```

- [ ] **Step 4: Verificar build limpio**

```bash
cd /c/Users/jdzel/elite-market && npm run build 2>&1 | tail -5
```

Expected: `✓ built in ...`

- [ ] **Step 5: Commit**

```bash
cd /c/Users/jdzel/elite-market
git add src/lib/supabase.js
git commit -m "feat: add uploadSellerImage, updateSellerBrand, normalize brand fields

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 3: SellerPanel — Tab "Marca"

**Files:**
- Modify: `src/views/SellerPanel.jsx`

### Contexto

El archivo tiene 453 líneas. Los imports están en la línea 1–11. Hay tabs en `TABS` (líneas 62–66). La función `saveProfile` llama a `updateSellerProfile` (reemplazar por `updateSellerBrand`). Se añade el tab "Marca" como 4ª opción.

- [ ] **Step 1: Actualizar imports**

Cambiar línea 11:

```js
import { isMockMode, fetchMySellerProfile, updateSellerItems, updateSellerProfile, fetchMyLeads } from '../lib/supabase'
```

Por:

```js
import { isMockMode, fetchMySellerProfile, updateSellerItems, updateSellerBrand, uploadSellerImage, fetchMyLeads } from '../lib/supabase'
import Toast from '../components/ui/Toast'
```

- [ ] **Step 2: Añadir constante de accents y estado del tab Marca**

Después de la línea `const [profileSaving, setProfileSaving] = useState(false)` (línea ~43), añadir:

```js
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
```

- [ ] **Step 3: Añadir useEffect para sync seller → brandForm**

Después del segundo `useEffect` (el de leads, línea ~58), añadir:

```js
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
```

- [ ] **Step 4: Añadir tab "Marca" a TABS**

Cambiar el array TABS (líneas 62–66):

```js
const TABS = [
  { key: 'services', label: BOOTH_TAB_LABEL[seller?.boothType] ?? 'Servicios' },
  { key: 'leads',    label: 'Leads' },
  { key: 'stats',    label: 'Stats' },
]
```

Por:

```js
const TABS = [
  { key: 'services', label: BOOTH_TAB_LABEL[seller?.boothType] ?? 'Servicios' },
  { key: 'leads',    label: 'Leads' },
  { key: 'stats',    label: 'Stats' },
  { key: 'brand',    label: 'Marca' },
]
```

- [ ] **Step 5: Actualizar `saveProfile` para usar `updateSellerBrand`**

Cambiar dentro de `saveProfile`:

```js
if (!isMockMode) {
  try { await updateSellerProfile(seller.id, profileForm) } catch (_) { /* silent */ }
}
```

Por:

```js
if (!isMockMode) {
  try {
    await updateSellerBrand(seller.id, {
      title:     profileForm.title,
      tagline:   profileForm.tagline,
      cover_url: profileForm.cover_url,
    })
  } catch (_) { /* silent */ }
}
```

- [ ] **Step 6: Añadir handlers de brand después de los profile handlers**

Después de `async function saveProfile() { ... }` (línea ~161), añadir:

```js
// ── Brand handlers ─────────────────────────────────────────────────────────

function handleAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  setBrandAvatarFile(file)
  setBrandAvatarPreview(URL.createObjectURL(file))
}

function handleCoverChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  setBrandCoverFile(file)
  setBrandCoverPreview(URL.createObjectURL(file))
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
    setToast({ message: 'Marca actualizada', type: 'success' })
  } catch (err) {
    setToast({ message: err.message ?? 'Error al guardar', type: 'error' })
  } finally {
    setBrandSaving(false)
  }
}
```

- [ ] **Step 7: Añadir tab panel "Marca" en el JSX**

Dentro de `<main className="flex-1 ...">`, después del cierre del `{activeTab === 'stats' && ...}` block (antes del cierre `</main>`), añadir:

```jsx
{/* Marca */}
{activeTab === 'brand' && (
  <section id="tabpanel-brand" role="tabpanel" aria-label="Gestor de marca" className="animate-fade-in flex flex-col gap-[var(--space-6)]">

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
```

- [ ] **Step 8: Añadir `<Toast>` al final del return, antes de los modales**

Justo antes de `{/* ── Item modal ... */}`, añadir:

```jsx
<Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
```

- [ ] **Step 9: Verificar build limpio**

```bash
cd /c/Users/jdzel/elite-market && npm run build 2>&1 | tail -5
```

Expected: `✓ built in ...`

- [ ] **Step 10: Commit**

```bash
cd /c/Users/jdzel/elite-market
git add src/views/SellerPanel.jsx
git commit -m "feat: add Marca tab to SellerPanel with brand editor

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 4: Booth.jsx — BrandSection + display público

**Files:**
- Modify: `src/views/Booth.jsx`

### Contexto

Booth.jsx tiene 4 templates: `ServicesBooth` (dark bg, línea ~109), `CatalogBooth` (light bg, línea ~276), `CoursesBooth` (light bg, línea ~450 aprox.), `HybridBooth` (accent bg, línea ~600 aprox.). El tagline de cada template es el punto de inserción. ServicesBooth tiene un fondo oscuro — el `BrandSection` recibe un prop `dark` para ajustar colores.

- [ ] **Step 1: Añadir componente `BrandSection` y SVG icons después de las otras funciones helper (antes de `ServicesBooth`)**

Añadir después de la función `IcoUsers` (línea ~55) y antes del comentario `/* ── Shared back button ── */`:

```jsx
/* ── Social link icons ──────────────────────────────────────────────────── */
const IcoInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
  </svg>
)
const IcoWhatsApp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
)
const IcoFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
)
const IcoTikTok = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoGlobe = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
)

/* ── Brand section (bio + location + social links) ──────────────────────── */
function BrandSection({ seller, dark = false }) {
  const links = seller.socialLinks ?? {}
  const textColor = dark ? 'rgba(255,255,255,0.55)' : 'var(--color-text-secondary)'
  const iconColor = dark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)'

  const socialEntries = [
    links.instagram && { href: `https://instagram.com/${links.instagram.replace('@', '')}`, icon: <IcoInstagram />, label: 'Instagram' },
    links.whatsapp  && { href: `https://wa.me/${links.whatsapp.replace(/[^0-9]/g, '')}`,    icon: <IcoWhatsApp />,  label: 'WhatsApp'  },
    links.facebook  && { href: links.facebook.startsWith('http') ? links.facebook : `https://facebook.com/${links.facebook}`, icon: <IcoFacebook />, label: 'Facebook' },
    links.tiktok    && { href: `https://tiktok.com/${links.tiktok.startsWith('@') ? links.tiktok : '@' + links.tiktok}`, icon: <IcoTikTok />, label: 'TikTok' },
    links.website   && { href: links.website, icon: <IcoGlobe />, label: 'Sitio web' },
  ].filter(Boolean)

  if (!seller.bio && !seller.location && !socialEntries.length) return null

  return (
    <div className="mb-[var(--space-6)]">
      {seller.bio && (
        <p className="text-base leading-relaxed mb-[var(--space-3)]" style={{ color: textColor }}>
          {seller.bio}
        </p>
      )}
      {seller.location && (
        <p className="text-xs font-semibold mb-[var(--space-4)]" style={{ color: textColor }}>
          📍 {seller.location}
        </p>
      )}
      {socialEntries.length > 0 && (
        <div className="flex gap-[var(--space-5)]" aria-label="Redes sociales">
          {socialEntries.map(({ href, icon, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              aria-label={label} style={{ color: iconColor }}
              className="hover:opacity-70 transition-opacity">
              {icon}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Insertar `<BrandSection>` en `ServicesBooth` (dark template)**

En `ServicesBooth`, localizar el bloque de badges (línea ~171–176):

```jsx
{/* Badges row */}
<div className="flex gap-[var(--space-2)] flex-wrap mb-[var(--space-8)]">
  {seller.is_verified && <Badge variant="verified">Verificado</Badge>}
  {seller.badge === 'local' && <Badge variant="local">📍 Local</Badge>}
  {seller.badge === 'hecho-en-cr' && <Badge variant="hecho-en-cr">🇨🇷 Hecho en CR</Badge>}
</div>
```

Cambiar el `mb-[var(--space-8)]` a `mb-[var(--space-5)]` y añadir `<BrandSection>` después:

```jsx
{/* Badges row */}
<div className="flex gap-[var(--space-2)] flex-wrap mb-[var(--space-5)]">
  {seller.is_verified && <Badge variant="verified">Verificado</Badge>}
  {seller.badge === 'local' && <Badge variant="local">📍 Local</Badge>}
  {seller.badge === 'hecho-en-cr' && <Badge variant="hecho-en-cr">🇨🇷 Hecho en CR</Badge>}
</div>

<BrandSection seller={seller} dark />
```

- [ ] **Step 3: Insertar `<BrandSection>` en `CatalogBooth`, `CoursesBooth` y `HybridBooth`**

Buscar en Booth.jsx las 3 ocurrencias restantes de `{seller.tagline}` (ya se hizo la de ServicesBooth en el step anterior). Hay exactamente 3 más:

- **CatalogBooth** (~línea 499): `<p className="text-base text-[var(--color-text-secondary)] ...">{seller.tagline}</p>`
- **CoursesBooth** (~línea 654): `<p className="...">{seller.tagline}</p>` dentro del container principal
- **HybridBooth** (~otra línea): similar patrón

En cada una, añadir `<BrandSection seller={seller} />` justo después del cierre `</p>` del tagline:

```jsx
<p className="text-base text-[var(--color-text-secondary)] leading-relaxed mb-[var(--space-6)]">
  {seller.tagline}
</p>

<BrandSection seller={seller} />
```

No pasar el prop `dark` (estas 3 templates tienen fondo claro — el componente usa colores de texto por defecto).

- [ ] **Step 4: Verificar build limpio**

```bash
cd /c/Users/jdzel/elite-market && npm run build 2>&1 | tail -5
```

Expected: `✓ built in ...`

- [ ] **Step 5: Commit**

```bash
cd /c/Users/jdzel/elite-market
git add src/views/Booth.jsx
git commit -m "feat: add BrandSection to Booth — bio, location, social links

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 5: SellerCard — location tag opcional

**Files:**
- Modify: `src/components/ui/SellerCard.jsx`

### Contexto

`SellerCard.jsx` tiene 107 líneas. La Badge de categoría está en la línea ~66–68. El location tag debe aparecer justo debajo de esa Badge, solo si `seller.location` está definido.

- [ ] **Step 1: Añadir location tag en SellerCard**

Localizar (línea ~66):

```jsx
<Badge variant="category" className="mt-[var(--space-1)]">
  {seller.category}
</Badge>
```

Añadir después del cierre de `</Badge>`:

```jsx
{seller.location && (
  <p className="text-2xs text-[var(--color-text-muted)] mt-[var(--space-1)]">
    · {seller.location.split(',')[0]}
  </p>
)}
```

- [ ] **Step 2: Verificar build limpio**

```bash
cd /c/Users/jdzel/elite-market && npm run build 2>&1 | tail -5
```

Expected: `✓ built in ...`

- [ ] **Step 3: Commit**

```bash
cd /c/Users/jdzel/elite-market
git add src/components/ui/SellerCard.jsx
git commit -m "feat: show optional location tag in SellerCard

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 6: Push + deploy

- [ ] **Step 1: Push a Vercel (auto-deploy)**

```bash
cd /c/Users/jdzel/elite-market && git push
```

Expected: auto-deploy activo en Vercel → `https://elite-market-seven.vercel.app`

---

## Notas de implementación

- `seller.socialLinks` viene de `normalizeSeller` que mapea `row.social_links ?? {}` — nunca es `null`, siempre es un objeto
- En mock mode, `uploadSellerImage` no se llama — se usa `URL.createObjectURL(file)` como preview local. El cambio no persiste entre sesiones en mock mode, lo cual es correcto.
- `BrandSection` retorna `null` si todos los campos están vacíos — no rompe el layout de sellers existentes
- La `location` en SellerCard usa `.split(',')[0]` para mostrar solo ciudad, sin provincia, para no romper el layout de la card en pantallas pequeñas
- La migration usa `CREATE POLICY IF NOT EXISTS` para ser re-ejecutable sin error
- `updateSellerProfile` es eliminada de supabase.js; cualquier importación fuera de SellerPanel debe actualizarse (actualmente solo SellerPanel la usa)
