import { describe, expect, it } from 'vitest';
import { cardDisclaimer, cardShareText, cardTitle, type CardData } from '@/lib/treeback/card-model';

const wish: CardData = { kind: 'wish', district: '大同區', reportKind: '空樹穴', note: '騎樓前', wishes: 3 };
const guardian: CardData = { kind: 'guardian', treeName: '榕', treeId: '304', address: '大同區保安里' };
const oasis: CardData = { kind: 'oasis', roleName: '熱血市民', month: 2, trees: 5, cooling: 1.2, oxygen: 30, improvement: 8 };

describe('card model', () => {
  it('gives each card kind a distinct title', () => {
    expect(cardTitle(wish)).toBe('這個樹穴，我許願的！');
    expect(cardTitle(guardian)).toBe('這棵大樹，我守護！');
    expect(cardTitle(oasis)).toBe('台北綠洲守護者');
  });
  it('always states the data boundary on the card', () => {
    expect(cardDisclaimer(wish)).toContain('未經市府查證');
    expect(cardDisclaimer(guardian)).toContain('文化局');
    expect(cardDisclaimer(oasis)).toContain('虛構遊戲參數');
  });
  it('builds share text with the card content', () => {
    expect(cardShareText(wish)).toContain('大同區');
    expect(cardShareText(guardian)).toContain('304');
    expect(cardShareText(oasis)).toContain('5 棵樹');
  });
});
