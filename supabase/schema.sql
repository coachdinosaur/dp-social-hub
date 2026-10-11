-- DP Social Hub: run once in Supabase → SQL Editor → New query → Run.
-- Only emails listed in `members` can read or write anything (Row Level Security).

create table if not exists public.members (
  email text primary key,
  name  text not null default ''
);

-- 👇 Replace the two emails with yours (lower-case) in the SQL Editor before running. Don't commit real emails: this repo is public.
insert into public.members (email, name) values
  ('ronaldo@example.com', 'Ronaldo'),
  ('jb@example.com', 'JB')
on conflict (email) do nothing;

create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

create table if not exists public.contents (
  id uuid primary key,
  title text not null default '',
  kind text not null default 'episode',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key,
  content_id uuid references public.contents (id) on delete set null,
  platform text not null,
  format text not null default '',
  title text not null default '',
  caption text not null default '',
  hashtags text[] not null default '{}',
  link text not null default '',
  scheduled_at timestamptz,
  posted_at timestamptz,
  status text not null default 'draft',
  assignee text not null default '',
  checklist jsonb not null default '[]',
  metrics jsonb not null default '{}',
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key,
  title text not null,
  done boolean not null default false,
  due_date date,
  assignee text not null default '',
  priority text not null default 'normal',
  post_id uuid references public.posts (id) on delete set null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.hashtag_sets (
  id uuid primary key,
  name text not null,
  platform text not null default 'all',
  tags text[] not null default '{}',
  notes text not null default ''
);

create table if not exists public.ideas (
  id uuid primary key,
  kind text not null default 'idea',
  text text not null,
  source text not null default '',
  phase text not null default '',
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key,
  label text not null,
  platform text not null default 'all',
  target integer not null default 0,
  current integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Row Level Security: team members only
do $$
declare t text;
begin
  foreach t in array array['contents', 'posts', 'tasks', 'hashtag_sets', 'ideas', 'goals'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists team_all on public.%I', t);
    execute format('create policy team_all on public.%I for all to authenticated using (public.is_member()) with check (public.is_member())', t);
  end loop;
end $$;

alter table public.members enable row level security;
drop policy if exists members_read on public.members;
create policy members_read on public.members for select to authenticated using (public.is_member());

-- Live updates between you and JB
do $$
declare t text;
begin
  foreach t in array array['contents', 'posts', 'tasks', 'hashtag_sets', 'ideas', 'goals'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
