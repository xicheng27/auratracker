# Aura Tracker

A social voting app where you post daily moments — wins, fails, unexplainable
events — and other people vote whether you **gained or lost aura**.

- **Public Mode** — one post per day, the world votes, your aura moves with
  the vote ratio: `(up − down) / total × 100`.
- **Private Mode** — invite-only friend groups where members report aura
  incidents about themselves *or each other*, the group votes (base value
  50), and a per-group leaderboard keeps score.

Built with Next.js (App Router), React, Tailwind CSS, and Supabase.

## Pages

| Route | Page |
|---|---|
| `/` | Landing |
| `/signup`, `/login` | Auth |
| `/onboarding` | Profile setup |
| `/feed` | Public feed (filters + voting) |
| `/post/new` | Create daily public post |
| `/post/[id]` | Post detail, vote math, comments |
| `/groups` | Your private groups |
| `/groups/new` | Create group + invite code |
| `/groups/[id]` | Group feed, leaderboard, members |
| `/groups/[id]/post/new` | Report an aura incident |
| `/profile` | Aura stats, history chart, badges |
| `/leaderboard` | Global / friends / group rankings |
| `/notifications` | Notification feed |
| `/settings` | Profile, privacy, notifications, account |

## Getting started

```bash
npm install
npm run dev
```

Without Supabase credentials the app runs in **mock-data mode** — every page
works with placeholder data and client-side state.

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migration in `supabase/migrations/0001_initial_schema.sql`
   (SQL Editor → paste → run, or `supabase db push` with the CLI).
3. Copy `.env.example` to `.env.local` and fill in your project URL and anon
   key (Settings → API).
4. Restart the dev server. Sign-up, login (email or username), onboarding
   profile save, and logout now run against Supabase.

The schema includes all tables from the project brief (profiles, public
posts/votes/comments, groups, group members, private posts/votes/comments,
notifications, friendships, aura history, reports) with:

- **One public post per day** enforced by a unique index on `(user_id, post_date)`.
- **One vote per user per post** enforced by unique constraints.
- **No voting on your own public post** enforced by row-level security.
- **Vote tallies and aura scores** kept in sync by database triggers
  (base 100 public, base 50 private).
- **Self vs friend posts** enforced by a check constraint on poster/target.
- **Row-level security** on every table; private group content is only
  visible to active group members.

Feed, groups, profile, leaderboard, and notifications still read mock data
from `src/lib/` — each file mirrors its database table, so wiring them is a
straight swap.
