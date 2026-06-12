"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav, TopNav } from "@/components/app-nav";

const groupIcons = ["✦", "🏛️", "📚", "🏀", "🎮", "🍜", "🦍", "🐸", "👑", "💀", "🔥", "🧊"];

// Placeholder friend list until the friends system exists.
const mockFriends = [
  { username: "lucas", displayName: "Lucas" },
  { username: "jayden", displayName: "Jayden" },
  { username: "isaac", displayName: "Isaac" },
  { username: "joash", displayName: "Joash" },
  { username: "mei_ling", displayName: "Mei Ling" },
];

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export default function CreateGroupPage() {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(groupIcons[0]);
  const [description, setDescription] = useState("");
  const [invited, setInvited] = useState<string[]>([]);
  const [nameError, setNameError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function toggleInvite(username: string) {
    setInvited((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : [...prev, username],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Your council needs a name.");
      return;
    }
    // TODO: create the group and persist invites once the backend exists.
    setInviteCode(generateInviteCode());
  }

  async function copyCode() {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — code is still visible to copy manually.
    }
  }

  if (inviteCode) {
    return (
      <>
        <TopNav />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
          <div className="rounded-3xl border border-edge bg-card p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-edge bg-background text-3xl">
              {icon}
            </div>
            <h1 className="mt-4 text-xl font-bold tracking-tight">
              {name.trim()} is live
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              {invited.length > 0
                ? `Invites sent to ${invited.length} friend${invited.length > 1 ? "s" : ""}. `
                : ""}
              Share this code so people can join:
            </p>

            <button
              type="button"
              onClick={copyCode}
              className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-edge bg-background px-6 py-3.5 font-mono text-2xl font-bold tracking-[0.3em] transition-colors hover:border-accent/50"
              title="Copy invite code"
            >
              {inviteCode}
              <span className="text-xs font-sans font-medium tracking-normal text-muted">
                {copied ? "Copied ✓" : "Copy"}
              </span>
            </button>

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/groups/1"
                className="w-full rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-soft sm:w-auto"
              >
                Open the group
              </Link>
              <Link
                href="/groups"
                className="w-full rounded-2xl border border-edge px-6 py-3 text-sm font-semibold transition-colors hover:bg-card-hover sm:w-auto"
              >
                Back to groups
              </Link>
            </div>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
        <Link
          href="/groups"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Back to groups
        </Link>
        <h1 className="mt-3 text-xl font-bold tracking-tight">
          Create a group
        </h1>
        <p className="mt-1 text-sm text-muted">
          Assemble the council. Aura in here stays in here.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-5">
          {/* Name + description */}
          <div className="rounded-2xl border border-edge bg-card p-5">
            <label htmlFor="name" className="block text-sm font-medium">
              Group name
            </label>
            <input
              id="name"
              type="text"
              maxLength={40}
              placeholder="Marine Parade Aura Council"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(null);
              }}
              aria-invalid={!!nameError}
              className={`mt-1.5 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent ${
                nameError ? "border-negative/60" : "border-edge"
              }`}
            />
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-negative">{nameError}</span>
              <span className="text-muted">{name.length}/40</span>
            </div>

            <label
              htmlFor="description"
              className="mt-3 block text-sm font-medium"
            >
              Description{" "}
              <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={2}
              maxLength={120}
              placeholder="What is this council about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full resize-none rounded-xl border border-edge bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
            />
          </div>

          {/* Icon */}
          <div className="rounded-2xl border border-edge bg-card p-5">
            <p className="text-sm font-medium">Group icon</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {groupIcons.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  aria-pressed={icon === i}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-xl transition-colors ${
                    icon === i
                      ? "border-accent bg-foreground"
                      : "border-edge bg-background hover:border-accent/50"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Invite friends */}
          <div className="rounded-2xl border border-edge bg-card p-5">
            <p className="text-sm font-medium">
              Invite friends{" "}
              <span className="font-normal text-muted">(optional)</span>
            </p>
            <ul className="mt-2.5 space-y-2">
              {mockFriends.map((friend) => {
                const selected = invited.includes(friend.username);
                return (
                  <li key={friend.username}>
                    <button
                      type="button"
                      onClick={() => toggleInvite(friend.username)}
                      aria-pressed={selected}
                      className="flex w-full items-center justify-between rounded-xl border border-edge bg-background px-4 py-2.5 transition-colors hover:bg-card-hover"
                    >
                      <span className="flex items-center gap-3 text-sm">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-edge text-xs font-semibold">
                          {friend.displayName[0]}
                        </span>
                        <span>
                          <span className="font-medium">
                            {friend.displayName}
                          </span>
                          <span className="text-muted"> @{friend.username}</span>
                        </span>
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                          selected
                            ? "bg-foreground text-background"
                            : "border border-edge text-muted"
                        }`}
                      >
                        {selected ? "Invited ✓" : "Invite"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-muted">
              You’ll also get an invite code to share anywhere.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-accent py-3.5 text-sm font-semibold text-background shadow-[0_0_30px_-8px] shadow-accent/60 transition-all hover:bg-accent-soft"
          >
            Create group
          </button>
        </form>
      </main>
      <BottomNav />
    </>
  );
}
