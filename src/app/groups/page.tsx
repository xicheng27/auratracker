"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav, TopNav } from "@/components/app-nav";
import { formatAura } from "@/lib/aura";
import { mockGroups } from "@/lib/mock-groups";

export default function GroupsPage() {
  const [joinOpen, setJoinOpen] = useState(false);
  const [code, setCode] = useState("");
  const [joinMessage, setJoinMessage] = useState<string | null>(null);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{4,10}$/.test(trimmed)) {
      setJoinMessage("Codes are 4–10 letters and numbers. Check with your friend.");
      return;
    }
    // TODO: look up the invite code and join the group once the backend exists.
    setJoinMessage(`No group found for “${trimmed}” yet. Codes go live with the backend.`);
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Your groups</h1>
            <p className="mt-1 text-sm text-muted">
              Private councils. Separate aura. No mercy.
            </p>
          </div>
          <Link
            href="/groups/new"
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent-soft"
          >
            + Create
          </Link>
        </div>

        {/* Join with code */}
        <div className="mt-5 rounded-2xl border border-edge bg-card p-4">
          {joinOpen ? (
            <form onSubmit={handleJoin} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  maxLength={10}
                  placeholder="Invite code, e.g. MPAC42"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setJoinMessage(null);
                  }}
                  className="min-w-0 flex-1 rounded-xl border border-edge bg-background px-4 py-2.5 text-sm tracking-widest uppercase outline-none transition-colors placeholder:normal-case placeholder:tracking-normal placeholder:text-muted/60 focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={!code.trim()}
                  className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent-soft disabled:opacity-40"
                >
                  Join
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setJoinOpen(false);
                    setCode("");
                    setJoinMessage(null);
                  }}
                  className="rounded-xl border border-edge px-3 py-2.5 text-sm text-muted transition-colors hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              {joinMessage && (
                <p className="text-xs text-muted">{joinMessage}</p>
              )}
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setJoinOpen(true)}
              className="flex w-full items-center justify-between text-sm"
            >
              <span>
                <span className="font-semibold">Join a group</span>
                <span className="text-muted"> — got an invite code?</span>
              </span>
              <span className="rounded-xl border border-edge px-3 py-1.5 text-xs font-medium text-muted">
                Enter code
              </span>
            </button>
          )}
        </div>

        {/* Group cards */}
        <div className="mt-4 space-y-4">
          {mockGroups.length === 0 ? (
            <div className="rounded-2xl border border-edge bg-card p-8 text-center text-sm text-muted">
              No groups yet. Create one and start judging your friends
              properly.
            </div>
          ) : (
            mockGroups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="block rounded-2xl border border-edge bg-card p-5 transition-colors hover:bg-card-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-edge bg-background text-2xl">
                      {group.icon}
                    </div>
                    <div>
                      <h2 className="font-semibold leading-tight">
                        {group.name}
                      </h2>
                      <p className="mt-0.5 text-xs text-muted">
                        {group.members} members · active {group.lastActive}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`font-bold ${
                        group.myAura >= 0 ? "text-positive" : "text-negative"
                      }`}
                    >
                      {formatAura(group.myAura)}
                    </p>
                    <p className="text-[10px] text-muted">your aura here</p>
                  </div>
                </div>
                <p className="mt-3 rounded-xl border border-edge bg-background px-3.5 py-2.5 text-xs leading-relaxed text-muted">
                  {group.recentActivity}
                </p>
              </Link>
            ))
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
