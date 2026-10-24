export type LeaderboardEntry = {
  user_id: string;
  display_name: string;
  role: 'citizen' | 'enterprise' | 'official';
  trees: number;
  improvement: number;
  month: number;
  updated_at: string;
};

export function rankEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.trees - a.trees || b.improvement - a.improvement || a.month - b.month);
}

export function medalFor(rank: number): string {
  return rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}`;
}

export function defaultDisplayName(email: string | undefined): string {
  if (!email) return '綠洲玩家';
  const name = email.split('@')[0] ?? '';
  return name.slice(0, 24) || '綠洲玩家';
}
