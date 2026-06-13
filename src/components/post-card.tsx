"use client";

import { useState } from "react";
import Link from "next/link";
import { castPublicVote, type Vote } from "@/lib/api";
import { auraChange, formatAura, upVotePercent } from "@/lib/aura";
import { ConfettiBurst } from "@/components/confetti-burst";
import { CommentIcon, ShareIcon } from "@/components/icons";
import type { PublicPost } from "@/lib/mock-posts";

export function PostCard({ post }: { post: PublicPost }) {
  const [vote, setVote] = useState<Vote>(post.myVote ?? null);
  const [feedback, setFeedback] = useState<"gain" | "loss" | null>(null);
  const [burst, setBurst] = useState(0);

  // The fetched counts already include the user's persisted vote, so only
  // offset them when the local choice differs from what was fetched.
  const initial = post.myVote ?? null;
  const upVotes =
    post.upVotes + (vote === "up" ? 1 : 0) - (initial === "up" ? 1 : 0);
  const downVotes =
    post.downVotes + (vote === "down" ? 1 : 0) - (initial === "down" ? 1 : 0);
  const score = auraChange(upVotes, downVotes);
  const upPercent = upVotePercent(upVotes, downVotes);
  const gained = score >= 0;

  function toggle(next: Exclude<Vote, null>) {
    const resolved = vote === next ? null : next;
    setVote(resolved);
    void castPublicVote(post.id, resolved);

    // Celebrate a fresh +Aura, shake on a fresh −Aura; no effect on un-voting.
    if (resolved === "up") {
      setFeedback("gain");
      setBurst((n) => n + 1);
    } else if (resolved === "down") {
      setFeedback("loss");
    } else {
      setFeedback(null);
    }
  }

  return (
    <article
      onAnimationEnd={() => setFeedback(null)}
      className={`relative rounded-2xl border border-edge bg-card p-5 transition-colors hover:bg-card-hover ${
        feedback === "gain" ? "aura-gain" : feedback === "loss" ? "aura-loss" : ""
      }`}
    >
      {feedback === "gain" && <ConfettiBurst key={burst} />}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-edge bg-background text-sm font-semibold">
            {post.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              post.username[0].toUpperCase()
            )}
          </div>
          <div className="text-sm">
            <span className="font-medium">@{post.username}</span>
            <span className="text-muted"> · {post.timeAgo}</span>
          </div>
        </div>
        <span className="rounded-full border border-edge px-2.5 py-1 text-xs text-muted">
          {post.category}
        </span>
      </div>

      <Link href={`/post/${post.id}`} className="mt-4 block">
        <h3 className="font-semibold leading-snug">“{post.title}”</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {post.description}
        </p>
        {post.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrl}
            alt="Post attachment"
            className="mt-3 max-h-80 w-full rounded-xl border border-edge object-cover"
          />
        )}
      </Link>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => toggle("up")}
          aria-pressed={vote === "up"}
          className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${
            vote === "up"
              ? "bg-foreground text-background"
              : "border border-edge text-foreground hover:bg-card-hover"
          }`}
        >
          + Aura
        </button>
        <button
          type="button"
          onClick={() => toggle("down")}
          aria-pressed={vote === "down"}
          className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${
            vote === "down"
              ? "bg-foreground text-background"
              : "border border-edge text-muted hover:bg-card-hover hover:text-foreground"
          }`}
        >
          − Aura
        </button>
      </div>

      {/* Vote ratio bar */}
      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-edge">
          <div
            className="h-full rounded-full bg-foreground transition-all"
            style={{ width: `${upPercent}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span
            key={score}
            className={`inline-block font-semibold aura-pop ${gained ? "text-positive" : "text-negative"}`}
          >
            {formatAura(score)} aura
          </span>
          <span className="text-muted">
            {gained ? `${upPercent}% said aura gained` : `${100 - upPercent}% said aura lost`}
            {vote && " · you voted"}
          </span>
        </div>
      </div>

      <div className="mt-3 flex gap-5 border-t border-edge pt-3 text-xs text-muted">
        <Link
          href={`/post/${post.id}`}
          className="flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <CommentIcon className="h-4 w-4" /> {post.comments} comments
        </Link>
        <button
          type="button"
          className="flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <ShareIcon className="h-4 w-4" /> Share
        </button>
      </div>
    </article>
  );
}
