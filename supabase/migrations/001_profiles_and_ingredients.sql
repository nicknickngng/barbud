-- Profiles table
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Default Profile',
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ingredients table
create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  quantity text not null default '',
  volume text not null default '',
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_profiles_user_id on public.profiles(user_id);
create index idx_ingredients_profile_id on public.ingredients(profile_id);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.ingredients enable row level security;

-- Profiles: users can only access their own
create policy "Users can select own profiles"
  on public.profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profiles"
  on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profiles"
  on public.profiles for update using (auth.uid() = user_id);
create policy "Users can delete own profiles"
  on public.profiles for delete using (auth.uid() = user_id);

-- Ingredients: users can only access ingredients on their own profiles
create policy "Users can select own ingredients"
  on public.ingredients for select
  using (profile_id in (select id from public.profiles where user_id = auth.uid()));
create policy "Users can insert own ingredients"
  on public.ingredients for insert
  with check (profile_id in (select id from public.profiles where user_id = auth.uid()));
create policy "Users can update own ingredients"
  on public.ingredients for update
  using (profile_id in (select id from public.profiles where user_id = auth.uid()));
create policy "Users can delete own ingredients"
  on public.ingredients for delete
  using (profile_id in (select id from public.profiles where user_id = auth.uid()));
