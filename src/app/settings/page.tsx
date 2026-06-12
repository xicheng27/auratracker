"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav, TopNav } from "@/components/app-nav";
import { FormField } from "@/components/form-field";
import { mockProfile } from "@/lib/mock-profile";

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 py-3 text-left"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-muted">{description}</span>
        )}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
          checked ? "border-accent bg-foreground" : "border-edge bg-background"
        }`}
      >
        <span
          className={`absolute top-0.5 h-[18px] w-[18px] rounded-full transition-all ${
            checked ? "left-[22px] bg-background" : "left-0.5 bg-muted"
          }`}
        />
      </span>
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 rounded-2xl border border-edge bg-card p-5">
      <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">
        {title}
      </h2>
      <div className="mt-2 divide-y divide-edge">{children}</div>
    </section>
  );
}

const initialBlocked = [
  { username: "aura_thief_99", displayName: "Aura Thief" },
  { username: "ratio_andy", displayName: "Andy" },
];

export default function SettingsPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState(mockProfile.displayName);
  const [username, setUsername] = useState(mockProfile.username);
  const [bio, setBio] = useState(mockProfile.bio);
  const [saved, setSaved] = useState(false);

  const [privacy, setPrivacy] = useState({
    privateProfile: false,
    hidePostsAboutMe: false,
    showOnLeaderboards: true,
    groupInvitesFriendsOnly: true,
  });
  const [notifs, setNotifs] = useState({
    votes: true,
    comments: true,
    postedAboutYou: true,
    groupInvites: true,
    trending: true,
    dailyReminder: false,
  });

  const [blocked, setBlocked] = useState(initialBlocked);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    // TODO: persist profile changes once the backend exists.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Tune your aura’s public-facing operations.
        </p>

        {/* Edit profile */}
        <section className="mt-5 rounded-2xl border border-edge bg-card p-5">
          <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">
            Edit profile
          </h2>
          <form onSubmit={saveProfile} className="mt-4 space-y-4">
            <FormField
              label="Display name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <FormField
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div>
              <label htmlFor="bio" className="block text-sm font-medium">
                Bio
              </label>
              <textarea
                id="bio"
                rows={2}
                maxLength={160}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1.5 w-full resize-none rounded-xl border border-edge bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent-soft"
            >
              {saved ? "Saved ✓" : "Save changes"}
            </button>
          </form>
        </section>

        {/* Privacy */}
        <Section title="Privacy">
          <Toggle
            label="Private profile"
            description="Only friends can see your posts and stats."
            checked={privacy.privateProfile}
            onChange={(v) => setPrivacy((p) => ({ ...p, privateProfile: v }))}
          />
          <Toggle
            label="Hide posts about me from my profile"
            description="Friend-reported incidents won’t show on your profile."
            checked={privacy.hidePostsAboutMe}
            onChange={(v) => setPrivacy((p) => ({ ...p, hidePostsAboutMe: v }))}
          />
          <Toggle
            label="Show me on leaderboards"
            description="Appear in global and friend rankings."
            checked={privacy.showOnLeaderboards}
            onChange={(v) =>
              setPrivacy((p) => ({ ...p, showOnLeaderboards: v }))
            }
          />
          <Toggle
            label="Group invites from friends only"
            description="Strangers can’t drag you into councils."
            checked={privacy.groupInvitesFriendsOnly}
            onChange={(v) =>
              setPrivacy((p) => ({ ...p, groupInvitesFriendsOnly: v }))
            }
          />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <Toggle
            label="Votes on your posts"
            checked={notifs.votes}
            onChange={(v) => setNotifs((n) => ({ ...n, votes: v }))}
          />
          <Toggle
            label="Comments"
            checked={notifs.comments}
            onChange={(v) => setNotifs((n) => ({ ...n, comments: v }))}
          />
          <Toggle
            label="Someone posts about you"
            description="Recommended. You deserve to know."
            checked={notifs.postedAboutYou}
            onChange={(v) => setNotifs((n) => ({ ...n, postedAboutYou: v }))}
          />
          <Toggle
            label="Group invites"
            checked={notifs.groupInvites}
            onChange={(v) => setNotifs((n) => ({ ...n, groupInvites: v }))}
          />
          <Toggle
            label="Trending alerts"
            checked={notifs.trending}
            onChange={(v) => setNotifs((n) => ({ ...n, trending: v }))}
          />
          <Toggle
            label="Daily posting reminder"
            description="Protect the streak."
            checked={notifs.dailyReminder}
            onChange={(v) => setNotifs((n) => ({ ...n, dailyReminder: v }))}
          />
        </Section>

        {/* Blocked users */}
        <section className="mt-4 rounded-2xl border border-edge bg-card p-5">
          <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">
            Blocked users
          </h2>
          {blocked.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Nobody blocked. Peak diplomacy.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {blocked.map((user) => (
                <li
                  key={user.username}
                  className="flex items-center justify-between rounded-xl border border-edge bg-background px-4 py-3"
                >
                  <span className="text-sm">
                    <span className="font-medium">{user.displayName}</span>{" "}
                    <span className="text-muted">@{user.username}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setBlocked((prev) =>
                        prev.filter((u) => u.username !== user.username),
                      )
                    }
                    className="rounded-xl border border-edge px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
                  >
                    Unblock
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Account */}
        <section className="mt-4 rounded-2xl border border-edge bg-card p-5">
          <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">
            Account
          </h2>
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => {
                // TODO: clear the session once auth exists.
                router.push("/login");
              }}
              className="w-full rounded-xl border border-edge py-2.5 text-sm font-semibold transition-colors hover:bg-card-hover"
            >
              Log out
            </button>
            {confirmingDelete ? (
              <div className="rounded-xl border border-negative/40 bg-background p-4 text-center">
                <p className="text-sm font-semibold">
                  Delete your account and all {`${mockProfile.totalPublicAura.toLocaleString("en-US")}`}{" "}
                  aura?
                </p>
                <p className="mt-1 text-xs text-muted">
                  This can’t be undone. The aura is gone forever.
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="rounded-xl border border-edge px-4 py-2 text-xs font-semibold transition-colors hover:bg-card-hover"
                  >
                    Keep my aura
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // TODO: delete the account once the backend exists.
                      router.push("/");
                    }}
                    className="rounded-xl border border-negative/40 px-4 py-2 text-xs font-semibold text-negative transition-colors hover:bg-card-hover"
                  >
                    Delete forever
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="w-full rounded-xl border border-negative/30 py-2.5 text-sm font-semibold text-negative transition-colors hover:bg-card-hover"
              >
                Delete account
              </button>
            )}
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-muted">
          Aura Tracker · MVP build
        </p>
      </main>
      <BottomNav />
    </>
  );
}
