"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav, TopNav } from "@/components/app-nav";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api";
import {
  notificationIcons,
  type AppNotification,
} from "@/lib/mock-notifications";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    fetchNotifications().then(setNotifications);
  }, []);

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
    void markNotificationRead(id);
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    void markAllNotificationsRead();
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Notifications</h1>
            <p className="mt-1 text-sm text-muted">
              {unreadCount > 0
                ? `${unreadCount} unread. The people have spoken.`
                : "All caught up. Aura intact."}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="rounded-xl border border-edge px-3 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground"
            >
              Mark all read
            </button>
          )}
        </div>

        <ul className="mt-5 space-y-2">
          {notifications.length === 0 ? (
            <li className="rounded-2xl border border-edge bg-card p-8 text-center text-sm text-muted">
              Nothing yet. Post something and give people a reason to judge
              you.
            </li>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id}>
                <Link
                  href={notification.href}
                  onClick={() => markRead(notification.id)}
                  className={`flex gap-3.5 rounded-2xl border p-4 transition-colors hover:bg-card-hover ${
                    notification.unread
                      ? "border-accent/40 bg-card"
                      : "border-edge bg-card opacity-70"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-edge bg-background text-lg">
                    {notificationIcons[notification.type]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {notification.title}
                      </p>
                      <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
                        {notification.timeAgo}
                        {notification.unread && (
                          <span
                            className="h-2 w-2 rounded-full bg-foreground"
                            aria-label="Unread"
                          />
                        )}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {notification.message}
                    </p>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </main>
      <BottomNav />
    </>
  );
}
