"use client";

import { useState } from "react";
import { auraChange, formatAura, upVotePercent } from "@/lib/aura";
import { CommentIcon } from "@/components/icons";
import type { PrivatePost } from "@/lib/mock-group-detail";

const PRIVATE_BASE_AURA = 50;

type Vote = "up" | "down" | null;

export function PrivatePostCard({ post }: { post: PrivatePost }) {
  const [vote, setVote] = useState<Vote>(null);

  const upVotes = post.upVotes + (vote === "up" ? 1 : 0);
  const downVotes = post.downVotes + (vote === "down" ? 1 : 0);
  const score = auraChange(upVotes, downVotes, PRIVATE_BASE_AURA);
  const upPercent = upVotePercent(upVotes, downVotes);
  const gained = score >= 0;
  const isSelfPost = post.type === "self_post";

  function toggle(next: Exclude<Vote, null>) {
    // TODO: persist the vote (one per member per post) once the backend exists.
    setVote((prev) => (prev === next ? null : next));
  }

  return (
    <article className="rounded-2xl border border-edge bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-edge bg-background text-sm font-semibold">
            {post.target[0].toUpperCase()}
          </div>
          <div className="text-sm leading-tight">
            {isSelfPost ? (
              <p>
                <span className="font-medium">@{post.postedBy}</span>
                <span className="text-muted"> on themselves</span>
              </p>
            ) : (
              <p>
                <span className="text-muted">Posted by </span>
                <span className="font-medium">@{post.postedBy}</span>
              </p>
            )}
            <p className="text-xs text-muted">
              {!isSelfPost && (
                <>
                  Target:{" "}
                  <span className="font-medium text-foreground">
                    @{post.target}
                  </span>{" "}
                  ·{" "}
                </>
              )}
              {post.timeAgo}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium ${
            isSelfPost
              ? "border-edge text-muted"
              : "border-accent/40 text-foreground"
          }`}
        >
          {isSelfPost ? "Self report" : "Friend report"}
        </span>
      </div>

      <p className="mt-3.5 leading-relaxed">“{post.description}”</p>

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

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className={`font-semibold ${gained ? "text-positive" : "text-negative"}`}>
          {formatAura(score)} aura for @{post.target}
        </span>
        <span className="text-xs text-muted">
          {upVotes + downVotes === 0
            ? "No votes yet"
            : gained
              ? `${upPercent}% said gained`
              : `${100 - upPercent}% said lost`}
          {vote && " · you voted"}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 border-t border-edge pt-3 text-xs text-muted">
        <CommentIcon className="h-4 w-4" /> {post.comments} comments
      </div>
    </article>
  );
}
