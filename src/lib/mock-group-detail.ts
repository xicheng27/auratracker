export type GroupMember = {
  username: string;
  displayName: string;
  role: "owner" | "admin" | "member";
  aura: number;
};

export type PrivatePost = {
  id: string;
  postedBy: string;
  target: string;
  type: "self_post" | "friend_post";
  description: string;
  upVotes: number;
  downVotes: number;
  comments: number;
  timeAgo: string;
};

// Placeholder group members until they come from the database, keyed by group id.
export const mockMembers: Record<string, GroupMember[]> = {
  "1": [
    { username: "lucas", displayName: "Lucas", role: "owner", aura: 420 },
    { username: "jayden", displayName: "Jayden", role: "member", aura: 300 },
    { username: "isaac", displayName: "Isaac", role: "admin", aura: 105 },
    { username: "mei_ling", displayName: "Mei Ling", role: "member", aura: 40 },
    { username: "xicheng", displayName: "Xi Cheng", role: "member", aura: -20 },
    { username: "joash", displayName: "Joash", role: "member", aura: -180 },
  ],
  "2": [
    { username: "mei_ling", displayName: "Mei Ling", role: "owner", aura: 260 },
    { username: "xicheng", displayName: "Xi Cheng", role: "member", aura: 145 },
    { username: "priya.codes", displayName: "Priya", role: "admin", aura: 120 },
    { username: "jayden", displayName: "Jayden", role: "member", aura: 85 },
    { username: "lucas", displayName: "Lucas", role: "member", aura: 30 },
    { username: "isaac", displayName: "Isaac", role: "member", aura: -45 },
    { username: "joash", displayName: "Joash", role: "member", aura: -95 },
  ],
  "3": [
    { username: "isaac", displayName: "Isaac", role: "owner", aura: 380 },
    { username: "xicheng", displayName: "Xi Cheng", role: "member", aura: 310 },
    { username: "lucas", displayName: "Lucas", role: "member", aura: 220 },
    { username: "jayden", displayName: "Jayden", role: "admin", aura: 150 },
    { username: "joash", displayName: "Joash", role: "member", aura: -240 },
  ],
};

// Placeholder private aura incidents, keyed by group id.
export const mockPrivatePosts: Record<string, PrivatePost[]> = {
  "1": [
    {
      id: "p1",
      postedBy: "lucas",
      target: "jayden",
      type: "friend_post",
      description: "Jayden missed the MRT because he was doing a fit check on the platform.",
      upVotes: 1,
      downVotes: 4,
      comments: 7,
      timeAgo: "12m ago",
    },
    {
      id: "p2",
      postedBy: "mei_ling",
      target: "mei_ling",
      type: "self_post",
      description: "Answered a question in class without being called. Teacher said “exactly”.",
      upVotes: 4,
      downVotes: 1,
      comments: 3,
      timeAgo: "2h ago",
    },
    {
      id: "p3",
      postedBy: "joash",
      target: "xicheng",
      type: "friend_post",
      description: "Xi Cheng got left on delivered by the group chat he created.",
      upVotes: 1,
      downVotes: 3,
      comments: 9,
      timeAgo: "5h ago",
    },
    {
      id: "p4",
      postedBy: "isaac",
      target: "isaac",
      type: "self_post",
      description: "Threw a paper ball across the classroom into the bin. Nothing but net.",
      upVotes: 3,
      downVotes: 2,
      comments: 2,
      timeAgo: "1d ago",
    },
  ],
  "2": [
    {
      id: "p5",
      postedBy: "mei_ling",
      target: "mei_ling",
      type: "self_post",
      description: "Answered a question without being called and got it right.",
      upVotes: 5,
      downVotes: 1,
      comments: 4,
      timeAgo: "1h ago",
    },
    {
      id: "p6",
      postedBy: "priya.codes",
      target: "joash",
      type: "friend_post",
      description: "Joash called the teacher “mum” during the morning lesson.",
      upVotes: 2,
      downVotes: 5,
      comments: 11,
      timeAgo: "4h ago",
    },
  ],
  "3": [
    {
      id: "p7",
      postedBy: "isaac",
      target: "joash",
      type: "friend_post",
      description: "Joash airballed a free throw with the whole court watching.",
      upVotes: 0,
      downVotes: 4,
      comments: 6,
      timeAgo: "3h ago",
    },
    {
      id: "p8",
      postedBy: "xicheng",
      target: "xicheng",
      type: "self_post",
      description: "Hit a half-court shot right as coach walked in.",
      upVotes: 4,
      downVotes: 0,
      comments: 5,
      timeAgo: "1d ago",
    },
  ],
};
