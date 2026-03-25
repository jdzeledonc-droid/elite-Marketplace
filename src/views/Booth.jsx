import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import NavBar from '../components/layout/NavBar'
import { MOCK_SELLERS, ACCENT_COLORS } from '../lib/mockData'
import { isMockMode, fetchSeller } from '../lib/supabase'

/* ── Shared icons ───────────────────────────────────────────────────────── */
const IcoBack = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoClock = ({ s = 11 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)
const IcoStar = ({ s = 11 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)
const IcoCheck = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoChat = ({ s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoMap = ({ s = 12 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
)
const IcoCalendar = ({ s = 12 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)
const IcoUsers = ({ s = 11 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

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
    links.website && links.website.startsWith('http') && { href: links.website, icon: <IcoGlobe />, label: 'Sitio web' },
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

/* ── Shared back button ─────────────────────────────────────────────────── */
function BackBtn({ onClick, dark = false }) {
  return (
    <button
      onClick={onClick}
      aria-label="Volver"
      className="absolute top-[var(--space-8)] left-[var(--space-5)] w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center cursor-pointer transition-opacity hover:opacity-75 border border-[var(--color-stroke)]"
      style={{ background: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)', color: dark ? '#fff' : '#fff', backdropFilter: 'blur(8px)' }}
    >
      <IcoBack />
    </button>
  )
}

/* ── Floating chat button ───────────────────────────────────────────────── */
function FloatingChat({ accent, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Enviar mensaje al vendedor"
      className="fixed bottom-[84px] right-[var(--space-5)] w-14 h-14 rounded-full shadow-[var(--shadow-xl)] flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 z-[var(--z-overlay)]"
      style={{ background: accent.bg, color: accent.text }}
    >
      <IcoChat s={22} />
    </button>
  )
}

/* ── Accent CTA button ──────────────────────────────────────────────────── */
function AccentBtn({ accent, children, onClick, full = true, size = 'md', disabled = false }) {
  const pad = size === 'sm'
    ? 'px-[var(--space-4)] py-[var(--space-2)] text-sm'
    : 'px-[var(--space-6)] py-[var(--space-4)] text-base'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${full ? 'w-full' : ''} rounded-[var(--radius-full)] font-bold cursor-pointer transition-opacity active:opacity-80 hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none ${pad}`}
      style={{ background: accent.bg, color: accent.text }}
    >
      {children}
    </button>
  )
}

const LEVEL_VARIANT = { Principiante: 'success', Intermedio: 'warning', Avanzado: 'error' }


/* ══════════════════════════════════════════════════════════════════════════
   TEMPLATE 1 — SERVICES
   "Portafolio profesional" — dark, cinematic, Contra/Behance style
   ══════════════════════════════════════════════════════════════════════════ */
function ServicesBooth({ seller, accent, navigate }) {
  const dark = 'rgba(255,255,255,0.9)'
  const muted = 'rgba(255,255,255,0.45)'
  const subtle = 'rgba(255,255,255,0.07)'
  const divider = 'rgba(255,255,255,0.08)'

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-slate-900)' }}>

      {/* ── Hero: full-bleed cover + dark overlay + name overlay ── */}
      <div className="relative h-72 flex-shrink-0 overflow-hidden">
        {seller.cover && (
          <img src={seller.cover} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div
          className="absolute inset-0"
          aria-hidden
          style={{ background: seller.cover
            ? 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.92) 100%)'
            : `linear-gradient(135deg, ${accent.bg} 0%, var(--color-slate-900) 100%)` }}
        />
        <BackBtn onClick={() => navigate(-1)} dark />

        {/* Rating badge */}
        <div
          className="absolute top-[var(--space-8)] right-[var(--space-5)] flex items-center gap-[var(--space-1)] px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)]"
          style={{ background: accent.bg, color: accent.text }}
        >
          <IcoStar s={10} />
          <span className="text-sm font-black">{seller.rating}</span>
          <span className="text-2xs opacity-75">({seller.reviews})</span>
        </div>

        {/* Hero overlay: title es el focal point */}
        <div className="absolute bottom-0 left-0 right-0 px-[var(--space-6)] pb-[var(--space-6)]">
          {/* Title — claim principal */}
          <h1 className="text-lg font-black text-white leading-tight mb-[var(--space-3)]">
            {seller.title || seller.category}
          </h1>
          {/* Identidad secundaria: avatar + nombre + categoría */}
          <div className="flex items-center gap-[var(--space-3)]">
            <Avatar src={seller.avatar} alt={seller.name} size="sm" verified={seller.is_verified} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {seller.name}
              </p>
              <p className="text-xs" style={{ color: accent.bg }}>
                {seller.category}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content: dark ── */}
      <div className="flex-1 px-[var(--space-6)] pt-[var(--space-6)] pb-32" style={{ background: 'var(--color-slate-900)' }}>

        {/* Tagline */}
        <p className="text-base leading-relaxed mb-[var(--space-5)]" style={{ color: muted }}>
          {seller.tagline}
        </p>

        {/* Badges row */}
        <div className="flex gap-[var(--space-2)] flex-wrap mb-[var(--space-5)]">
          {seller.is_verified && <Badge variant="verified">Verificado</Badge>}
          {seller.badge === 'local' && <Badge variant="local">📍 Local</Badge>}
          {seller.badge === 'hecho-en-cr' && <Badge variant="hecho-en-cr">🇨🇷 Hecho en CR</Badge>}
        </div>

        <BrandSection seller={seller} dark />

        {/* Section divider */}
        <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-6)]">
          <div className="h-px flex-1" style={{ background: divider }} />
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: muted }}>
            {seller.items.length} servicios
          </p>
          <div className="h-px flex-1" style={{ background: divider }} />
        </div>

        {/* Featured service (first item) */}
        {seller.items[0] && (
          <div
            className="rounded-[var(--radius-2xl)] overflow-hidden mb-[var(--space-4)]"
            style={{ background: `${accent.bg}15`, border: `1px solid ${accent.bg}30` }}
          >
            <div className="relative h-28 overflow-hidden">
              <img
                src={`https://picsum.photos/seed/feat-${seller.items[0].id}/600/200`}
                alt="" aria-hidden
                className="w-full h-full object-cover opacity-50"
                loading="lazy"
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to right, ${accent.bg}cc 0%, transparent 70%)` }}
              />
              <div className="absolute inset-0 flex items-center px-[var(--space-5)]">
                <div>
                  <p className="text-2xs font-bold uppercase tracking-[0.15em] mb-[var(--space-1)]"
                    style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Destacado
                  </p>
                  <h2 className="text-lg font-black leading-tight" style={{ color: '#fff' }}>
                    {seller.items[0].title}
                  </h2>
                </div>
              </div>
            </div>
            <div className="px-[var(--space-5)] py-[var(--space-4)]">
              <div className="flex items-center justify-between mb-[var(--space-4)]">
                <div className="flex items-center gap-[var(--space-1)]" style={{ color: muted }}>
                  <IcoClock s={11} />
                  <span className="text-xs">Entrega en {seller.items[0].delivery}</span>
                </div>
                <span className="text-base font-black" style={{ color: accent.bg }}>
                  {seller.items[0].price}
                </span>
              </div>
              <AccentBtn accent={accent} size="sm" onClick={() => navigate('/chat')}>
                Contactar
              </AccentBtn>
            </div>
          </div>
        )}

        {/* Remaining services — compact dark rows */}
        {seller.items.slice(1).map(item => (
          <div
            key={item.id}
            className="flex items-center gap-[var(--space-4)] py-[var(--space-4)]"
            style={{ borderBottom: `1px solid ${divider}` }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold truncate" style={{ color: dark }}>
                {item.title}
              </p>
              <div className="flex items-center gap-[var(--space-1)] mt-[var(--space-1)]" style={{ color: muted }}>
                <IcoClock s={10} />
                <span className="text-xs">{item.delivery}</span>
              </div>
            </div>
            <div className="flex items-center gap-[var(--space-3)] flex-shrink-0">
              <span className="text-sm font-bold" style={{ color: accent.bg }}>
                {item.price}
              </span>
              <button
                onClick={() => navigate('/chat')}
                className="px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-full)] text-xs font-bold cursor-pointer transition-opacity hover:opacity-80"
                style={{ background: subtle, color: dark, border: `1px solid ${divider}` }}
              >
                Contratar
              </button>
            </div>
          </div>
        ))}
      </div>

      <FloatingChat accent={accent} onClick={() => navigate('/chat')} />
      <NavBar />
    </div>
  )
}


/* ══════════════════════════════════════════════════════════════════════════
   TEMPLATE 2 — CATALOG
   "Mini tienda" — bright, storefront, Etsy/Mercado style
   ══════════════════════════════════════════════════════════════════════════ */
function CatalogBooth({ seller, accent, navigate }) {
  const featured = seller.items[0]
  const rest = seller.items.slice(1)

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)]">

      {/* ── Store header: accent bg + cover image + dark gradient ── */}
      <div className="relative h-72 flex-shrink-0 overflow-hidden" style={{ background: accent.bg }}>
        {seller.cover && (
          <img src={seller.cover} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div
          className="absolute inset-0"
          aria-hidden
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.92) 100%)' }}
        />
        <BackBtn onClick={() => navigate(-1)} dark />

        {/* Badge */}
        {(seller.badge === 'hecho-en-cr' || seller.badge === 'local') && (
          <div className="absolute top-[var(--space-8)] right-[var(--space-5)]">
            <Badge variant={seller.badge}>
              {seller.badge === 'hecho-en-cr' ? '🇨🇷 Hecho en CR' : '📍 Local'}
            </Badge>
          </div>
        )}

        {/* Bottom centered: title → avatar → name (order matches Figma) */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-[var(--space-6)] px-[var(--space-6)] gap-[var(--space-3)]">
          <h1 className="text-lg font-black text-white text-center leading-tight">
            {seller.title || seller.category}
          </h1>
          <div className="rounded-full p-[3px]" style={{ background: '#fff' }}>
            <Avatar src={seller.avatar} alt={seller.name} size="lg" verified={seller.is_verified} />
          </div>
          <p className="text-sm font-medium text-center" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {seller.name} · {seller.category}
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex justify-around py-[var(--space-4)] px-[var(--space-6)] border-b border-[var(--color-border-light)]">
        {[
          { value: seller.rating, label: 'Rating', extra: <IcoStar s={10} /> },
          { value: seller.reviews, label: 'Reseñas' },
          { value: seller.items.length, label: 'Productos' },
        ].map(({ value, label, extra }) => (
          <div key={label} className="flex flex-col items-center gap-[var(--space-1)]">
            <div className="flex items-center gap-[var(--space-1)]" style={{ color: accent.bg }}>
              {extra}
              <span className="text-xl font-black">{value}</span>
            </div>
            <span className="text-2xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 px-[var(--space-5)] pt-[var(--space-6)] pb-32">

        <BrandSection seller={seller} />

        {/* Featured product — full-width banner card */}
        {featured && (
          <div className="mb-[var(--space-6)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-[var(--space-3)]">
              Destacado
            </p>
            <article className="rounded-[32px] overflow-hidden border border-[var(--color-border-light)] shadow-[var(--shadow-md)]">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={`https://picsum.photos/seed/${featured.id}/600/300`}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {featured.stock !== null && featured.stock <= 5 && featured.stock > 0 && (
                  <div
                    className="absolute top-[var(--space-3)] right-[var(--space-3)] px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] text-xs font-bold"
                    style={{ background: accent.bg, color: accent.text }}
                  >
                    ¡Últimas {featured.stock}!
                  </div>
                )}
              </div>
              <div className="p-[var(--space-5)]">
                <h2 className="text-lg font-black text-[var(--color-text-primary)] mb-[var(--space-2)]">
                  {featured.title}
                </h2>
                <div className="flex items-center justify-between mb-[var(--space-4)]">
                  <span className="text-2xl font-black" style={{ color: accent.bg }}>
                    {featured.price}
                  </span>
                  {featured.stock !== null && (
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                      {featured.stock > 0 ? `${featured.stock} disponibles` : 'Sin stock'}
                    </span>
                  )}
                </div>
                <AccentBtn accent={accent} disabled={featured.stock === 0} onClick={() => navigate('/chat')}>
                  {featured.stock === 0 ? 'Sin stock' : 'Pedir ahora'}
                </AccentBtn>
              </div>
            </article>
          </div>
        )}

        {/* Rest of products — 2-col grid */}
        {rest.length > 0 && (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-[var(--space-3)]">
              También en tienda
            </p>
            <div className="grid grid-cols-2 gap-[var(--space-3)]">
              {rest.map(item => {
                const out = item.stock !== null && item.stock === 0
                return (
                  <article
                    key={item.id}
                    className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[32px] overflow-hidden"
                  >
                    <div className="relative h-[187px] overflow-hidden">
                      <img
                        src={`https://picsum.photos/seed/${item.id}/300/300`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {out && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">Agotado</span>
                        </div>
                      )}
                    </div>
                    <div className="p-[var(--space-3)]">
                      <p className="text-sm font-bold text-[var(--color-text-primary)] leading-tight mb-[var(--space-1)]">
                        {item.title}
                      </p>
                      <p className="text-base font-black mb-[var(--space-3)]" style={{ color: accent.bg }}>
                        {item.price}
                      </p>
                      <AccentBtn accent={accent} size="sm" disabled={out} onClick={() => navigate('/chat')}>
                        {out ? 'Agotado' : 'Pedir'}
                      </AccentBtn>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </div>

      <FloatingChat accent={accent} onClick={() => navigate('/chat')} />
      <NavBar />
    </div>
  )
}


/* ══════════════════════════════════════════════════════════════════════════
   TEMPLATE 3 — COURSES
   "Plataforma educativa" — light, structured, Gumroad/Teachable style
   ══════════════════════════════════════════════════════════════════════════ */
function CoursesBooth({ seller, accent, navigate }) {
  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-secondary)]">

      {/* ── Hero: instructor banner with cover + accent stripe ── */}
      <div className="relative h-56 flex-shrink-0 overflow-hidden">
        {seller.cover && (
          <img src={seller.cover} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div
          className="absolute inset-0"
          aria-hidden
          style={{ background: `linear-gradient(to bottom, ${accent.bg}88 0%, ${accent.bg}ee 100%)` }}
        />
        <BackBtn onClick={() => navigate(-1)} dark />

        {/* Hero overlay: title como focal point */}
        <div className="absolute bottom-0 left-0 right-0 px-[var(--space-6)] pb-[var(--space-6)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-[var(--space-2)]"
            style={{ color: 'rgba(255,255,255,0.55)' }}>
            Aprende con
          </p>
          {/* Title — especialidad del instructor */}
          <h1 className="text-lg font-black text-white leading-tight mb-[var(--space-2)]">
            {seller.title || seller.category}
          </h1>
          {/* Nombre — identidad secundaria */}
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {seller.name} · {seller.category}
          </p>
        </div>
      </div>

      {/* ── White card content ── */}
      <div className="flex-1 bg-[var(--color-bg-primary)] rounded-[var(--radius-3xl)_var(--radius-3xl)_0_0] px-[var(--space-6)] pt-[var(--space-12)] pb-32">

        {/* Instructor stats */}
        <div className="flex items-center gap-[var(--space-6)] pb-[var(--space-6)] mb-[var(--space-6)] border-b border-[var(--color-border-light)]">
          <div>
            <Avatar src={seller.avatar} alt={seller.name} size="md" verified={seller.is_verified} />
          </div>
          <div className="flex gap-[var(--space-6)] flex-1">
            {[
              { v: seller.rating, l: 'Rating', icon: <IcoStar s={10} /> },
              { v: seller.reviews, l: 'Alumnos', icon: <IcoUsers s={10} /> },
              { v: seller.items.length, l: 'Cursos' },
            ].map(({ v, l, icon }) => (
              <div key={l} className="flex flex-col items-center">
                <div className="flex items-center gap-[var(--space-1)]" style={{ color: accent.bg }}>
                  {icon}
                  <span className="text-xl font-black">{v}</span>
                </div>
                <span className="text-2xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <p className="text-base text-[var(--color-text-secondary)] leading-relaxed mb-[var(--space-6)]">
          {seller.tagline}
        </p>

        <BrandSection seller={seller} />

        {/* "Lo que aprenderás" checklist */}
        <div
          className="rounded-[var(--radius-2xl)] p-[var(--space-5)] mb-[var(--space-8)]"
          style={{ background: `${accent.bg}0e`, border: `1px solid ${accent.bg}25` }}
        >
          <p className="text-sm font-black text-[var(--color-text-primary)] mb-[var(--space-4)]">
            Lo que aprenderás
          </p>
          <ul className="flex flex-col gap-[var(--space-3)]" role="list">
            {seller.items.map(item => (
              <li key={item.id} className="flex items-start gap-[var(--space-3)]">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-px"
                  style={{ background: accent.bg, color: accent.text }}
                >
                  <IcoCheck s={11} />
                </span>
                <span className="text-sm text-[var(--color-text-secondary)] leading-snug">
                  {item.title}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Course cards — horizontal */}
        <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-4)]">
          <span className="w-[3px] h-[14px] rounded-full" style={{ background: accent.bg }} />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            {seller.items.length} cursos disponibles
          </p>
        </div>

        <ul className="flex flex-col gap-[var(--space-4)]" role="list">
          {seller.items.map((item, idx) => (
            <li key={item.id}>
              <article className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] overflow-hidden">
                <div className="flex">
                  {/* Thumbnail */}
                  <div className="relative w-24 flex-shrink-0 overflow-hidden">
                    <img
                      src={`https://picsum.photos/seed/course-${item.id}/200/200`}
                      alt="" aria-hidden
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: `${accent.bg}cc` }}
                    >
                      <span className="text-2xl font-black" style={{ color: accent.text }}>
                        {idx + 1}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-[var(--space-4)]">
                    <h2 className="text-sm font-bold text-[var(--color-text-primary)] leading-tight mb-[var(--space-2)]">
                      {item.title}
                    </h2>
                    <div className="flex items-center gap-[var(--space-2)] flex-wrap mb-[var(--space-3)]">
                      <Badge variant="level">{item.level}</Badge>
                      <div className="flex items-center gap-[var(--space-1)] text-[var(--color-text-tertiary)]">
                        <IcoClock s={10} />
                        <span className="text-xs">{item.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black" style={{ color: accent.bg }}>
                        {item.price}
                      </span>
                      <button
                        onClick={() => navigate('/chat')}
                        className="px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-full)] text-xs font-bold cursor-pointer transition-opacity hover:opacity-80"
                        style={{ background: accent.bg, color: accent.text }}
                      >
                        Inscribirse
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>

      <FloatingChat accent={accent} onClick={() => navigate('/chat')} />
      <NavBar />
    </div>
  )
}


/* ══════════════════════════════════════════════════════════════════════════
   TEMPLATE 4 — HYBRID
   "Marca artesanal / Brand emergente" — editorial, lookbook, maker/brand style
   Productos físicos + experiencias/encargos — NO delivery, NO restaurante
   ══════════════════════════════════════════════════════════════════════════ */
function HybridBooth({ seller, accent, navigate }) {
  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)]">

      {/* ── Hero: editorial lookbook — cover full-bleed + brand name tipográfico ── */}
      <div className="relative h-64 flex-shrink-0 overflow-hidden">
        {seller.cover && (
          <img src={seller.cover} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
        )}
        {/* Soft vignette — fondo visible, texto legible */}
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background: seller.cover
              ? 'linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.72) 100%)'
              : `linear-gradient(135deg, ${accent.bg} 0%, ${accent.bg}aa 100%)`,
          }}
        />
        <BackBtn onClick={() => navigate(-1)} dark />

        {/* Badges */}
        {(seller.badge === 'hecho-en-cr' || seller.badge === 'local') && (
          <div className="absolute top-[var(--space-8)] right-[var(--space-5)]">
            <Badge variant={seller.badge}>
              {seller.badge === 'hecho-en-cr' ? '🇨🇷 Hecho en CR' : '📍 Local'}
            </Badge>
          </div>
        )}

        {/* Hero overlay: title editorial como focal point */}
        <div className="absolute bottom-0 left-0 right-0 px-[var(--space-6)] pb-[var(--space-5)]">
          {/* Title — tipo de oferta artesanal */}
          <h1 className="text-lg font-black text-white leading-none tracking-tight mb-[var(--space-2)]">
            {seller.title || seller.category}
          </h1>
          {/* Nombre — identidad secundaria */}
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {seller.name} · {seller.category}
          </p>
        </div>
      </div>

      {/* ── Brand identity bar ── */}
      <div
        className="flex items-center gap-[var(--space-4)] px-[var(--space-6)] py-[var(--space-4)]"
        style={{ background: accent.bg }}
      >
        <Avatar src={seller.avatar} alt={seller.name} size="sm" verified={seller.is_verified} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-snug truncate"
            style={{ color: accent.text }}>
            {seller.tagline}
          </p>
        </div>
        <div className="flex items-center gap-[var(--space-1)] flex-shrink-0"
          style={{ color: accent.text }}>
          <IcoStar s={10} />
          <span className="text-sm font-black">{seller.rating}</span>
          <span className="text-xs opacity-70">({seller.reviews})</span>
        </div>
      </div>

      <div className="flex-1 pb-32">

        <div className="px-[var(--space-5)] pt-[var(--space-6)]">
          <BrandSection seller={seller} />
        </div>

        {/* ── Colección / Productos ── */}
        <div className="px-[var(--space-5)] pt-[var(--space-6)]">
          <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-4)]">
            <span className="w-[3px] h-[14px] rounded-full" style={{ background: accent.bg }} />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Colección
            </p>
          </div>

          {/* Product grid — square images, artisanal feel */}
          <div className="grid grid-cols-2 gap-[var(--space-3)] mb-[var(--space-8)]">
            {seller.items.map(item => {
              const out = item.stock !== null && item.stock === 0
              return (
                <article
                  key={item.id}
                  className="bg-[var(--color-bg-secondary)] rounded-[32px] overflow-hidden border border-[var(--color-border-light)]"
                >
                  <div className="relative h-[187px] overflow-hidden">
                    <img
                      src={`https://picsum.photos/seed/${item.id}/400/400`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Accent color tag en esquina */}
                    <div
                      className="absolute bottom-0 left-0 right-0 px-[var(--space-3)] py-[var(--space-2)]"
                      style={{ background: `linear-gradient(to top, ${accent.bg}dd, transparent)` }}
                    >
                      <p className="text-sm font-black leading-tight"
                        style={{ color: accent.text }}>
                        {item.price}
                      </p>
                    </div>
                    {out && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-bold px-[var(--space-2)] py-[var(--space-1)] bg-black/50 rounded-[var(--radius-full)]">
                          Agotado
                        </span>
                      </div>
                    )}
                    {item.stock !== null && item.stock > 0 && item.stock <= 5 && (
                      <div className="absolute top-[var(--space-2)] right-[var(--space-2)]">
                        <span
                          className="text-2xs font-bold px-[var(--space-2)] py-px rounded-[var(--radius-full)]"
                          style={{ background: accent.bg, color: accent.text }}
                        >
                          ¡{item.stock} left!
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="px-[var(--space-3)] py-[var(--space-3)]">
                    <p className="text-sm font-bold text-[var(--color-text-primary)] leading-tight mb-[var(--space-3)]">
                      {item.title}
                    </p>
                    <AccentBtn accent={accent} size="sm" disabled={out} onClick={() => navigate('/chat')}>
                      {out ? 'Agotado' : 'Encargar'}
                    </AccentBtn>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        {/* ── Experiencias / Servicios — pedidos personalizados, talleres, etc. ── */}
        {seller.services?.length > 0 && (
          <div className="px-[var(--space-5)]">
            {/* Section divider visual */}
            <div
              className="rounded-[var(--radius-2xl)] px-[var(--space-5)] py-[var(--space-4)] mb-[var(--space-5)] flex items-center gap-[var(--space-3)]"
              style={{ background: `${accent.bg}0d`, border: `1px dashed ${accent.bg}40` }}
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                También ofrecemos
              </span>
            </div>

            <ul className="flex flex-col gap-[var(--space-3)]" role="list">
              {seller.services.map(svc => (
                <li key={svc.id}>
                  <article className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] overflow-hidden">
                    {/* Accent top strip */}
                    <div className="h-[3px]" style={{ background: `linear-gradient(to right, ${accent.bg}, ${accent.bg}44)` }} />
                    <div className="p-[var(--space-5)]">
                      <div className="flex items-start justify-between gap-[var(--space-3)] mb-[var(--space-4)]">
                        <div className="flex-1">
                          <h2 className="text-base font-bold text-[var(--color-text-primary)] leading-tight mb-[var(--space-1)]">
                            {svc.title}
                          </h2>
                          <div className="flex items-center gap-[var(--space-1)] text-[var(--color-text-tertiary)]">
                            <IcoClock s={10} />
                            <span className="text-xs">{svc.delivery}</span>
                          </div>
                        </div>
                        <span
                          className="text-sm font-black px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] flex-shrink-0"
                          style={{ background: `${accent.bg}15`, color: accent.bg }}
                        >
                          {svc.price}
                        </span>
                      </div>
                      <AccentBtn accent={accent} size="sm" onClick={() => navigate('/chat')}>
                        Consultar
                      </AccentBtn>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <FloatingChat accent={accent} onClick={() => navigate('/chat')} />
      <NavBar />
    </div>
  )
}


/* ══════════════════════════════════════════════════════════════════════════
   MAIN — router de templates
   ══════════════════════════════════════════════════════════════════════════ */
export default function Booth() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [seller, setSeller] = useState(isMockMode ? (MOCK_SELLERS.find(s => s.id === id) ?? null) : null)
  const [loading, setLoading] = useState(!isMockMode)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (isMockMode) return
    fetchSeller(id)
      .then(setSeller)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-dvh">
      <div className="w-6 h-6 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
    </div>
  )

  if (notFound || !seller) return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-[var(--space-4)] px-[var(--space-6)]">
      <p className="text-lg font-bold">Vendedor no encontrado</p>
      <Button variant="secondary" onClick={() => navigate('/')}>Volver al inicio</Button>
    </div>
  )

  const accent = ACCENT_COLORS[seller.accent] || ACCENT_COLORS.black
  const props  = { seller, accent, navigate }

  if (seller.boothType === 'services') return <ServicesBooth {...props} />
  if (seller.boothType === 'catalog')  return <CatalogBooth  {...props} />
  if (seller.boothType === 'courses')  return <CoursesBooth  {...props} />
  if (seller.boothType === 'hybrid')   return <HybridBooth   {...props} />
  return null
}
