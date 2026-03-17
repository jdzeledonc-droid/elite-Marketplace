# EliteMarket — Claude Code Instructions

Marketplace mobile-first para vendedores informales de Costa Rica.
Siempre leer este archivo antes de tocar cualquier código.

---

## Stack

- **React 19 + Vite 8**, React Router v6
- **Tailwind CSS v3 + PostCSS** (NO `@tailwindcss/vite` — incompatible con Vite 8)
- **CSS Custom Properties** — todos los tokens en `src/index.css`
- **AuthContext** — `src/hooks/useAuth.jsx`
- **Mock mode** — `VITE_MOCK_MODE=true` en `.env`

---

## Reglas de Código

- **Nunca hardcodear** colores, espaciados, radios ni sombras — siempre `var(--*)`
- **NUNCA usar `text-[var(--text-*)]`** — Tailwind no resuelve CSS vars en clases arbitrarias de fontSize. Usar siempre el token directo: `text-2xs`, `text-xs`, `text-sm`, `text-base`, `text-md`, `text-lg`, `text-xl`, `text-2xl`, etc.
- **Siempre leer el archivo** antes de editarlo
- **No crear archivos nuevos** salvo que sea estrictamente necesario
- **No agregar comentarios** en código que no se modifica
- **ScrollToTop** ya está en `App.jsx` — no agregar `window.scrollTo` en vistas individuales
- Idioma del código: **inglés** (variables, funciones, JSX). Texto en UI: **español**

---

## Estructura de Archivos

```
src/
  components/
    ui/       → Button, Card, Avatar, Badge, Input, Modal, Toast, SearchBar, SellerCard
    layout/   → NavBar
  hooks/      → useAuth.jsx (AuthContext + AuthProvider + useAuth)
  lib/
    mockData.js   → MOCK_SELLERS, CATEGORY_GROUPS, ACCENT_COLORS, MOCK_USER
    supabase.js   → stub, activo cuando VITE_MOCK_MODE=false
  views/      → 12 vistas (Home, Login, Register, Booth, SellerPanel, Onboarding, etc.)
  index.css   → tokens CSS + Tailwind directives
App.jsx       → AuthProvider, BrowserRouter, rutas, ProtectedRoute
```

---

## Auth System

- `useAuth()` — expone `{ currentUser, login, logout }`
- App inicia sin autenticar (`currentUser = null`)
- NavBar oculta cuando no hay sesión (`if (!currentUser) return null`)
- **Rutas públicas:** `/`, `/login`, `/register`, `/seller/:id`
- **Rutas protegidas:** `/sell`, `/chat`, `/chat/:id`, `/profile`, `/transactions`, `/settings`, `/help`, `/onboarding`

---

## Datos Mock — MOCK_SELLERS campos clave

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `title` | string | Claim profesional del seller ("UX Generalist", "Moda Artesanal Tropical"). Focal point del hero y la card |
| `boothType` | `'services' \| 'catalog' \| 'courses' \| 'hybrid'` | Define el template del Booth |
| `group` | string | ID del grupo (`'creativos'`, `'educacion'`, etc.) |
| `category` | string | Subcategoría visible (`'UX/UI'`, `'Alimentos'`, etc.) |
| `badge` | `'hecho-en-cr' \| 'local' \| null` | Badge especial del vendedor |
| `accent` | string | Key de `ACCENT_COLORS` (black/blue/green/red/yellow/purple/orange/teal/pink) |
| `cover` | string \| null | URL imagen de portada. Si `null` → gradiente del accent |
| `items[]` | array | Servicios/productos/cursos según `boothType` |

### CATEGORY_GROUPS — 6 grupos
`creativos`, `educacion`, `tecnologia`, `moda`, `productos-cr`, `local`

---

## Componentes UI Clave

### SellerCard
- Cover image (h-36) o gradiente accent cuando `seller.cover` es null
- Badge "Hecho en CR" / "Local" sobre el cover (esquina superior derecha)
- Avatar `-mt-9` para efecto de profundidad sobre el cover
- Keyboard accessible: `tabIndex`, `role="button"`, `onKeyDown`, `focus-visible`

### Badge — variants
`verified`, `role`, `category`, `success`, `warning`, `error`, `hecho-en-cr`, `local`, `level`
- Todas las variantes: fondo pastel + `text-primary` (#0f172a). Base: `text-2xs leading-[21px] tracking-[3.5px] px-4 py-1`

### Booth — 4 templates por `boothType`
- Hero h-56: `seller.cover` como background + gradient overlay de `accent.bg`
- Accent color en: CTAs (`AccentButton`), stats values, price chips, border-left cards, section dots
- `services` → cards con `border-left: 3px solid accent`, price en pill accent, Contactar
- `catalog` → grid 2 cols, picsum image por item (`seed=item.id`), overlay "Agotado"/"Últimas N!", Pedir
- `courses` → hero h-56 + container blanco sin overlap (`pt-12`, sin `-mt-*`). Avatar dentro del container, NO con margen negativo. Nivel badge usa `variant="level"`
- `hybrid` → marca artesanal/emergente: grid productos con precio en image overlay, sección "También ofrecemos" para talleres/encargos con top strip accent. NO restaurantes/delivery
- Floating button fijo `bottom-[84px] right` con `IconChat` en accent color

### Onboarding — Step 0
- Grupo chips (nivel 1) → subcategoría buttons (nivel 2) usando `CATEGORY_GROUPS`
- 9 colores de acento en step 1

### SellerPanel
- Tab label dinámico: `{ services:'Servicios', catalog:'Productos', courses:'Cursos', hybrid:'Catálogo' }`

---

## Infraestructura

- **GitHub:** `https://github.com/jdzeledonc-droid/elite-Marketplace`
- **Vercel (prod):** `https://elite-market-seven.vercel.app`
- **Auto-deploy:** ✅ activo — cada push a master despliega automáticamente
- **Figma:** `AP3mfBiEQCRtve451jn06M`

```bash
# Dev
npm run dev -- --host

# Build
npm run build

# Push (auto-despliega)
git add <archivos> && git commit -m "mensaje" && git push
```

---

## Backend — Estado Actual ✅

### Supabase (VITE_MOCK_MODE=false)
- Auth real activo: `signIn`, `signUp`, `signOut` via `useAuth`
- Migrations aplicadas:
  - `001_init_with_fixes.sql` — profiles, leads, transactions + trigger auto-create profile + RLS
  - `002_sellers.sql` — tabla sellers + RLS + 10 seed sellers
- `normalizeSeller()` en `supabase.js` — mapea snake_case DB → camelCase app
- `fetchMySellerProfile(profileId)` — busca seller por `profile_id = auth.uid()`
- Onboarding guarda seller con `supabase.from('sellers').insert(...)` al finalizar
- Infiere `booth_type` del grupo: `educacion→courses`, `moda/productos-cr→catalog`, `local→hybrid`, resto→`services`

### Pendiente v2
- Editar servicios (botón "Editar" en SellerPanel no funciona aún)
- Editar cover/avatar/tagline del seller
- Leads y transacciones reales

### Fase Figma (requiere plan Professional)
- Script listo: `elite-market-mvp/create-figma-variables.js`
