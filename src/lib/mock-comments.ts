export type PostComment = {
  id: string;
  username: string;
  timeAgo: string;
  text: string;
};

// Placeholder comments until they come from the database, keyed by post id.
export const mockComments: Record<string, PostComment[]> = {
  "1": [
    { id: "c1", username: "lucas", timeAgo: "1h ago", text: "Bro wait 💀" },
    { id: "c2", username: "mei_ling", timeAgo: "1h ago", text: "The class going silent is the worst part. RIP." },
    { id: "c3", username: "joash", timeAgo: "30m ago", text: "Honestly? The teacher respected it." },
  ],
  "2": [
    { id: "c4", username: "jayden", timeAgo: "3h ago", text: "I was there. The gym EXPLODED." },
    { id: "c5", username: "isaac", timeAgo: "2h ago", text: "Main character behaviour." },
  ],
  "3": [
    { id: "c6", username: "priya.codes", timeAgo: "4h ago", text: "Years of training paying off. Proud of you." },
  ],
  "4": [
    { id: "c7", username: "lucas", timeAgo: "6h ago", text: "Turning it into a stretch is crazy work 😭" },
    { id: "c8", username: "jayden", timeAgo: "5h ago", text: "The commitment almost saved it. Almost." },
  ],
  "5": [
    { id: "c9", username: "isaac", timeAgo: "8h ago", text: "First day back?? They should fear you." },
  ],
  "6": [
    { id: "c10", username: "mei_ling", timeAgo: "10h ago", text: "The floor said it's personal." },
    { id: "c11", username: "lucas", timeAgo: "9h ago", text: "Flat ground undefeated since 2009." },
  ],
};
