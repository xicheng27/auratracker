-- Aura Tracker — aura settlement and notification generation
-- Keeps profile totals and group scores in sync with post scores, closes
-- public posts after their 24-hour voting window, records aura history,
-- and generates notifications from activity.

-- ============================================================
-- Total public aura: recompute the author's total whenever one of their
-- posts changes score or status.
-- ============================================================
create or replace function public.sync_total_public_aura()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT'
     or new.aura_score is distinct from old.aura_score
     or new.status is distinct from old.status then
    update public.profiles set
      total_public_aura = coalesce((
        select sum(aura_score) from public.public_posts
        where user_id = new.user_id and status in ('active', 'closed')
      ), 0),
      updated_at = now()
    where id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger on_public_post_aura_change
  after insert or update on public.public_posts
  for each row execute function public.sync_total_public_aura();

-- ============================================================
-- Group aura: recompute the target's score in the group whenever an
-- incident about them changes score or status.
-- ============================================================
create or replace function public.sync_group_aura()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT'
     or new.aura_score is distinct from old.aura_score
     or new.status is distinct from old.status then
    update public.group_members set
      group_aura_score = coalesce((
        select sum(aura_score) from public.private_posts
        where group_id = new.group_id
          and target_user_id = new.target_user_id
          and status in ('active', 'closed')
      ), 0)
    where group_id = new.group_id and user_id = new.target_user_id;
  end if;
  return new;
end;
$$;

create trigger on_private_post_aura_change
  after insert or update on public.private_posts
  for each row execute function public.sync_group_aura();

-- ============================================================
-- Close expired public posts: lock final aura after the 24-hour voting
-- window, record aura history, and notify the author.
-- Schedule via pg_cron below (or call manually / from an edge function).
-- ============================================================
create or replace function public.close_expired_public_posts()
returns integer
language plpgsql
security definer set search_path = ''
as $$
declare
  expired record;
  closed_count integer := 0;
  current_total integer;
begin
  for expired in
    select id, user_id, title, aura_score from public.public_posts
    where status = 'active' and expires_at <= now()
    for update skip locked
  loop
    update public.public_posts
    set status = 'closed', updated_at = now()
    where id = expired.id;

    select total_public_aura into current_total
    from public.profiles where id = expired.user_id;

    insert into public.aura_history
      (user_id, source_type, source_id, aura_change, previous_score, new_score)
    values (
      expired.user_id, 'public_post', expired.id, expired.aura_score,
      current_total - expired.aura_score, current_total
    );

    insert into public.notifications
      (user_id, type, title, message, related_post_id)
    values (
      expired.user_id, 'aura_updated', 'Voting closed',
      format('“%s” locked in at %s%s aura.',
        expired.title,
        case when expired.aura_score > 0 then '+' else '' end,
        expired.aura_score),
      expired.id
    );

    closed_count := closed_count + 1;
  end loop;
  return closed_count;
end;
$$;

-- Run the closer every 15 minutes. pg_cron ships with Supabase; enable it
-- under Database → Extensions if this statement fails.
create extension if not exists pg_cron;
select cron.schedule(
  'close-expired-aura-posts',
  '*/15 * * * *',
  $$select public.close_expired_public_posts()$$
);

-- ============================================================
-- Notification: someone posted about you in a group.
-- ============================================================
create or replace function public.notify_friend_posted_about_you()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.post_type = 'friend_post' then
    insert into public.notifications
      (user_id, type, title, message, related_group_id)
    values (
      new.target_user_id, 'friend_posted_about_you',
      'Someone posted about you',
      format('@%s reported an incident about you: “%s”',
        (select username from public.profiles where id = new.posted_by_user_id),
        left(new.description, 120)),
      new.group_id
    );
  end if;
  return new;
end;
$$;

create trigger on_friend_post_created
  after insert on public.private_posts
  for each row execute function public.notify_friend_posted_about_you();

-- ============================================================
-- Notification: votes on your public post. Deduped — no new notification
-- while an unread one for the same post exists.
-- ============================================================
create or replace function public.notify_public_vote()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  post_owner uuid;
  post_title text;
begin
  select user_id, title into post_owner, post_title
  from public.public_posts where id = new.post_id;

  if post_owner is not null and post_owner <> new.voter_id
     and not exists (
       select 1 from public.notifications
       where user_id = post_owner and type = 'public_vote'
         and related_post_id = new.post_id and is_read = false
     ) then
    insert into public.notifications
      (user_id, type, title, message, related_post_id)
    values (
      post_owner, 'public_vote', 'Votes are coming in',
      format('People are voting on “%s”.', post_title),
      new.post_id
    );
  end if;
  return new;
end;
$$;

create trigger on_public_vote_created
  after insert on public.public_votes
  for each row execute function public.notify_public_vote();

-- ============================================================
-- Notification: votes on a private incident about you. Same dedupe.
-- ============================================================
create or replace function public.notify_private_vote()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  target uuid;
  gid uuid;
begin
  select target_user_id, group_id into target, gid
  from public.private_posts where id = new.private_post_id;

  if target is not null and target <> new.voter_id
     and not exists (
       select 1 from public.notifications
       where user_id = target and type = 'private_vote'
         and related_group_id = gid and is_read = false
     ) then
    insert into public.notifications
      (user_id, type, title, message, related_group_id)
    values (
      target, 'private_vote', 'The council is voting',
      'Members are voting on an incident about you.',
      gid
    );
  end if;
  return new;
end;
$$;

create trigger on_private_vote_created
  after insert on public.private_votes
  for each row execute function public.notify_private_vote();

-- ============================================================
-- Notification: comments on your public post.
-- ============================================================
create or replace function public.notify_public_comment()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  post_owner uuid;
  post_title text;
begin
  select user_id, title into post_owner, post_title
  from public.public_posts where id = new.post_id;

  if post_owner is not null and post_owner <> new.user_id then
    insert into public.notifications
      (user_id, type, title, message, related_post_id)
    values (
      post_owner, 'comment', 'New comment',
      format('@%s on “%s”: “%s”',
        (select username from public.profiles where id = new.user_id),
        post_title, left(new.comment_text, 80)),
      new.post_id
    );
  end if;
  return new;
end;
$$;

create trigger on_public_comment_created
  after insert on public.public_comments
  for each row execute function public.notify_public_comment();
