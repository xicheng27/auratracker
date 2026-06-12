export function auraChange(upVotes: number, downVotes: number, baseValue = 100): number {
  const total = upVotes + downVotes;
  if (total === 0) return 0;
  return Math.round(((upVotes - downVotes) / total) * baseValue);
}

export function upVotePercent(upVotes: number, downVotes: number): number {
  const total = upVotes + downVotes;
  if (total === 0) return 0;
  return Math.round((upVotes / total) * 100);
}

export function formatAura(value: number): string {
  const formatted = Math.abs(value).toLocaleString("en-US");
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `−${formatted}`;
  return "0";
}
