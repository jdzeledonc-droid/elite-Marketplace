-- ═══════════════════════════════════════════════════════════════
-- 002_sellers.sql  —  tabla sellers + RLS + bucket de imágenes
-- Correr en: Supabase → SQL Editor → New query → Paste → Run
-- ═══════════════════════════════════════════════════════════════

-- ── Sellers ──────────────────────────────────────────────────────
create table if not exists public.sellers (
  id            uuid        default gen_random_uuid() primary key,
  profile_id    uuid        references public.profiles(id) on delete cascade,
  name          text,
  username      text        unique,
  title         text,
  tagline       text,
  group_id      text,
  category      text,
  booth_type    text        not null default 'services',
  badge         text,
  accent        text        not null default 'blue',
  cover_url     text,
  avatar_url    text,
  rating        numeric     not null default 5.0,
  reviews_count integer     not null default 0,
  is_verified   boolean     not null default false,
  is_active     boolean     not null default true,
  items         jsonb       not null default '[]',
  services      jsonb       not null default '[]',
  bio           text,
  location      text,
  social_links  jsonb       not null default '{}',
  keywords      jsonb       not null default '[]',
  created_at    timestamptz not null default now()
);

alter table public.sellers enable row level security;

-- Cualquiera puede ver tiendas activas
create policy "sellers_select_active" on public.sellers
  for select using (is_active = true);

-- Dueño puede actualizar su tienda
create policy "sellers_update_own" on public.sellers
  for update using (auth.uid() = profile_id);

-- Dueño puede crear su tienda
create policy "sellers_insert_own" on public.sellers
  for insert with check (auth.uid() = profile_id);

-- ── Storage bucket para imágenes ─────────────────────────────────
insert into storage.buckets (id, name, public)
values ('seller-media', 'seller-media', true)
on conflict (id) do nothing;

create policy "seller_media_select" on storage.objects
  for select using (bucket_id = 'seller-media');

create policy "seller_media_insert" on storage.objects
  for insert with check (
    bucket_id = 'seller-media' and auth.uid() is not null
  );

create policy "seller_media_update" on storage.objects
  for update using (
    bucket_id = 'seller-media' and auth.uid() is not null
  );
