-- FolioVerse database setup (run in Supabase > SQL Editor)
create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  template text not null default 'simple' check (template in ('simple','modern','creative')),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolios enable row level security;

create policy "Users can view their own portfolios"
on public.portfolios for select
using (auth.uid() = user_id);

create policy "Users can create their own portfolios"
on public.portfolios for insert
with check (auth.uid() = user_id);

create policy "Users can update their own portfolios"
on public.portfolios for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own portfolios"
on public.portfolios for delete
using (auth.uid() = user_id);

create index if not exists portfolios_user_id_idx on public.portfolios(user_id);
