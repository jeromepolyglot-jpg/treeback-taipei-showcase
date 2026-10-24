export type CardKind = 'wish' | 'guardian' | 'oasis';

export type CardData =
  | { kind: 'wish'; district: string; reportKind: string; note: string; wishes: number }
  | { kind: 'guardian'; treeName: string; treeId: string; address: string }
  | { kind: 'oasis'; roleName: string; month: number; trees: number; cooling: number; oxygen: number; improvement: number };

export const CARD_W = 1080;
export const CARD_H = 1350;

const INK = '#1d4a38';
const PAPER = '#f5f1e8';
const ACCENT = '#c96f2f';

export function cardTitle(d: CardData): string {
  if (d.kind === 'wish') return '這個樹穴，我許願的！';
  if (d.kind === 'guardian') return '這棵大樹，我守護！';
  return '台北綠洲守護者';
}

export function cardDisclaimer(d: CardData): string {
  if (d.kind === 'wish') return '市民通報 · 未經市府查證 · 不代表可以種植';
  if (d.kind === 'guardian') return '樹木資料來自臺北市文化局開放資料';
  return '所有數值均為虛構遊戲參數 · 非實測 · 非官方評分';
}

export function cardShareText(d: CardData): string {
  if (d.kind === 'wish') return `我在 ${d.district} 許願種一棵樹！（${d.reportKind}）#TreeBack 見縫插樹`;
  if (d.kind === 'guardian') return `我訂閱守護 ${d.treeName}（編號 ${d.treeId}）#TreeBack 大樹守護`;
  return `TreeBack 把樹還給日常！我是台北綠洲守護者，種下 ${d.trees} 棵樹 #TreeBack`;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number): number {
  let line = '', lines = 0;
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      ctx.fillText(line, x, y); y += lineHeight; lines++; line = ch;
      if (lines >= maxLines - 1) { while (ctx.measureText(line + '…').width > maxWidth && line) line = line.slice(0, -1); ctx.fillText(line + '…', x, y); return y + lineHeight; }
    } else line += ch;
  }
  if (line) { ctx.fillText(line, x, y); y += lineHeight; }
  return y;
}

export function drawCard(ctx: CanvasRenderingContext2D, d: CardData): void {
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.strokeRect(40, 40, CARD_W - 80, CARD_H - 80);
  ctx.textAlign = 'center';

  ctx.fillStyle = ACCENT; ctx.font = '600 30px sans-serif';
  ctx.fillText('TREEBACK · 台北見縫插樹', CARD_W / 2, 130);

  ctx.font = '150px serif';
  ctx.fillText(d.kind === 'wish' ? '🌱' : d.kind === 'guardian' ? '🌳' : '🏅', CARD_W / 2, 330);

  ctx.fillStyle = INK; ctx.font = '700 72px sans-serif';
  ctx.fillText(cardTitle(d), CARD_W / 2, 470);

  ctx.font = '400 40px sans-serif'; ctx.fillStyle = '#3c4a42';
  let y = 570;
  if (d.kind === 'wish') {
    ctx.fillText(`${d.district} · ${d.reportKind}`, CARD_W / 2, y); y += 70;
    if (d.note) y = wrap(ctx, d.note, CARD_W / 2, y, CARD_W - 240, 56, 3) + 10;
    ctx.font = '700 48px sans-serif'; ctx.fillStyle = ACCENT;
    ctx.fillText(`🌱 ${d.wishes} 人集氣`, CARD_W / 2, y + 30);
  } else if (d.kind === 'guardian') {
    ctx.font = '700 56px sans-serif'; ctx.fillStyle = INK;
    ctx.fillText(d.treeName, CARD_W / 2, y); y += 70;
    ctx.font = '400 40px sans-serif'; ctx.fillStyle = '#3c4a42';
    ctx.fillText(`編號 ${d.treeId}`, CARD_W / 2, y); y += 65;
    wrap(ctx, d.address, CARD_W / 2, y, CARD_W - 240, 56, 2);
  } else {
    ctx.fillText(`${d.roleName} · 第 ${d.month} 個月`, CARD_W / 2, y); y += 80;
    ctx.font = '700 110px sans-serif'; ctx.fillStyle = INK;
    ctx.fillText(`${d.trees}`, CARD_W / 2, y + 60);
    ctx.font = '400 36px sans-serif'; ctx.fillStyle = '#3c4a42';
    ctx.fillText('棵新樹', CARD_W / 2, y + 115); y += 200;
    ctx.font = '400 34px sans-serif';
    ctx.fillText(`遊戲降溫 ${d.cooling.toFixed(1)}°C · 遊戲增氧 ${d.oxygen}kg/年 · TES +${d.improvement}`, CARD_W / 2, y);
  }

  ctx.font = '400 28px sans-serif'; ctx.fillStyle = '#7a7f76';
  ctx.fillText(cardDisclaimer(d), CARD_W / 2, CARD_H - 170);
  ctx.fillStyle = INK; ctx.font = '600 34px sans-serif';
  ctx.fillText('TreeBack 把樹還給日常！', CARD_W / 2, CARD_H - 105);
}
