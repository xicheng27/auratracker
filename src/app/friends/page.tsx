"use client";

import { useEffect, useState } from "react";
import { BottomNav, TopNav } from "@/components/app-nav";
import {
  fetchFriendRequests,
  fetchFriends,
  removeFriendship,
  respondToFriendRequest,
  searchUsers,
  sendFriendRequest,
} from "@/lib/api";
import { formatAura } from "@/lib/aura";
import type {
  FriendEntry,
  FriendRequest,
  UserSearchResult,
} from "@/lib/mock-friends";

function Avatar({ name, url }: { name: string; url: string | null }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-edge bg-background text-sm font-semibold">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        name[0]?.toUpperCase()
      )}
    </div>
  );
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [requested, setRequested] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([fetchFriends(), fetchFriendRequests()]).then(
      ([friendList, requestList]) => {
        setFriends(friendList);
        setRequests(requestList);
        setLoading(false);
      },
    );
  }, []);

  // Debounced user search.
  useEffect(() => {
    const trimmed = query.trim();
    const timer = setTimeout(
      () => {
        if (trimmed.length < 2) {
          setResults([]);
          setSearching(false);
          return;
        }
        setSearching(true);
        searchUsers(trimmed).then((found) => {
          setResults(found);
          setSearching(false);
        });
      },
      trimmed.length < 2 ? 0 : 300,
    );
    return () => clearTimeout(timer);
  }, [query]);

  async function handleAdd(user: UserSearchResult) {
    setRequested((prev) => new Set(prev).add(user.userId));
    const { error } = await sendFriendRequest(user.userId);
    if (error) {
      setRequested((prev) => {
        const next = new Set(prev);
        next.delete(user.userId);
        return next;
      });
    }
  }

  function handleRespond(request: FriendRequest, accept: boolean) {
    setRequests((prev) =>
      prev.filter((r) => r.friendshipId !== request.friendshipId),
    );
    if (accept) {
      setFriends((prev) => [
        ...prev,
        {
          friendshipId: request.friendshipId,
          userId: request.userId,
          username: request.username,
          displayName: request.displayName,
          avatarUrl: request.avatarUrl,
          totalAura: 0,
        },
      ]);
    }
    void respondToFriendRequest(request.friendshipId, accept);
  }

  function handleRemove(friend: FriendEntry) {
    setFriends((prev) =>
      prev.filter((f) => f.friendshipId !== friend.friendshipId),
    );
    void removeFriendship(friend.friendshipId);
  }

  function handleCancel(request: FriendRequest) {
    setRequests((prev) =>
      prev.filter((r) => r.friendshipId !== request.friendshipId),
    );
    void removeFriendship(request.friendshipId);
  }

  const incoming = requests.filter((r) => r.direction === "incoming");
  const outgoing = requests.filter((r) => r.direction === "outgoing");

  function actionFor(user: UserSearchResult) {
    if (user.status === "self") return null;
    if (user.status === "friends") {
      return <span className="text-xs font-medium text-muted">Friends ✓</span>;
    }
    if (user.status === "outgoing" || requested.has(user.userId)) {
      return <span className="text-xs font-medium text-muted">Requested</span>;
    }
    if (user.status === "incoming") {
      return (
        <span className="text-xs font-medium text-muted">Check requests ↓</span>
      );
    }
    return (
      <button
        type="button"
        onClick={() => handleAdd(user)}
        className="rounded-xl bg-accent px-3.5 py-1.5 text-xs font-semibold text-background transition-colors hover:bg-accent-soft"
      >
        Add friend
      </button>
    );
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
        <h1 className="text-xl font-bold tracking-tight">Friends</h1>
        <p className="mt-1 text-sm text-muted">
          Your inner circle. They see your posts first and judge you hardest.
        </p>

        {/* Search */}
        <div className="mt-5 rounded-2xl border border-edge bg-card p-4">
          <input
            type="text"
            placeholder="Search by username or name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-edge bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
          />
          {query.trim().length >= 2 && (
            <ul className="mt-3 space-y-2">
              {searching ? (
                <li className="px-1 py-2 text-sm text-muted">Searching…</li>
              ) : results.length === 0 ? (
                <li className="px-1 py-2 text-sm text-muted">
                  Nobody found. Aura so low they don’t exist.
                </li>
              ) : (
                results.map((user) => (
                  <li
                    key={user.userId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-edge bg-background px-4 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={user.displayName} url={user.avatarUrl} />
                      <div className="min-w-0 text-sm">
                        <p className="truncate font-medium">
                          {user.displayName}
                          {user.status === "self" && (
                            <span className="text-muted"> (you)</span>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted">
                          @{user.username} · {formatAura(user.totalAura)} aura
                        </p>
                      </div>
                    </div>
                    {actionFor(user)}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Incoming requests */}
        {incoming.length > 0 && (
          <section className="mt-4 rounded-2xl border border-accent/40 bg-card p-5">
            <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">
              Friend requests
            </h2>
            <ul className="mt-3 space-y-2">
              {incoming.map((request) => (
                <li
                  key={request.friendshipId}
                  className="flex items-center justify-between gap-3 rounded-xl border border-edge bg-background px-4 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3 text-sm">
                    <Avatar name={request.displayName} url={request.avatarUrl} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {request.displayName}
                      </p>
                      <p className="truncate text-xs text-muted">
                        @{request.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRespond(request, true)}
                      className="rounded-xl bg-accent px-3.5 py-1.5 text-xs font-semibold text-background transition-colors hover:bg-accent-soft"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespond(request, false)}
                      className="rounded-xl border border-edge px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Outgoing requests */}
        {outgoing.length > 0 && (
          <section className="mt-4 rounded-2xl border border-edge bg-card p-5">
            <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">
              Sent requests
            </h2>
            <ul className="mt-3 space-y-2">
              {outgoing.map((request) => (
                <li
                  key={request.friendshipId}
                  className="flex items-center justify-between gap-3 rounded-xl border border-edge bg-background px-4 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3 text-sm">
                    <Avatar name={request.displayName} url={request.avatarUrl} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {request.displayName}
                      </p>
                      <p className="truncate text-xs text-muted">
                        @{request.username} · pending
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCancel(request)}
                    className="shrink-0 rounded-xl border border-edge px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
                  >
                    Cancel
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Friends list */}
        <section className="mt-4 rounded-2xl border border-edge bg-card p-5">
          <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">
            Your friends {friends.length > 0 && `(${friends.length})`}
          </h2>
          {loading ? (
            <p className="mt-3 text-sm text-muted">Assembling the circle…</p>
          ) : friends.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              No friends yet. Search above and start building the council.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {friends.map((friend) => (
                <li
                  key={friend.friendshipId}
                  className="flex items-center justify-between gap-3 rounded-xl border border-edge bg-background px-4 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3 text-sm">
                    <Avatar name={friend.displayName} url={friend.avatarUrl} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {friend.displayName}
                      </p>
                      <p className="truncate text-xs text-muted">
                        @{friend.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`text-sm font-bold ${
                        friend.totalAura >= 0
                          ? "text-positive"
                          : "text-negative"
                      }`}
                    >
                      {formatAura(friend.totalAura)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(friend)}
                      className="rounded-xl border border-edge px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-negative"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <BottomNav />
    </>
  );
}
