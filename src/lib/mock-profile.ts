export const mockProfile = {
  username: "xicheng",
  displayName: "Xi Cheng",
  bio: "Certified aura holder since 2026. Verdicts are final.",
  totalPublicAura: 1240,
  streakDays: 8,
  postCount: 23,
  votesReceived: 1872,
  votesGiven: 341,
  bestMoment: {
    title: "Scored the winning point in tennis.",
    aura: 92,
  },
  worstMoment: {
    title: "Waved back at someone who wasn’t waving at me.",
    aura: -81,
  },
  badges: [
    { emoji: "🔥", label: "8-day streak" },
    { emoji: "👑", label: "Main Character" },
    { emoji: "⚖️", label: "300+ votes cast" },
    { emoji: "💀", label: "Survived a −80" },
  ],
  // Daily aura changes, oldest first.
  auraHistory: [40, -12, 88, -30, 15, 62, -45, 70, 22, -8, 55, 33],
  recentPosts: [
    { id: "r1", title: "Parallel parked first try with people watching.", aura: 74, daysAgo: "Today" },
    { id: "r2", title: "Laughed at my own joke before the punchline.", aura: -38, daysAgo: "Yesterday" },
    { id: "r3", title: "Teacher used my homework as the example.", aura: 81, daysAgo: "2d ago" },
    { id: "r4", title: "Pushed a pull door for a solid five seconds.", aura: -52, daysAgo: "3d ago" },
  ],
};

export function auraTitle(totalAura: number): string {
  if (totalAura <= -1000) return "Walking Aura Debt";
  if (totalAura <= -500) return "NPC Energy";
  if (totalAura < 500) return "Aura Neutral";
  if (totalAura < 1000) return "Certified Aura Holder";
  if (totalAura < 2500) return "Main Character";
  if (totalAura < 5000) return "Mythical Aura";
  return "Generational Aura";
}
