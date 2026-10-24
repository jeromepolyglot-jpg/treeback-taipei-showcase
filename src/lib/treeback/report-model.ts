export const REPORT_KINDS = ['空樹穴', '水泥填平', '寬敞人行道'] as const;
export const REPORT_DISTRICTS = ['大同區', '萬華區', '中正區', '中山區', '松山區', '大安區', '信義區', '南港區', '士林區', '內湖區', '北投區', '文山區'] as const;
export const REPORT_NOTE_MAX = 500;

export type ReportRow = {
  id: string;
  user_id: string;
  kind: string;
  district: string;
  note: string;
  lat: number | null;
  lng: number | null;
  photo_path: string | null;
  wishes: number;
  created_at: string;
};

export function isValidReportInput(kind: string, district: string, note: string): boolean {
  return (REPORT_KINDS as readonly string[]).includes(kind)
    && (REPORT_DISTRICTS as readonly string[]).includes(district)
    && note.length <= REPORT_NOTE_MAX;
}

export function photoPathFor(userId: string, reportId: string): string {
  return `${userId}/${reportId}.jpg`;
}

export function canManageReport(row: Pick<ReportRow, 'user_id'>, userId: string | null): boolean {
  return userId !== null && row.user_id === userId;
}

export function formatReportTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('zh-TW', { hour12: false });
}
