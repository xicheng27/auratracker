export type Group = {
  id: string;
  name: string;
  icon: string;
  description: string;
  members: number;
  myAura: number;
  inviteCode: string;
  recentActivity: string;
  lastActive: string;
};

// Placeholder groups until they come from the database.
export const mockGroups: Group[] = [
  {
    id: "1",
    name: "Marine Parade Aura Council",
    icon: "🏛️",
    description: "Official aura rulings for the east side.",
    members: 6,
    myAura: -20,
    inviteCode: "MPAC42",
    recentActivity: "Lucas posted about Jayden: “missed the MRT doing a fit check”",
    lastActive: "12m ago",
  },
  {
    id: "2",
    name: "Class 4E2 Survivors",
    icon: "📚",
    description: "What happens in 4E2 gets voted on in 4E2.",
    members: 11,
    myAura: 145,
    inviteCode: "4E2GANG",
    recentActivity: "Mei Ling posted: “answered a question without being called”",
    lastActive: "1h ago",
  },
  {
    id: "3",
    name: "Basketball Boys",
    icon: "🏀",
    description: "Court aura only. No off-court excuses.",
    members: 8,
    myAura: 310,
    inviteCode: "HOOPS88",
    recentActivity: "Isaac posted about Joash: “airballed a free throw”",
    lastActive: "3h ago",
  },
];
