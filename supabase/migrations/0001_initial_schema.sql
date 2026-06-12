-- Aura Tracker — initial schema
-- Tables follow the project brief: profiles (users), public posts/votes/
-- comments, groups, group members, private posts/votes/comments,
-- notifications, friendships, aura history, and reports.

-- ============================================================
-- profiles (the brief's `users` table; auth fields live in auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique
    check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  display_name text not null default '',
  profile_image_url text,
  bio text not null default '' check (char_length(bio) <= 160),
  total_public_aura integer not null default 0,
  last_public_post_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- public posts
-- ============================================================
create table public.public_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  description text not null default '' check (char_length(description) <= 280),
  category text,
  image_url text,
  aura_score integer not null default 0,
  up_votes_count integer not null default 0,
  down_votes_count integer not null default 0,
  total_votes_count integer not null default 0,
  vote_ratio numeric not null default 0,
  status text not null default 'active'
    check (status in ('active', 'closed', 'removed', 'reported')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours',
  -- UTC day of posting; backs the one-public-post-per-day rule.
  post_date date not null generated always as (
    (created_at at time zone 'utc')::date
  ) stored
);

-- One public post per user per day.
create unique index public_posts_one_per_day
  on public.public_posts (user_id, post_date);

create index public_posts_created_at_idx on public.public_posts (created_at desc);

-- ============================================================
-- public votes
-- ============================================================
create table public.public_votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.public_posts (id) on delete cascade,
  voter_id uuid not null references public.profiles (id) on delete cascade,
  vote_type text not null check (vote_type in ('aura_up', 'aura_down')),
  created_at timestamptz not null default now(),
  -- One vote per user per post.
  unique (post_id, voter_id)
);

-- ============================================================
-- public comments
-- ============================================================
create table public.public_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.public_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  comment_text text not null check (char_length(comment_text) between 1 and 280),
  status text not null default 'active'
    check (status in ('active', 'removed', 'reported')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index public_comments_post_idx on public.public_comments (post_id, created_at);

-- ============================================================
-- groups
-- ============================================================
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  description text not null default '' check (char_length(description) <= 120),
  icon_url text,
  created_by uuid not null references public.profiles (id) on delete cascade,
  invite_code text not null unique
    check (invite_code ~ '^[A-Z0-9]{4,10}$'),
  privacy_status text not null default 'invite_only'
    check (privacy_status in ('private', 'invite_only')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- group members
-- ============================================================
create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'admin', 'member')),
  group_aura_score integer not null default 0,
  status text not null default 'active'
    check (status in ('active', 'left', 'removed', 'pending')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create index group_members_user_idx on public.group_members (user_id, status);

-- ============================================================
-- private posts (aura incidents)
-- ============================================================
create table public.private_posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  posted_by_user_id uuid not null references public.profiles (id) on delete cascade,
  target_user_id uuid not null references public.profiles (id) on delete cascade,
  post_type text not null check (post_type in ('self_post', 'friend_post')),
  title text,
  description text not null check (char_length(description) between 1 and 280),
  image_url text,
  aura_score integer not null default 0,
  up_votes_count integer not null default 0,
  down_votes_count integer not null default 0,
  total_votes_count integer not null default 0,
  vote_ratio numeric not null default 0,
  status text not null default 'active'
    check (status in ('active', 'closed', 'removed', 'reported')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Self posts are about the poster; friend posts are about someone else.
  check (
    (post_type = 'self_post' and posted_by_user_id = target_user_id) or
    (post_type = 'friend_post' and posted_by_user_id <> target_user_id)
  )
);

create index private_posts_group_idx on public.private_posts (group_id, created_at desc);

-- ============================================================
-- private votes
-- ============================================================
create table public.private_votes (
  id uuid primary key default gen_random_uuid(),
  private_post_id uuid not null references public.private_posts (id) on delete cascade,
  voter_id uuid not null references public.profiles (id) on delete cascade,
  vote_type text not null check (vote_type in ('aura_up', 'aura_down')),
  created_at timestamptz not null default now(),
  -- One vote per member per post.
  unique (private_post_id, voter_id)
);

-- ============================================================
-- private comments
-- ============================================================
create table public.private_comments (
  id uuid primary key default gen_random_uuid(),
  private_post_id uuid not null references public.private_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  comment_text text not null check (char_length(comment_text) between 1 and 280),
  status text not null default 'active'
    check (status in ('active', 'removed', 'reported')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- notifications
-- ============================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in (
    'public_vote', 'private_vote', 'comment', 'group_invite',
    'friend_posted_about_you', 'aura_updated', 'trending_post',
    'daily_reminder'
  )),
  title text not null,
  message text not null,
  related_post_id uuid,
  related_group_id uuid references public.groups (id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, is_read, created_at desc);

-- ============================================================
-- friendships
-- ============================================================
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> receiver_id),
  unique (requester_id, receiver_id)
);

-- ============================================================
-- aura history
-- ============================================================
create table public.aura_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  source_type text not null check (source_type in (
    'public_post', 'private_post', 'manual_adjustment', 'system_bonus'
  )),
  source_id uuid,
  group_id uuid references public.groups (id) on delete cascade,
  aura_change integer not null,
  previous_score integer not null,
  new_score integer not null,
  created_at timestamptz not null default now()
);

create index aura_history_user_idx on public.aura_history (user_id, created_at desc);

-- ============================================================
-- reports
-- ============================================================
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid references public.profiles (id) on delete cascade,
  content_type text not null
    check (content_type in ('public_post', 'private_post', 'comment', 'user')),
  content_id uuid,
  reason text not null,
  description text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'dismissed', 'action_taken')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Profile bootstrap: create a profile row when a user signs up.
-- Username comes from auth metadata (set during sign-up).
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      'user_' || left(replace(new.id::text, '-', ''), 12)
    ),
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Username login: resolve a username to its account email so users can
-- log in with either. Definer rights are needed to read auth.users.
-- ============================================================
create or replace function public.get_email_for_username(lookup_username text)
returns text
language sql
security definer set search_path = ''
stable
as $$
  select u.email::text
  from auth.users u
  join public.profiles p on p.id = u.id
  where p.username = lookup_username;
$$;

-- ============================================================
-- Vote tallying: keep counts and aura score on the post in sync.
-- aura_score = round((up - down) / total * base); base 100 public, 50 private.
-- ============================================================
create or replace function public.recalc_public_post_votes()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  affected_post uuid := coalesce(new.post_id, old.post_id);
  ups integer;
  downs integer;
begin
  select
    count(*) filter (where vote_type = 'aura_up'),
    count(*) filter (where vote_type = 'aura_down')
  into ups, downs
  from public.public_votes where post_id = affected_post;

  update public.public_posts set
    up_votes_count = ups,
    down_votes_count = downs,
    total_votes_count = ups + downs,
    vote_ratio = case when ups + downs = 0 then 0
      else (ups - downs)::numeric / (ups + downs) end,
    aura_score = case when ups + downs = 0 then 0
      else round((ups - downs)::numeric / (ups + downs) * 100) end,
    updated_at = now()
  where id = affected_post;

  return coalesce(new, old);
end;
$$;

create trigger on_public_vote_change
  after insert or update or delete on public.public_votes
  for each row execute function public.recalc_public_post_votes();

create or replace function public.recalc_private_post_votes()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  affected_post uuid := coalesce(new.private_post_id, old.private_post_id);
  ups integer;
  downs integer;
begin
  select
    count(*) filter (where vote_type = 'aura_up'),
    count(*) filter (where vote_type = 'aura_down')
  into ups, downs
  from public.private_votes where private_post_id = affected_post;

  update public.private_posts set
    up_votes_count = ups,
    down_votes_count = downs,
    total_votes_count = ups + downs,
    vote_ratio = case when ups + downs = 0 then 0
      else (ups - downs)::numeric / (ups + downs) end,
    aura_score = case when ups + downs = 0 then 0
      else round((ups - downs)::numeric / (ups + downs) * 50) end,
    updated_at = now()
  where id = affected_post;

  return coalesce(new, old);
end;
$$;

create trigger on_private_vote_change
  after insert or update or delete on public.private_votes
  for each row execute function public.recalc_private_post_votes();

-- ============================================================
-- Row level security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.public_posts enable row level security;
alter table public.public_votes enable row level security;
alter table public.public_comments enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.private_posts enable row level security;
alter table public.private_votes enable row level security;
alter table public.private_comments enable row level security;
alter table public.notifications enable row level security;
alter table public.friendships enable row level security;
alter table public.aura_history enable row level security;
alter table public.reports enable row level security;

-- Membership helper used by group policies (security definer avoids
-- recursive RLS lookups on group_members).
create or replace function public.is_group_member(check_group_id uuid)
returns boolean
language sql
security definer set search_path = ''
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = check_group_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

-- profiles: readable by everyone; users manage their own row.
create policy "profiles are public" on public.profiles
  for select using (true);
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id);

-- public posts: active posts readable by everyone; owners insert/update.
create policy "active public posts are public" on public.public_posts
  for select using (status <> 'removed' or auth.uid() = user_id);
create policy "users create own posts" on public.public_posts
  for insert with check (auth.uid() = user_id);
create policy "users update own posts" on public.public_posts
  for update using (auth.uid() = user_id);
create policy "users delete own posts" on public.public_posts
  for delete using (auth.uid() = user_id);

-- public votes: visible to everyone; users vote as themselves, not on
-- their own posts; users can change/remove their own vote.
create policy "public votes are public" on public.public_votes
  for select using (true);
create policy "users vote on others posts" on public.public_votes
  for insert with check (
    auth.uid() = voter_id
    and not exists (
      select 1 from public.public_posts
      where id = post_id and user_id = auth.uid()
    )
  );
create policy "users update own votes" on public.public_votes
  for update using (auth.uid() = voter_id);
create policy "users remove own votes" on public.public_votes
  for delete using (auth.uid() = voter_id);

-- public comments
create policy "active comments are public" on public.public_comments
  for select using (status = 'active' or auth.uid() = user_id);
create policy "users comment as themselves" on public.public_comments
  for insert with check (auth.uid() = user_id);
create policy "users manage own comments" on public.public_comments
  for update using (auth.uid() = user_id);
create policy "users delete own comments" on public.public_comments
  for delete using (auth.uid() = user_id);

-- groups: visible to members; anyone authenticated can create.
create policy "members see their groups" on public.groups
  for select using (public.is_group_member(id) or created_by = auth.uid());
create policy "users create groups" on public.groups
  for insert with check (auth.uid() = created_by);
create policy "owner updates group" on public.groups
  for update using (auth.uid() = created_by);
create policy "owner deletes group" on public.groups
  for delete using (auth.uid() = created_by);

-- group members: members see the roster; users join as themselves
-- (invite-code validation happens in the application layer).
create policy "members see roster" on public.group_members
  for select using (
    user_id = auth.uid() or public.is_group_member(group_id)
  );
create policy "users join as themselves" on public.group_members
  for insert with check (auth.uid() = user_id);
create policy "users update own membership" on public.group_members
  for update using (auth.uid() = user_id);

-- private posts: members only; poster must be a member posting as
-- themselves, and the target must also be a group member.
create policy "members see group posts" on public.private_posts
  for select using (public.is_group_member(group_id));
create policy "members create incidents" on public.private_posts
  for insert with check (
    auth.uid() = posted_by_user_id
    and public.is_group_member(group_id)
    and exists (
      select 1 from public.group_members
      where group_id = private_posts.group_id
        and user_id = private_posts.target_user_id
        and status = 'active'
    )
  );
create policy "poster removes own incident" on public.private_posts
  for delete using (auth.uid() = posted_by_user_id);

-- private votes: members of the post's group only.
create policy "members see private votes" on public.private_votes
  for select using (
    public.is_group_member(
      (select group_id from public.private_posts where id = private_post_id)
    )
  );
create policy "members vote in their groups" on public.private_votes
  for insert with check (
    auth.uid() = voter_id
    and public.is_group_member(
      (select group_id from public.private_posts where id = private_post_id)
    )
  );
create policy "members update own private votes" on public.private_votes
  for update using (auth.uid() = voter_id);
create policy "members remove own private votes" on public.private_votes
  for delete using (auth.uid() = voter_id);

-- private comments: members of the post's group only.
create policy "members see private comments" on public.private_comments
  for select using (
    public.is_group_member(
      (select group_id from public.private_posts where id = private_post_id)
    )
  );
create policy "members comment in their groups" on public.private_comments
  for insert with check (
    auth.uid() = user_id
    and public.is_group_member(
      (select group_id from public.private_posts where id = private_post_id)
    )
  );

-- notifications: own only.
create policy "users see own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "users update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- friendships: either side can see; requester creates; either side updates.
create policy "parties see friendship" on public.friendships
  for select using (auth.uid() in (requester_id, receiver_id));
create policy "users send requests" on public.friendships
  for insert with check (auth.uid() = requester_id);
create policy "parties update friendship" on public.friendships
  for update using (auth.uid() in (requester_id, receiver_id));

-- aura history: own history only (group aura summaries come from
-- group_members, which members can already read).
create policy "users see own aura history" on public.aura_history
  for select using (auth.uid() = user_id);

-- reports: users file reports as themselves and see their own.
create policy "users see own reports" on public.reports
  for select using (auth.uid() = reporter_id);
create policy "users file reports" on public.reports
  for insert with check (auth.uid() = reporter_id);
