import { ROLES, eco, type Role } from './oasis-model';
import { progressSchema, type Progress } from './oasis-progress';

export type RoleStats = { role: Role; roleName: string; month: number; trees: number; improvement: number; satisfaction: number };

/** 台北時區（UTC+8）的週一作為週起始日，回傳 YYYY-MM-DD。 */
export function weekStartTaipei(now: Date): string {
  const taipei = new Date(now.getTime() + 8 * 3600 * 1000);
  const day = taipei.getUTCDay(); // 0=Sun
  const diff = (day + 6) % 7; // days since Monday
  const monday = new Date(taipei.getTime() - diff * 86400 * 1000);
  return monday.toISOString().slice(0, 10);
}

export function summarizeProgress(state: unknown): RoleStats[] | null {
  const parsed = progressSchema.safeParse(state);
  if (!parsed.success) return null;
  const p: Progress = parsed.data;
  return (Object.keys(ROLES) as Role[]).map((role) => {
    const g = p.sessions[role];
    const m = eco(g, role);
    return { role, roleName: ROLES[role].name, month: g.month, trees: m.trees, improvement: m.improvement, satisfaction: g.satisfaction };
  });
}

export function buildSummaryPrompt(stats: RoleStats[], weekStart: string): string {
  const lines = stats.map((s) => `- ${s.roleName}：第 ${s.month} 個月，種了 ${s.trees} 棵樹，遊戲 TES 改善 +${s.improvement}，市民滿意度 ${s.satisfaction.toFixed(0)}/100`).join('\n');
  return `你是 TreeBack「台北見縫插樹」城市綠洲遊戲的每週回顧小幫手。以下是玩家 ${weekStart} 這一週三種角色的遊戲進度（皆為虛構遊戲參數，非真實環境數據）：\n${lines}\n\n請用繁體中文寫一段 120 字以內的每週回顧，語氣溫暖鼓勵，點出本週亮點並給一個下週小建議。必須註明數值為遊戲參數。不要列點，不要標題。`;
}
