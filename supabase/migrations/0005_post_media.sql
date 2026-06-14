-- Aura Tracker — photo/video media on posts.
-- Extends the existing image_url support with an explicit media type so the
-- feed can render photos and videos differently. image_url is kept for
-- backward compatibility (treated as a photo when media_url is absent).

alter table public.public_posts
  add column if not exists media_url text,
  add column if not exists media_type text
    check (media_type in ('photo', 'video'));

alter table public.private_posts
  add column if not exists media_url text,
  add column if not exists media_type text
    check (media_type in ('photo', 'video'));

-- Backfill: existing image_url rows are photos.
update public.public_posts
  set media_url = image_url, media_type = 'photo'
  where image_url is not null and media_url is null;

update public.private_posts
  set media_url = image_url, media_type = 'photo'
  where image_url is not null and media_url is null;

-- Allow video MIME types and a larger size limit on the shared media bucket.
-- (Photos and videos both live in post-images.)
update storage.buckets
  set file_size_limit = 52428800, -- 50 MB
      allowed_mime_types = array[
        'image/jpeg', 'image/png', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/webm'
      ]
  where id = 'post-images';
