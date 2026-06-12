export type RankedUser = {
  username: string;
  displayName: string;
  totalAura: number;
  todayChange: number;
  streakDays: number;
  isFriend: boolean;
};

// Placeholder global rankings until they come from the database.
export const mockRankings: RankedUser[] = [
  { username: "priya.codes", displayName: "Priya", totalAura: 5320, todayChange: 95, streakDays: 41, isFriend: false },
  { username: "kaikai", displayName: "Kai", totalAura: 4110, todayChange: -12, streakDays: 17, isFriend: false },
  { username: "mei_ling", displayName: "Mei Ling", totalAura: 2890, todayChange: 76, streakDays: 26, isFriend: false },
  { username: "lucas", displayName: "Lucas", totalAura: 2150, todayChange: 33, streakDays: 12, isFriend: true },
  { username: "sofia.m", displayName: "Sofia", totalAura: 1875, todayChange: 120, streakDays: 9, isFriend: false },
  { username: "xicheng", displayName: "Xi Cheng", totalAura: 1240, todayChange: 74, streakDays: 8, isFriend: true },
  { username: "jayden", displayName: "Jayden", totalAura: 980, todayChange: -44, streakDays: 5, isFriend: true },
  { username: "isaac", displayName: "Isaac", totalAura: 645, todayChange: 18, streakDays: 14, isFriend: true },
  { username: "darryl", displayName: "Darryl", totalAura: 210, todayChange: -8, streakDays: 2, isFriend: false },
  { username: "joash", displayName: "Joash", totalAura: -340, todayChange: -130, streakDays: 6, isFriend: true },
];

export const mostControversialPost = {
  username: "kaikai",
  title: "Wore socks with sandals to the mall on purpose.",
  upPercent: 51,
  totalVotes: 842,
};
