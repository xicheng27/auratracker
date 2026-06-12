export type FriendEntry = {
  friendshipId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  totalAura: number;
};

export type FriendRequest = {
  friendshipId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  direction: "incoming" | "outgoing";
};

export type FriendStatus =
  | "none"
  | "friends"
  | "incoming"
  | "outgoing"
  | "self";

export type UserSearchResult = {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  totalAura: number;
  status: FriendStatus;
};

// Placeholder friends until they come from the database.
export const mockFriends: FriendEntry[] = [
  { friendshipId: "f1", userId: "lucas", username: "lucas", displayName: "Lucas", avatarUrl: null, totalAura: 2150 },
  { friendshipId: "f2", userId: "jayden", username: "jayden", displayName: "Jayden", avatarUrl: null, totalAura: 980 },
  { friendshipId: "f3", userId: "isaac", username: "isaac", displayName: "Isaac", avatarUrl: null, totalAura: 645 },
  { friendshipId: "f4", userId: "joash", username: "joash", displayName: "Joash", avatarUrl: null, totalAura: -340 },
];

export const mockFriendRequests: FriendRequest[] = [
  { friendshipId: "f5", userId: "sofia.m", username: "sofia.m", displayName: "Sofia", avatarUrl: null, direction: "incoming" },
  { friendshipId: "f6", userId: "priya.codes", username: "priya.codes", displayName: "Priya", avatarUrl: null, direction: "outgoing" },
];
