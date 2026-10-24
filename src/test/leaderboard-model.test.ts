import { describe, expect, it } from 'vitest';
import { defaultDisplayName, medalFor, rankEntries, type LeaderboardEntry } from '@/lib/treeback/leaderboard-model';

const entry = (over: Partial<LeaderboardEntry>): LeaderboardEntry => ({
  user_id: 'u', display_name: 'p', role: 'citizen', trees: 0, improvement: 0, month: 1, updated_at: '', ...over,
});

describe('leaderboard model', () => {
  it('ranks by trees, then improvement, then fewer months', () => {
    const ranked = rankEntries([
      entry({ user_id: 'a', trees: 3, improvement: 5, month: 4 }),
      entry({ user_id: 'b', trees: 5, improvement: 1, month: 9 }),
      entry({ user_id: 'c', trees: 3, improvement: 9, month: 2 }),
      entry({ user_id: 'd', trees: 3, improvement: 5, month: 2 }),
    ]);
    expect(ranked.map((e) => e.user_id)).toEqual(['b', 'c', 'd', 'a']);
  });
  it('gives medals to the top three and numbers after', () => {
    expect(medalFor(0)).toBe('🥇');
    expect(medalFor(2)).toBe('🥉');
    expect(medalFor(3)).toBe('4');
  });
  it('derives a display name from the email prefix, capped at 24 chars', () => {
    expect(defaultDisplayName('junbin@example.com')).toBe('junbin');
    expect(defaultDisplayName('a-very-long-player-name-over-limit@example.com')).toHaveLength(24);
    expect(defaultDisplayName(undefined)).toBe('綠洲玩家');
  });
});
