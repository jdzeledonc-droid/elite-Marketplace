-- ═══════════════════════════════════════════════════════════════
-- 001_init.sql  —  profiles, leads, transactions + RLS + trigger
-- Correr en: Supabase → SQL Editor → New query → Paste → Run
-- ═══════════════════════════════════════════════════════════════

-- ── Profiles ────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  full_name     text,
  avatar_url    text,
  user_role     text    not null default 'buyer',
  is_verified   boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-crear perfil al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, user_role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'user_role', 'buyer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Leads ────────────────────────────────────────────────────────
create table if not exists public.leads (
  id                uuid        default gen_random_uuid() primary key,
  buyer_id          uuid        references public.profiles(id) on delete set null,
  seller_id         uuid        references public.profiles(id) on delete cascade,
  mensaje           text,
  servicio_interes  text,
  status            text        not null default 'pending',
  created_at        timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "leads_select_seller" on public.leads
  for select using (auth.uid() = seller_id);

create policy "leads_insert_buyer" on public.leads
  for insert with check (auth.uid() = buyer_id);

create policy "leads_update_seller" on public.leads
  for update using (auth.uid() = seller_id);

-- ── Transactions ─────────────────────────────────────────────────
create table if not exists public.transactions (
  id          uuid        default gen_random_uuid() primary key,
  buyer_id    uuid        references public.profiles(id) on delete set null,
  seller_id   uuid,
  amount      numeric     not null default 0,
  status      text        not null default 'pending',
  description text,
  created_at  timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "transactions_select_buyer" on public.transactions
  for select using (auth.uid() = buyer_id);
