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
    items:       row.items   ?? [],
    services:    row.services ?? [],
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
