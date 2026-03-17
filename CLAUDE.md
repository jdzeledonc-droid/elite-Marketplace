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
- **Siempre leer el archivo** antes de editarlo
- **No crear archivos nuevos** salvo que sea estrictamente necesario
- **No agregar comentarios** en código que no se modifica
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
`verified`, `role`, `category`, `success`, `warning`, `error`, `hecho-en-cr`, `local`

### Booth — 4 templates por `boothType`
- `services` → lista con Contactar
- `catalog` → grid 2 cols con stock + Pedir
- `courses` → lista con nivel/duración + Inscribirse
- `hybrid` → menú/catálogo + sección servicios abajo

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

## Pendiente — Sesión 6+

### Fase 5 — Backend (requiere credenciales Supabase)
- Activar auth real (`supabase.auth.signUp` / `signIn`)
- Reemplazar mock data con queries reales
- RLS fixes en `supabase-schema.sql`

### Fase 6 — Figma (requiere plan Professional)
- Script listo: `elite-market-mvp/create-figma-variables.js`

### Features v2
- Pagos, notificaciones push, reviews reales, verificación de vendedores
- Imágenes reales de productos (hoy usan picsum placeholder)
