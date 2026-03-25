import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

export const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true' || !supabase

// Normaliza fila de Supabase → shape que usa el resto del app
function normalizeSeller(row) {
  return {
    id:          row.id,
    name:        row.name,
    username:    row.username,
    title:       row.title,
    tagline:     row.tagline,
    group:       row.group_id,
    category:    row.category,
    boothType:   row.booth_type,
    badge:       row.badge ?? null,
    accent:      row.accent,
    cover:       row.cover_url ?? null,
    avatar:      row.avatar_url ?? null,
    rating:      row.rating,
    reviews:     row.reviews_count,
    is_verified: row.is_verified,
    items:       row.items       ?? [],
    services:    row.services    ?? [],
    bio:         row.bio         ?? null,
    location:    row.location    ?? null,
    socialLinks: row.social_links ?? {},
    keywords:    row.keywords    ?? [],
  }
}

export async function fetchSellers() {
  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false })
  if (error) throw error
  return data.map(normalizeSeller)
}

export async function fetchSeller(id) {
  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return normalizeSeller(data)
}

export async function fetchMySellerProfile(profileId) {
  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .eq('profile_id', profileId)
    .single()
  if (error) return null
  return normalizeSeller(data)
}

export async function updateSellerItems(sellerId, items) {
  const { error } = await supabase
    .from('sellers')
    .update({ items })
    .eq('id', sellerId)
  if (error) throw error
}

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

export async function fetchMyLeads(profileId) {
  const { data, error } = await supabase
    .from('leads')
    .select('id, mensaje, servicio_interes, status, created_at, buyer:buyer_id(full_name)')
    .eq('seller_id', profileId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(row => ({
    id:      row.id,
    buyer:   row.buyer?.full_name ?? 'Comprador',
    service: row.servicio_interes ?? 'Sin especificar',
    message: row.mensaje,
    status:  row.status ?? 'pending',
    time:    formatRelativeTime(row.created_at),
  }))
}

export async function fetchMyTransactions(profileId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, amount, status, description, created_at, seller:seller_id(full_name)')
    .eq('buyer_id', profileId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(row => ({
    id:      row.id,
    service: row.description ?? 'Pedido',
    seller:  row.seller?.full_name ?? 'Vendedor',
    amount:  `₡${Number(row.amount ?? 0).toLocaleString('es-CR')}`,
    status:  row.status ?? 'pending',
    date:    formatDate(row.created_at),
  }))
}

function formatRelativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `Hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  return `Hace ${Math.floor(hrs / 24)}d`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' })
}
