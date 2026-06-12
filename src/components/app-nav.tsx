"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuraLogo } from "@/components/aura-logo";
import { getCurrentUser, type CurrentUser } from "@/lib/api";
import { formatAura } from "@/lib/aura";
import {
  BellIcon,
  GroupsIcon,
  HomeIcon,
  PostIcon,
  ProfileIcon,
  TrophyIcon,
} from "@/components/icons";

export function TopNav() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-edge bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <AuraLogo href="/feed" />
        <div className="flex items-center gap-3">
          <span
            className="rounded-full border border-edge bg-card px-3 py-1.5 text-sm font-semibold"
            title="Your total public aura"
          >
            ✦ {currentUser ? formatAura(currentUser.totalAura) : "—"}
          </span>
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-edge bg-card text-muted transition-colors hover:text-foreground"
          >
            <BellIcon />
          </Link>
          <Link
            href="/profile"
            aria-label="Your profile"
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-edge bg-card text-sm font-semibold"
          >
            {currentUser?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentUser.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              (currentUser?.displayName[0] ?? "·")
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

const tabs = [
  { href: "/feed", label: "Home", icon: HomeIcon },
  { href: "/post/new", label: "Post", icon: PostIcon },
  { href: "/groups", label: "Groups", icon: GroupsIcon },
  { href: "/leaderboard", label: "Ranks", icon: TrophyIcon },
  { href: "/profile", label: "Profile", icon: ProfileIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-4 z-20 flex justify-center px-4">
      <div className="flex gap-1 rounded-full border border-edge bg-card/95 p-1.5 shadow-[0_0_40px_-10px] shadow-accent/30 backdrop-blur">
        {tabs.map(({ href, label, icon: TabIcon }) => {
          const active =
            pathname === href || (href !== "/feed" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 rounded-full px-4 py-2 text-[10px] font-medium transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <TabIcon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
