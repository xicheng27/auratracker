-- Aura Tracker — friends system support.
-- The friendships table ships in 0001; this adds friend-request
-- notification types, notification triggers, and unfriending.

-- Allow friend-request notification types.
alter table public.notifications
  drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check check (type in (
    'public_vote', 'private_vote', 'comment', 'group_invite',
    'friend_posted_about_you', 'aura_updated', 'trending_post',
    'daily_reminder', 'friend_request', 'friend_accepted'
  ));

-- Either party can unfriend (or the requester can cancel a pending request).
create policy "parties remove friendship" on public.friendships
  for delete using (auth.uid() in (requester_id, receiver_id));

-- Notify the receiver when a request arrives.
create or replace function public.notify_friend_request()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.notifications (user_id, type, title, message)
  values (
    new.receiver_id, 'friend_request', 'Friend request',
    format('@%s wants to be friends.',
      (select username from public.profiles where id = new.requester_id))
  );
  return new;
end;
$$;

create trigger on_friend_request_created
  after insert on public.friendships
  for each row execute function public.notify_friend_request();

-- Notify the requester when their request is accepted.
create or replace function public.notify_friend_accepted()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.status = 'accepted' and old.status = 'pending' then
    insert into public.notifications (user_id, type, title, message)
    values (
      new.requester_id, 'friend_accepted', 'Friend request accepted',
      format('@%s accepted your friend request.',
        (select username from public.profiles where id = new.receiver_id))
    );
  end if;
  return new;
end;
$$;

create trigger on_friend_request_accepted
  after update on public.friendships
  for each row execute function public.notify_friend_accepted();
