import { describe, expect, it } from 'vitest';
import { REPORT_NOTE_MAX, canManageReport, isValidReportInput, photoPathFor } from '@/lib/treeback/report-model';

describe('report model', () => {
  it('accepts a valid kind, district and note within the limit', () => {
    expect(isValidReportInput('空樹穴', '大同區', '騎樓前的空樹穴')).toBe(true);
  });
  it('rejects unknown kinds and districts', () => {
    expect(isValidReportInput('公園空地', '大同區', '')).toBe(false);
    expect(isValidReportInput('空樹穴', '板橋區', '')).toBe(false);
  });
  it('rejects notes longer than the limit', () => {
    expect(isValidReportInput('空樹穴', '大同區', 'x'.repeat(REPORT_NOTE_MAX + 1))).toBe(false);
    expect(isValidReportInput('空樹穴', '大同區', 'x'.repeat(REPORT_NOTE_MAX))).toBe(true);
  });
  it('scopes photo paths to the owning user', () => {
    expect(photoPathFor('user-1', 'report-9')).toBe('user-1/report-9.jpg');
  });
  it('only the owner can manage a report', () => {
    const row = { user_id: 'user-1' };
    expect(canManageReport(row, 'user-1')).toBe(true);
    expect(canManageReport(row, 'user-2')).toBe(false);
    expect(canManageReport(row, null)).toBe(false);
  });
});
