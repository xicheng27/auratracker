"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav, TopNav } from "@/components/app-nav";
import { fetchProfileData, type ProfileData } from "@/lib/api";
import { formatAura } from "@/lib/aura";
import { auraTitle } from "@/lib/mock-profile";

function AuraChart({ history }: { history: number[] }) {
  const width = 600;
  const height = 160;
  const mid = height / 2;
  const max = Math.max(...history.map(Math.abs), 1);
  const barWidth = width / history.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-3 w-full"
      role="img"
      aria-label="Aura change over the last days"
    >
      <line
        x1="0"
        y1={mid}
        x2={width}
        y2={mid}
        className="stroke-edge"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      {history.map((value, i) => {
        const barHeight = (Math.abs(value) / max) * (mid - 12);
        const x = i * barWidth + barWidth * 0.22;
        const y = value >= 0 ? mid - barHeight : mid;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth * 0.56}
              height={Math.max(barHeight, 2)}
              rx={3}
              className={value >= 0 ? "fill-foreground" : "fill-muted/40"}
            />
            <text
              x={x + barWidth * 0.28}
              y={value >= 0 ? y - 6 : y + barHeight + 14}
              textAnchor="middle"
              className={`text-[11px] ${value >= 0 ? "fill-foreground" : "fill-muted"}`}
            >
              {value >= 0 ? `+${value}` : `−${Math.abs(value)}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData().then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  if (loading || !profile) {
    return (
      <>
        <TopNav />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
          <div className="rounded-2xl border border-edge bg-card p-8 text-center text-sm text-muted">
            {loading ? "Reading your aura…" : "Log in to see your profile."}
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  const title = auraTitle(profile.totalPublicAura);

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
        {/* Identity */}
        <section className="rounded-2xl border border-edge bg-card p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-accent/30 blur-md aura-pulse" />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-edge bg-background text-xl font-bold">
                  {profile.displayName[0]}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight tracking-tight">
                  {profile.displayName}
                </h1>
                <p className="text-sm text-muted">@{profile.username}</p>
                <span className="mt-1.5 inline-block rounded-full border border-accent/40 px-2.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase">
                  {title}
                </span>
              </div>
            </div>
            <Link
              href="/settings"
              className="rounded-xl border border-edge px-3 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground"
            >
              Edit profile
            </Link>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {profile.bio}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-edge bg-background p-4 text-center">
              <p className="text-2xl font-bold text-positive [text-shadow:0_0_24px_rgba(255,255,255,0.35)]">
                {formatAura(profile.totalPublicAura)}
              </p>
              <p className="mt-0.5 text-xs text-muted">total public aura</p>
            </div>
            <div className="rounded-xl border border-edge bg-background p-4 text-center">
              <p className="text-2xl font-bold">🔥 {profile.streakDays}</p>
              <p className="mt-0.5 text-xs text-muted">day posting streak</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-4 grid grid-cols-3 gap-3">
          {[
            { value: profile.postCount, label: "posts" },
            { value: profile.votesReceived.toLocaleString("en-US"), label: "votes received" },
            { value: profile.votesGiven.toLocaleString("en-US"), label: "votes given" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-edge bg-card p-4 text-center"
            >
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="mt-0.5 text-xs text-muted">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Badges */}
        <section className="mt-4 rounded-2xl border border-edge bg-card p-5">
          <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">
            Badges
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.badges.map((badge) => (
              <span
                key={badge.label}
                className="rounded-full border border-edge bg-background px-3.5 py-1.5 text-sm"
              >
                {badge.emoji} {badge.label}
              </span>
            ))}
          </div>
        </section>

        {/* Aura chart */}
        <section className="mt-4 rounded-2xl border border-edge bg-card p-5">
          <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">
            Aura — last {profile.auraHistory.length} days
          </h2>
          <AuraChart history={profile.auraHistory} />
        </section>

        {/* Best / worst */}
        <section className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-edge bg-card p-5">
            <p className="text-xs font-semibold tracking-widest text-muted uppercase">
              Best moment
            </p>
            <p className="mt-2 text-sm leading-snug font-medium">
              “{profile.bestMoment.title}”
            </p>
            <p className="mt-2 font-bold text-positive">
              {formatAura(profile.bestMoment.aura)} aura
            </p>
          </div>
          <div className="rounded-2xl border border-edge bg-card p-5">
            <p className="text-xs font-semibold tracking-widest text-muted uppercase">
              Worst moment
            </p>
            <p className="mt-2 text-sm leading-snug font-medium">
              “{profile.worstMoment.title}”
            </p>
            <p className="mt-2 font-bold text-negative">
              {formatAura(profile.worstMoment.aura)} aura
            </p>
          </div>
        </section>

        {/* Group aura summaries */}
        <section className="mt-4 rounded-2xl border border-edge bg-card p-5">
          <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">
            Group aura
          </h2>
          <ul className="mt-3 space-y-2">
            {profile.groupAura.map((group) => (
              <li key={group.id}>
                <Link
                  href={`/groups/${group.id}`}
                  className="flex items-center justify-between rounded-xl border border-edge bg-background px-4 py-3 transition-colors hover:bg-card-hover"
                >
                  <span className="flex items-center gap-2.5 text-sm">
                    <span className="text-lg">{group.icon}</span>
                    <span className="font-medium">{group.name}</span>
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      group.myAura >= 0 ? "text-positive" : "text-negative"
                    }`}
                  >
                    {formatAura(group.myAura)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Recent posts */}
        <section className="mt-4 rounded-2xl border border-edge bg-card p-5">
          <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">
            Recent posts
          </h2>
          <ul className="mt-3 space-y-2">
            {profile.recentPosts.map((post) => (
              <li
                key={post.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-edge bg-background px-4 py-3"
              >
                <div className="min-w-0 text-sm">
                  <p className="truncate font-medium">“{post.title}”</p>
                  <p className="mt-0.5 text-xs text-muted">{post.daysAgo}</p>
                </div>
                <span
                  className={`shrink-0 text-sm font-bold ${
                    post.aura >= 0 ? "text-positive" : "text-negative"
                  }`}
                >
                  {formatAura(post.aura)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
