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
    ui/           → Button, Card, Avatar, Badge, Input, Modal, Toast, SearchBar, SellerCard
    layout/       → NavBar
  hooks/          → useAuth.jsx (AuthContext + AuthProvider + useAuth)
  lib/
    mockData.js   → MOCK_SELLERS, CATEGORY_GROUPS, ACCENT_COLORS, MOCK_USER
    supabase.js   → stub, activo cuando VITE_MOCK_MODE=false
  views/          → 12 vistas (Home, Login, Register, Booth, SellerPanel, etc.)
  index.css       → tokens CSS + Tailwind directives
App.jsx           → AuthProvider, BrowserRouter, rutas, ProtectedRoute
```

---

## Auth System

- `useAuth()` — expone `{ currentUser, login, logout }`
- App inicia sin autenticar (`currentUser = null`)
- NavBar oculta cuando no hay sesión
- **Rutas públicas:** `/`, `/login`, `/register`, `/seller/:id`
- **Rutas protegidas:** `/sell`, `/chat`, `/chat/:id`, `/profile`, `/transactions`, `/settings`, `/help`, `/onboarding`

---

## Datos Mock

### MOCK_SELLERS — campos clave

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `boothType` | `'services' \| 'catalog' \| 'courses' \| 'hybrid'` | Define el template del Booth |
| `group` | string | ID del grupo de categorías (ej: `'creativos'`) |
| `category` | string | Subcategoría visible (ej: `'UX/UI'`) |
| `badge` | `'hecho-en-cr' \| 'local' \| null` | Badge especial del vendedor |
| `accent` | string | Color de acento del vendor (key de `ACCENT_COLORS`) |
| `cover` | string \| null | URL de imagen de portada del card. Si `null` → gradiente del `accent` |
| `items[]` | array | Servicios, productos o cursos según `boothType` |

### CATEGORY_GROUPS — 6 grupos
`creativos`, `educacion`, `tecnologia`, `moda`, `productos-cr`, `local`

---

## Componentes UI Clave

### SellerCard
- Cover image (h-36) o gradiente del accent cuando no hay imagen
- Badge "Hecho en CR" / "Local" flota sobre el cover
- Avatar `-mt-9` para efecto de profundidad
- Para agregar imagen a un seller: `cover: 'url-de-imagen'` en mockData

### Badge — variants
`verified`, `role`, `category`, `success`, `warning`, `error`, `hecho-en-cr`, `local`

### Booth — 4 templates según `boothType`
- `services` → lista con Contactar
- `catalog` → grid 2 cols con stock + Pedir
- `courses` → lista con nivel/duración + Inscribirse
- `hybrid` → menú/catálogo + sección servicios abajo

---

## Infraestructura

- **GitHub:** `https://github.com/jdzeledonc-droid/elite-Marketplace`
- **Vercel (prod):** `https://elite-market-seven.vercel.app`
- **Figma:** `AP3mfBiEQCRtve451jn06M`

```bash
# Dev
npm run dev -- --host

# Build
npm run build

# Push
git add src/ && git commit -m "mensaje" && git push
```

---

## Pendiente (Sesión 5)

- [ ] Onboarding.jsx → usar CATEGORY_GROUPS
- [ ] SellerPanel.jsx → tab label dinámico por boothType
- [ ] Imágenes de cover mock para demo visual
- [ ] WCAG AA audit — contraste + aria-labels
- [ ] Conectar Vercel auto-deploy con GitHub

## Bloqueado

- Figma Variables API → requiere plan Professional
- Supabase → sin credenciales
