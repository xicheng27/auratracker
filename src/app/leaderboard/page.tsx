"use client";

import { useState } from "react";
import { BottomNav, TopNav } from "@/components/app-nav";
import { formatAura } from "@/lib/aura";
import { mockMembers } from "@/lib/mock-group-detail";
import { mockGroups } from "@/lib/mock-groups";
import {
  mockRankings,
  mostControversialPost,
  type RankedUser,
} from "@/lib/mock-leaderboard";

const tabs = ["Global", "Friends", "Groups"] as const;
type Tab = (typeof tabs)[number];

const currentUsername = "xicheng";
const medals = ["🥇", "🥈", "🥉"];

function RankRow({
  rank,
  name,
  username,
  value,
  sub,
}: {
  rank: number;
  name: string;
  username: string;
  value: number;
  sub?: string;
}) {
  const isMe = username === currentUsername;
  return (
    <li
      className={`flex items-center gap-3 rounded-2xl border p-4 ${
        isMe ? "border-accent/60 bg-card" : "border-edge bg-card"
      }`}
    >
      <span className="w-8 text-center text-lg font-bold">
        {medals[rank - 1] ?? <span className="text-muted">{rank}</span>}
      </span>
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-edge bg-background text-sm font-semibold">
        {name[0]}
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium">
          {name}
          {isMe && <span className="text-muted"> (you)</span>}
        </p>
        <p className="text-xs text-muted">{sub ?? `@${username}`}</p>
      </div>
      <span
        className={`font-bold ${value >= 0 ? "text-positive" : "text-negative"}`}
      >
        {formatAura(value)}
      </span>
    </li>
  );
}

function Highlights({ users }: { users: RankedUser[] }) {
  if (users.length === 0) return null;
  const biggestGain = users.reduce((a, b) =>
    b.todayChange > a.todayChange ? b : a,
  );
  const biggestLoss = users.reduce((a, b) =>
    b.todayChange < a.todayChange ? b : a,
  );
  const longestStreak = users.reduce((a, b) =>
    b.streakDays > a.streakDays ? b : a,
  );

  const cards = [
    {
      label: "Biggest gain today",
      name: `@${biggestGain.username}`,
      value: formatAura(biggestGain.todayChange),
      positive: true,
    },
    {
      label: "Biggest loss today",
      name: `@${biggestLoss.username}`,
      value: formatAura(biggestLoss.todayChange),
      positive: false,
    },
    {
      label: "Longest streak",
      name: `@${longestStreak.username}`,
      value: `🔥 ${longestStreak.streakDays}d`,
      positive: true,
    },
  ];

  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-edge bg-card p-3 text-center"
        >
          <p className="text-[10px] tracking-wide text-muted uppercase">
            {card.label}
          </p>
          <p
            className={`mt-1 text-sm font-bold ${
              card.positive ? "text-positive" : "text-negative"
            }`}
          >
            {card.value}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted">{card.name}</p>
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("Global");
  const [groupId, setGroupId] = useState(mockGroups[0]?.id ?? "1");

  const global = [...mockRankings].sort((a, b) => b.totalAura - a.totalAura);
  const friends = global.filter(
    (u) => u.isFriend || u.username === currentUsername,
  );
  const groupMembers = [...(mockMembers[groupId] ?? [])].sort(
    (a, b) => b.aura - a.aura,
  );

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
        <h1 className="text-xl font-bold tracking-tight">Leaderboard</h1>
        <p className="mt-1 text-sm text-muted">
          The aura economy, ranked. No appeals.
        </p>

        {/* Tabs */}
        <div className="mt-5 flex gap-2">
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

        {tab !== "Groups" && (
          <>
            <Highlights users={tab === "Global" ? global : friends} />

            {/* Most controversial */}
            {tab === "Global" && (
              <div className="mt-2 rounded-2xl border border-edge bg-card p-4">
                <p className="text-[10px] tracking-wide text-muted uppercase">
                  Most controversial today
                </p>
                <p className="mt-1.5 text-sm font-medium">
                  “{mostControversialPost.title}”
                </p>
                <p className="mt-1 text-xs text-muted">
                  @{mostControversialPost.username} ·{" "}
                  {mostControversialPost.upPercent}% gained /{" "}
                  {100 - mostControversialPost.upPercent}% lost ·{" "}
                  {mostControversialPost.totalVotes} votes
                </p>
              </div>
            )}

            <ol className="mt-4 space-y-2">
              {(tab === "Global" ? global : friends).map((user, i) => (
                <RankRow
                  key={user.username}
                  rank={i + 1}
                  name={user.displayName}
                  username={user.username}
                  value={user.totalAura}
                  sub={`@${user.username} · 🔥 ${user.streakDays}d streak`}
                />
              ))}
            </ol>
          </>
        )}

        {tab === "Groups" && (
          <>
            {/* Group selector */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {mockGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setGroupId(group.id)}
                  aria-pressed={groupId === group.id}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    groupId === group.id
                      ? "border-accent bg-foreground font-semibold text-background"
                      : "border-edge bg-card text-muted hover:text-foreground"
                  }`}
                >
                  {group.icon} {group.name}
                </button>
              ))}
            </div>

            <ol className="mt-4 space-y-2">
              {groupMembers.map((member, i) => (
                <RankRow
                  key={member.username}
                  rank={i + 1}
                  name={member.displayName}
                  username={member.username}
                  value={member.aura}
                />
              ))}
            </ol>
          </>
        )}
      </main>
      <BottomNav />
    </>
  );
}
