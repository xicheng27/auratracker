"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BottomNav, TopNav } from "@/components/app-nav";
import { PrivatePostCard } from "@/components/private-post-card";
import { formatAura } from "@/lib/aura";
import { mockMembers, mockPrivatePosts } from "@/lib/mock-group-detail";
import { mockGroups } from "@/lib/mock-groups";

const tabs = ["Feed", "Leaderboard", "Members"] as const;
type Tab = (typeof tabs)[number];

const currentUsername = "xicheng";

const medals = ["🥇", "🥈", "🥉"];

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const group = mockGroups.find((g) => g.id === id);
  const [tab, setTab] = useState<Tab>("Feed");
  const [copied, setCopied] = useState(false);

  if (!group) {
    return (
      <>
        <TopNav />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
          <div className="rounded-3xl border border-edge bg-card p-8 text-center">
            <p className="text-4xl">🔒</p>
            <h1 className="mt-4 text-xl font-bold tracking-tight">
              No such council
            </h1>
            <p className="mt-2 text-sm text-muted">
              This group doesn’t exist, or you’re not a member.
            </p>
            <Link
              href="/groups"
              className="mt-6 inline-block rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-soft"
            >
              Back to groups
            </Link>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  const members = [...(mockMembers[id] ?? [])].sort((a, b) => b.aura - a.aura);
  const posts = mockPrivatePosts[id] ?? [];

  async function copyCode() {
    if (!group) return;
    try {
      await navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the code is still visible to copy manually.
    }
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
        <Link
          href="/groups"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← All groups
        </Link>

        {/* Group header */}
        <div className="mt-4 rounded-2xl border border-edge bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-edge bg-background text-3xl">
                {group.icon}
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight tracking-tight">
                  {group.name}
                </h1>
                <p className="mt-0.5 text-xs text-muted">{group.description}</p>
              </div>
            </div>
            <button
              type="button"
              title="Group settings (coming soon)"
              className="rounded-xl border border-edge px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              ⚙
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-edge px-3 py-1.5 text-muted">
              {group.members} members
            </span>
            <button
              type="button"
              onClick={copyCode}
              className="rounded-full border border-edge px-3 py-1.5 font-mono font-semibold tracking-widest transition-colors hover:border-accent/50"
              title="Copy invite code"
            >
              {group.inviteCode}{" "}
              <span className="font-sans font-normal tracking-normal text-muted">
                {copied ? "copied ✓" : "· copy"}
              </span>
            </button>
            <span className="ml-auto rounded-full border border-edge px-3 py-1.5">
              your aura:{" "}
              <span
                className={`font-semibold ${
                  group.myAura >= 0 ? "text-positive" : "text-negative"
                }`}
              >
                {formatAura(group.myAura)}
              </span>
            </span>
          </div>
        </div>

        {/* New incident CTA */}
        <Link
          href={`/groups/${id}/post/new`}
          className="mt-4 flex items-center justify-between rounded-2xl border border-edge bg-card p-4 transition-colors hover:bg-card-hover"
        >
          <div>
            <p className="text-sm font-semibold">Report an aura incident</p>
            <p className="mt-0.5 text-xs text-muted">
              About yourself, or about a friend. The council decides.
            </p>
          </div>
          <span className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-background">
            + New
          </span>
        </Link>

        {/* Tabs */}
        <div className="mt-4 flex gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`flex-1 rounded-full border py-2 text-sm transition-colors ${
                tab === t
                  ? "border-accent bg-foreground font-semibold text-background"
                  : "border-edge bg-card text-muted hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Feed */}
        {tab === "Feed" && (
          <div className="mt-4 space-y-4">
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-edge bg-card p-8 text-center text-sm text-muted">
                No incidents reported yet. Suspiciously quiet.
              </div>
            ) : (
              posts.map((post) => <PrivatePostCard key={post.id} post={post} />)
            )}
          </div>
        )}

        {/* Leaderboard */}
        {tab === "Leaderboard" && (
          <ol className="mt-4 space-y-2">
            {members.map((member, i) => {
              const isMe = member.username === currentUsername;
              return (
                <li
                  key={member.username}
                  className={`flex items-center gap-3 rounded-2xl border p-4 ${
                    isMe ? "border-accent/60 bg-card" : "border-edge bg-card"
                  }`}
                >
                  <span className="w-8 text-center text-lg font-bold">
                    {medals[i] ?? <span className="text-muted">{i + 1}</span>}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-edge bg-background text-sm font-semibold">
                    {member.displayName[0]}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium">
                      {member.displayName}
                      {isMe && <span className="text-muted"> (you)</span>}
                    </p>
                    <p className="text-xs text-muted">@{member.username}</p>
                  </div>
                  <span
                    className={`font-bold ${
                      member.aura >= 0 ? "text-positive" : "text-negative"
                    }`}
                  >
                    {formatAura(member.aura)}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {/* Members */}
        {tab === "Members" && (
          <ul className="mt-4 space-y-2">
            {members.map((member) => (
              <li
                key={member.username}
                className="flex items-center gap-3 rounded-2xl border border-edge bg-card p-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-edge bg-background text-sm font-semibold">
                  {member.displayName[0]}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">
                    {member.displayName}
                    {member.username === currentUsername && (
                      <span className="text-muted"> (you)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted">@{member.username}</p>
                </div>
                {member.role !== "member" && (
                  <span className="rounded-full border border-edge px-2.5 py-1 text-[10px] font-semibold tracking-widest text-muted uppercase">
                    {member.role}
                  </span>
                )}
              </li>
            ))}
            <li className="pt-1 text-center">
              <button
                type="button"
                className="text-xs text-muted transition-colors hover:text-negative"
              >
                Leave group
              </button>
            </li>
          </ul>
        )}
      </main>
      <BottomNav />
    </>
  );
}
