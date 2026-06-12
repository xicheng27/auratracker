"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BottomNav, TopNav } from "@/components/app-nav";
import { CommentIcon, ShareIcon } from "@/components/icons";
import { auraChange, formatAura, upVotePercent } from "@/lib/aura";
import { mockComments, type PostComment } from "@/lib/mock-comments";
import { mockPosts } from "@/lib/mock-posts";

type Vote = "up" | "down" | null;

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const post = mockPosts.find((p) => p.id === id);

  const [vote, setVote] = useState<Vote>(null);
  const [comments, setComments] = useState<PostComment[]>(
    () => mockComments[id] ?? [],
  );
  const [draft, setDraft] = useState("");
  const [reported, setReported] = useState(false);

  if (!post) {
    return (
      <>
        <TopNav />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
          <div className="rounded-3xl border border-edge bg-card p-8 text-center">
            <p className="text-4xl">👻</p>
            <h1 className="mt-4 text-xl font-bold tracking-tight">
              This post has no aura
            </h1>
            <p className="mt-2 text-sm text-muted">
              It doesn’t exist, or it was removed.
            </p>
            <Link
              href="/feed"
              className="mt-6 inline-block rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-soft"
            >
              Back to the feed
            </Link>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  const upVotes = post.upVotes + (vote === "up" ? 1 : 0);
  const downVotes = post.downVotes + (vote === "down" ? 1 : 0);
  const totalVotes = upVotes + downVotes;
  const score = auraChange(upVotes, downVotes);
  const upPercent = upVotePercent(upVotes, downVotes);
  const gained = score >= 0;
  const ratio = totalVotes === 0 ? 0 : (upVotes - downVotes) / totalVotes;

  function toggle(next: Exclude<Vote, null>) {
    // TODO: persist the vote (one per user per post) once the backend exists.
    setVote((prev) => (prev === next ? null : next));
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    // TODO: persist the comment once the backend exists.
    setComments((prev) => [
      ...prev,
      { id: `local-${prev.length}`, username: "xicheng", timeAgo: "now", text },
    ]);
    setDraft("");
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
        <Link
          href="/feed"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Back to feed
        </Link>

        {/* Full post */}
        <article className="mt-4 rounded-2xl border border-edge bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-edge bg-background text-sm font-semibold">
                {post.username[0].toUpperCase()}
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

          <h1 className="mt-5 text-xl font-bold leading-snug tracking-tight">
            “{post.title}”
          </h1>
          <p className="mt-2 leading-relaxed text-muted">{post.description}</p>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => toggle("up")}
              aria-pressed={vote === "up"}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-colors ${
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
              className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-colors ${
                vote === "down"
                  ? "bg-foreground text-background"
                  : "border border-edge text-muted hover:bg-card-hover hover:text-foreground"
              }`}
            >
              − Aura
            </button>
          </div>

          <div className="mt-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-edge">
              <div
                className="h-full rounded-full bg-foreground transition-all"
                style={{ width: `${upPercent}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span
                className={`text-lg font-bold ${gained ? "text-positive" : "text-negative"}`}
              >
                {formatAura(score)} aura
              </span>
              <span className="text-muted">
                {gained
                  ? `${upPercent}% said aura gained`
                  : `${100 - upPercent}% said aura lost`}
                {vote && " · you voted"}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-5 border-t border-edge pt-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <CommentIcon className="h-4 w-4" /> {comments.length} comments
            </span>
            <button
              type="button"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <ShareIcon className="h-4 w-4" /> Share
            </button>
            <button
              type="button"
              onClick={() => setReported(true)}
              disabled={reported}
              className="ml-auto transition-colors hover:text-foreground disabled:cursor-default"
            >
              {reported ? "Reported ✓" : "Report"}
            </button>
          </div>
        </article>

        {/* Aura calculation */}
        <section className="mt-4 rounded-2xl border border-edge bg-card p-6">
          <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">
            The math
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-edge bg-background p-3">
              <p className="text-lg font-bold">{upVotes}</p>
              <p className="mt-0.5 text-xs text-muted">aura gained</p>
            </div>
            <div className="rounded-xl border border-edge bg-background p-3">
              <p className="text-lg font-bold">{downVotes}</p>
              <p className="mt-0.5 text-xs text-muted">aura lost</p>
            </div>
            <div className="rounded-xl border border-edge bg-background p-3">
              <p className="text-lg font-bold">{totalVotes}</p>
              <p className="mt-0.5 text-xs text-muted">total votes</p>
            </div>
          </div>
          <p className="mt-4 rounded-xl border border-edge bg-background p-3 text-center font-mono text-xs text-muted">
            ({upVotes} − {downVotes}) / {totalVotes} × 100 ={" "}
            <span className="font-semibold text-foreground">
              {formatAura(Math.round(ratio * 100))} aura
            </span>
          </p>
          <p className="mt-3 text-center text-xs text-muted">
            Voting closes 24 hours after posting. Final aura locks in then.
          </p>
        </section>

        {/* Comments */}
        <section className="mt-4 rounded-2xl border border-edge bg-card p-6">
          <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">
            Comments
          </h2>

          <form onSubmit={handleComment} className="mt-4 flex gap-2">
            <input
              type="text"
              maxLength={280}
              placeholder="Add your verdict…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-edge bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent-soft disabled:opacity-40"
            >
              Send
            </button>
          </form>

          <ul className="mt-5 space-y-4">
            {comments.length === 0 && (
              <li className="text-sm text-muted">
                No comments yet. Be the first to judge.
              </li>
            )}
            {comments.map((comment) => (
              <li key={comment.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-edge bg-background text-xs font-semibold">
                  {comment.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted">
                    <span className="font-medium text-foreground">
                      @{comment.username}
                    </span>{" "}
                    · {comment.timeAgo}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{comment.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
