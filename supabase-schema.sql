create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[A-Za-z0-9_]{3,24}$'),
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  resume_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists resumes_touch_updated_at on public.resumes;
create trigger resumes_touch_updated_at
before update on public.resumes
for each row execute function public.touch_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.email
  );

  insert into public.resumes (user_id, resume_data)
  values (new.id, '{}'::jsonb);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.resumes enable row level security;

drop policy if exists "Profiles are readable for login lookup" on public.profiles;
create policy "Profiles are readable for login lookup"
on public.profiles
for select
using (true);

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users read their own resume" on public.resumes;
create policy "Users read their own resume"
on public.resumes
for select
using (auth.uid() = user_id);

drop policy if exists "Users update their own resume" on public.resumes;
create policy "Users update their own resume"
on public.resumes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users insert their own resume" on public.resumes;
create policy "Users insert their own resume"
on public.resumes
for insert
with check (auth.uid() = user_id);
