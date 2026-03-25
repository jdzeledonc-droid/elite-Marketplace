# Gestor de Marca — Design Spec

> **Status:** Approved — ready for implementation planning
> **Date:** 2026-03-24
> **Feature:** Brand Manager tab in SellerPanel + public display in Booth & SellerCard

---

## Goal

Allow sellers to manage their complete brand identity from a dedicated "Marca" tab in SellerPanel: visual identity (avatar, cover, accent color), public profile (title, tagline, bio), discoverability (location, social links, SEO keywords). Brand data is then displayed publicly in the seller's Booth and optionally in SellerCards.

## Approach

Full feature in one phase: DB migration + Supabase Storage setup + brand editor UI + public display updates. Phased approach was discarded because sellers have no incentive to fill in brand data if it doesn't appear publicly.

---

## Architecture

### 1. Database Migration — `add_brand_fields_to_sellers`

```sql
ALTER TABLE sellers
  ADD COLUMN IF NOT EXISTS bio          text,
  ADD COLUMN IF NOT EXISTS location     text,
  ADD COLUMN IF NOT EXISTS social_links jsonb  DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS keywords     text[] DEFAULT '{}'::text[];
```

All columns nullable — no breaking changes to existing seller rows.

### 2. Supabase Storage

**Bucket:** `seller-media` (public read, authenticated write)

**Folder structure:**
- `avatars/{profile_id}/avatar.{ext}` — seller avatar/logo
- `covers/{profile_id}/cover.{ext}` — booth cover photo

**RLS policy:** seller can only upload/delete within their own `{profile_id}/` subfolder.

**Validation (client-side before upload):**
- Accepted types: `image/jpeg`, `image/png`, `image/webp`
- Max size: 5 MB
- Error shown inline if validation fails

**Content moderation (MVP):** type + size validation only. Manual reporting via "Reportar" button on Booth (future). Automated moderation (Google Vision SafeSearch) deferred to post-MVP.

### 3. `src/lib/supabase.js` changes

**`normalizeSeller(row)`** — add new fields:
```js
bio:         row.bio          ?? null,
location:    row.location     ?? null,
socialLinks: row.social_links ?? {},
keywords:    row.keywords     ?? [],
```

**New function: `uploadSellerImage(profileId, file, type)`**
- `type`: `'avatar'` | `'cover'`
- Validates file type and size before upload
- Uploads to `seller-media/{type}s/{profileId}/{type}.{ext}`
- Returns public URL string

**Updated function: `updateSellerBrand(sellerId, fields)`**
Replaces `updateSellerProfile`. Accepts:
```js
{ title, tagline, bio, location, social_links, keywords, avatar_url, cover_url, accent }
```
Updates all brand fields in one DB call.

---

## UI — Tab "Marca" in SellerPanel

### Placement
New 5th tab added to SellerPanel tab bar. Tab label: **"Marca"**

### Layout — Single scroll (no sub-tabs)

Four stacked sections, one "Guardar cambios" button at the bottom.

#### Section 1 — Identidad Visual
- **Avatar** — circle placeholder with upload icon. Tap opens file picker. Preview updates immediately on selection.
- **Cover** — wide rectangle placeholder. Tap opens file picker. Preview updates immediately.
- **Accent color** — 9 color circles (same as onboarding). Selected state: scale-125 + ring.
- File upload flow: select → preview → save triggers upload → store returned URL

#### Section 2 — Perfil Público
- **Title** — Input, label "Tu especialidad" (e.g. "UX Generalist")
- **Tagline** — Input, label "Tagline" (e.g. "Diseño que convierte")
- **Bio** — Textarea, label "Sobre mí", max 300 chars, char counter shown

#### Section 3 — Ubicación + Redes
- **Location** — Input, label "Ciudad / Provincia" (e.g. "San José, Costa Rica")
- **Social links** — 5 inputs with platform icons as prefixes:
  - Instagram (`@username`)
  - WhatsApp (`+506...`)
  - Facebook (URL or username)
  - TikTok (`@username`)
  - Website (URL)

#### Section 4 — Keywords SEO
- Tag chip input: type + Enter to add, tap chip to remove
- Max 10 keywords
- Placeholder suggestions based on seller category (e.g. for UX/UI: "diseño web", "UX", "prototipado")
- Stored as `text[]` in DB

#### Save behavior
1. If new avatar file selected → `uploadSellerImage(profileId, file, 'avatar')` → get URL
2. If new cover file selected → `uploadSellerImage(profileId, file, 'cover')` → get URL
3. `updateSellerBrand(seller.id, { ...allFields, avatar_url, cover_url })`
4. Show success toast "Marca actualizada"
5. On error: show inline error, keep form state

---

## Public Display

### Booth (`/seller/:id`)

Below existing tagline section:
- **Bio** — paragraph text, only renders if `seller.bio` is set
- **Location** — badge: `📍 San José, Costa Rica`, only renders if `seller.location` is set
- **Social links** — horizontal row of icon buttons, only renders links that are set. Icons: Instagram, WhatsApp, Facebook, TikTok, Globe (website). Each opens in new tab.

### SellerCard

Below category badge:
- **Location tag** — `· San José` small muted text, only renders if `seller.location` is set
- No social links in card (too much noise)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| Supabase MCP | `apply_migration` | Add bio, location, social_links, keywords columns |
| Supabase Dashboard | Manual | Create `seller-media` bucket + RLS policy |
| `src/lib/supabase.js` | Modify | Add `uploadSellerImage`, `updateSellerBrand`, update `normalizeSeller` |
| `src/views/SellerPanel.jsx` | Modify | Add "Marca" tab with 4-section scroll editor |
| `src/views/Booth.jsx` | Modify | Add bio, location badge, social links row |
| `src/components/ui/SellerCard.jsx` | Modify | Add optional location tag |

---

## Out of Scope (deferred)

- Automated image moderation (Google Vision SafeSearch)
- Manual "Reportar imagen" button on Booth
- Dark mode for brand editor
- Location-based search/filtering
- Analytics on social link clicks
- Sistema de suscripciones / feature gating por tier

---

## Success Criteria

- Seller can upload avatar and cover from mobile (iOS Safari + Android Chrome)
- All brand fields save and persist across sessions
- Location tag appears on SellerCard only when set
- Bio, location, and social links appear on Booth only when set
- Build passes with no TypeScript/lint errors
- No existing seller data is affected (all new columns nullable)
