export type NotificationType =
  | "public_vote"
  | "private_vote"
  | "comment"
  | "group_invite"
  | "friend_posted_about_you"
  | "aura_updated"
  | "trending_post"
  | "daily_reminder";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timeAgo: string;
  href: string;
  unread: boolean;
};

export const notificationIcons: Record<NotificationType, string> = {
  public_vote: "🗳️",
  private_vote: "⚖️",
  comment: "💬",
  group_invite: "✉️",
  friend_posted_about_you: "👀",
  aura_updated: "✦",
  trending_post: "📈",
  daily_reminder: "⏰",
};

// Placeholder notifications until they come from the database.
export const mockNotifications: AppNotification[] = [
  {
    id: "n1",
    type: "friend_posted_about_you",
    title: "Someone posted about you",
    message:
      "@joash reported an incident about you in Marine Parade Aura Council: “left on delivered by the group chat he created.”",
    timeAgo: "5h ago",
    href: "/groups/1",
    unread: true,
  },
  {
    id: "n2",
    type: "aura_updated",
    title: "Your aura went up",
    message:
      "Your post “Parallel parked first try with people watching” is now at +74 aura. 87% said aura gained.",
    timeAgo: "6h ago",
    href: "/post/1",
    unread: true,
  },
  {
    id: "n3",
    type: "trending_post",
    title: "You’re trending",
    message:
      "“Parallel parked first try with people watching” is in today’s top 10 most voted posts.",
    timeAgo: "7h ago",
    href: "/post/1",
    unread: true,
  },
  {
    id: "n4",
    type: "comment",
    title: "New comment",
    message: "@lucas commented on your post: “the parallel universe where you have aura.”",
    timeAgo: "9h ago",
    href: "/post/1",
    unread: false,
  },
  {
    id: "n5",
    type: "private_vote",
    title: "The council has voted",
    message:
      "Your incident in Basketball Boys closed at +30 aura. 80% said aura gained.",
    timeAgo: "1d ago",
    href: "/groups/3",
    unread: false,
  },
  {
    id: "n6",
    type: "group_invite",
    title: "Group invite",
    message: "@mei_ling invited you to join Class 4E2 Survivors.",
    timeAgo: "2d ago",
    href: "/groups",
    unread: false,
  },
  {
    id: "n7",
    type: "public_vote",
    title: "Votes are coming in",
    message: "12 people voted on “Laughed at my own joke before the punchline” in the first hour.",
    timeAgo: "2d ago",
    href: "/post/2",
    unread: false,
  },
  {
    id: "n8",
    type: "daily_reminder",
    title: "Daily aura check",
    message: "You haven’t posted today. The streak (🔥 8 days) is on the line.",
    timeAgo: "3d ago",
    href: "/post/new",
    unread: false,
  },
];
