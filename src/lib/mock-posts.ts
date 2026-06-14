export type PublicPost = {
  id: string;
  username: string;
  timeAgo: string;
  hoursAgo: number;
  title: string;
  description: string;
  category: string;
  upVotes: number;
  downVotes: number;
  comments: number;
  isFriend: boolean;
  myVote?: "up" | "down" | null;
  imageUrl?: string | null;
  mediaUrl?: string | null;
  mediaType?: "photo" | "video" | null;
  avatarUrl?: string | null;
};

// Placeholder feed until posts come from the database.
export const mockPosts: PublicPost[] = [
  {
    id: "1",
    username: "jayden",
    timeAgo: "2h ago",
    hoursAgo: 2,
    title: "Accidentally called my teacher bro.",
    description: "I was asking a question and said “bro wait” without thinking. The class went silent.",
    category: "School",
    upVotes: 31,
    downVotes: 80,
    comments: 41,
    isFriend: true,
  },
  {
    id: "2",
    username: "lucas",
    timeAgo: "4h ago",
    hoursAgo: 4,
    title: "Hit a game winner in basketball today.",
    description: "Buzzer beater from the three-point line. Whole court went silent, then went crazy.",
    category: "Sports",
    upVotes: 154,
    downVotes: 15,
    comments: 67,
    isFriend: true,
  },
  {
    id: "3",
    username: "mei_ling",
    timeAgo: "5h ago",
    hoursAgo: 5,
    title: "Talked to the cashier without stuttering.",
    description: "Ordered, paid, said thank you, and left. Flawless execution. Years of training.",
    category: "Social",
    upVotes: 89,
    downVotes: 12,
    comments: 19,
    isFriend: false,
  },
  {
    id: "4",
    username: "isaac",
    timeAgo: "7h ago",
    hoursAgo: 7,
    title: "Waved back at someone who wasn’t waving at me.",
    description: "They were waving at the person behind me. I committed to the wave anyway and turned it into a stretch.",
    category: "Embarrassing",
    upVotes: 45,
    downVotes: 81,
    comments: 28,
    isFriend: true,
  },
  {
    id: "5",
    username: "priya.codes",
    timeAgo: "9h ago",
    hoursAgo: 9,
    title: "Fixed a bug the senior dev couldn’t find.",
    description: "Three people stared at it for two days. I found the typo in five minutes on my first day back.",
    category: "Work",
    upVotes: 201,
    downVotes: 9,
    comments: 54,
    isFriend: false,
  },
  {
    id: "6",
    username: "joash",
    timeAgo: "11h ago",
    hoursAgo: 11,
    title: "Tripped over nothing in front of everyone.",
    description: "Flat ground. Good shoes. Zero obstacles. Still went down in front of the whole canteen.",
    category: "Embarrassing",
    upVotes: 23,
    downVotes: 102,
    comments: 73,
    isFriend: true,
  },
];
