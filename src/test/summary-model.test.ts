import { describe, expect, it } from 'vitest';
import { buildSummaryPrompt, summarizeProgress, weekStartTaipei } from '@/lib/treeback/summary-model';
import { initialProgress } from '@/lib/treeback/oasis-progress';

describe('weekly summary model', () => {
  it('computes the Taipei Monday week start', () => {
    // 2026-10-24 is a Saturday; week starts Monday 2026-10-19
    expect(weekStartTaipei(new Date('2026-10-24T04:00:00Z'))).toBe('2026-10-19');
    // Monday itself stays put
    expect(weekStartTaipei(new Date('2026-10-19T00:30:00Z'))).toBe('2026-10-19');
    // Sunday belongs to the previous Monday
    expect(weekStartTaipei(new Date('2026-10-25T15:00:00Z'))).toBe('2026-10-19');
  });
  it('summarizes a valid progress state into per-role stats', () => {
    const stats = summarizeProgress(initialProgress());
    expect(stats).toHaveLength(3);
    expect(stats?.map((s) => s.role)).toEqual(['citizen', 'enterprise', 'official']);
    expect(stats?.[0]?.trees).toBe(0);
  });
  it('rejects an invalid progress state', () => {
    expect(summarizeProgress({ role: 'citizen' })).toBeNull();
    expect(summarizeProgress(null)).toBeNull();
  });
  it('builds a prompt that states the values are game parameters', () => {
    const prompt = buildSummaryPrompt(summarizeProgress(initialProgress())!, '2026-10-19');
    expect(prompt).toContain('虛構遊戲參數');
    expect(prompt).toContain('2026-10-19');
    expect(prompt).toContain('市民');
  });
});
