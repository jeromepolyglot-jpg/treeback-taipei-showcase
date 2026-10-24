import { describe, expect, it } from 'vitest';
import { initialProgress, progressSchema } from '@/lib/treeback/oasis-progress';
import { plant } from '@/lib/treeback/oasis-model';

describe('returning player progress', () => {
  it('preserves planted trees and spent funds across serialization', () => {
    const progress = initialProgress();
    progress.sessions.citizen = plant(progress.sessions.citizen, 'citizen', '大同區', 0, 'bischofia');
    const restored = progressSchema.parse(JSON.parse(JSON.stringify(progress)));
    expect(restored.sessions.citizen.budget).toBe(200);
    expect(restored.sessions.citizen.boards.大同區[0]?.species).toBe('bischofia');
    expect(restored.sessions.enterprise.budget).toBe(20000);
    expect(restored.sessions.official.budget).toBe(100000);
  });
  it('restores pending events with the selected role and area', () => {
    const progress = initialProgress();
    progress.event = 'heat'; progress.role = 'enterprise'; progress.area = '萬華區';
    const restored = progressSchema.parse(JSON.parse(JSON.stringify(progress)));
    expect(restored.event).toBe('heat');
    expect(restored.role).toBe('enterprise');
    expect(restored.area).toBe('萬華區');
  });
  it('rejects incomplete saves instead of overwriting progress with defaults', () => {
    const progress = initialProgress();
    progress.sessions.citizen.boards.大同區.pop();
    expect(progressSchema.safeParse(progress).success).toBe(false);
  });
});