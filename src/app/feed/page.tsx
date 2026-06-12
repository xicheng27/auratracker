"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav, TopNav } from "@/components/app-nav";
import { PostCard } from "@/components/post-card";
import { auraChange } from "@/lib/aura";
import { mockPosts, type PublicPost } from "@/lib/mock-posts";

const filters = [
  "Trending",
  "New",
  "Friends",
  "Most aura gained",
  "Most aura lost",
] as const;

type Filter = (typeof filters)[number];

function applyFilter(posts: PublicPost[], filter: Filter): PublicPost[] {
  const sorted = [...posts];
  switch (filter) {
    case "Trending":
      return sorted.sort(
        (a, b) => b.upVotes + b.downVotes - (a.upVotes + a.downVotes),
      );
    case "New":
      return sorted.sort((a, b) => a.hoursAgo - b.hoursAgo);
    case "Friends":
      return sorted
        .filter((p) => p.isFriend)
        .sort((a, b) => a.hoursAgo - b.hoursAgo);
    case "Most aura gained":
      return sorted.sort(
        (a, b) =>
          auraChange(b.upVotes, b.downVotes) - auraChange(a.upVotes, a.downVotes),
      );
    case "Most aura lost":
      return sorted.sort(
        (a, b) =>
          auraChange(a.upVotes, a.downVotes) - auraChange(b.upVotes, b.downVotes),
      );
  }
}

export default function FeedPage() {
  const [filter, setFilter] = useState<Filter>("Trending");
  // Placeholder until the daily-post check comes from the database.
  const hasPostedToday = false;
  const posts = applyFilter(mockPosts, filter);

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
        {/* Daily post prompt */}
        {hasPostedToday ? (
          <div className="rounded-2xl border border-edge bg-card p-4 text-sm text-muted">
            You’ve already posted your public aura moment today. Come back
            tomorrow.
          </div>
        ) : (
          <Link
            href="/post/new"
            className="flex items-center justify-between rounded-2xl border border-edge bg-card p-4 transition-colors hover:bg-card-hover"
          >
            <div>
              <p className="text-sm font-semibold">
                You haven’t posted today.
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Drop your daily moment and let the people judge.
              </p>
            </div>
            <span className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-background">
              Post now
            </span>
          </Link>
        )}

        {/* Filter tabs */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors ${
                filter === f
                  ? "border-accent bg-foreground font-semibold text-background"
                  : "border-edge bg-card text-muted hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="mt-4 space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-edge bg-card p-8 text-center text-sm text-muted">
              Nothing here yet. Your friends are keeping a low profile.
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
