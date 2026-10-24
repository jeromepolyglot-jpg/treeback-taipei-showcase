import { describe, expect, it } from 'vitest';
import { newGame, plant, eco, unpave, SPECIES } from '../lib/treeback/oasis-model';
describe('城市綠洲遊戲規則', () => {
  it('市民基金 1000 元', () => expect(newGame('citizen').budget).toBe(1000));
  it('科企基金 20000 元', () => expect(newGame('enterprise').budget).toBe(20000));
  it('政府基金 100000 元', () => expect(newGame('official').budget).toBe(100000));
  it('四種樹成本為 800/1200/1000/1500', () => expect(SPECIES.map(s => s.cost)).toEqual([800,1200,1000,1500]));
  it('市民滿意度收益增加20%', () => expect(plant(newGame('citizen'), 'citizen', '大同區', 0, 'bischofia').satisfaction).toBe(56));
  it('科企固碳收益為1.5倍', () => expect(eco(plant(newGame('enterprise'), 'enterprise', '大同區', 0, 'camphor'), 'enterprise').carbon).toBe(67.5));
  it('茄苳遊戲加成為氧氣130、降溫0.8、美觀15', () => { const e=eco(plant(newGame('citizen'), 'citizen', '大同區',0,'bischofia'),'citizen'); expect([e.oxygen,e.cooling,e.beauty]).toEqual([130,.8,40]); });
  it('預算不足不可種樟樹', () => {const g=newGame('citizen');expect(plant(g,'citizen','大同區',0,'camphor')).toBe(g);});
  it('水泥必須先拆除才能種樹', () => { const g=newGame('official');expect(plant(g,'official','大同區',1,'bischofia')).toBe(g);const next=unpave(g,'大同區',1);expect(next.budget).toBe(99700);expect(plant(next,'official','大同區',1,'bischofia').boards['大同區'][1]?.kind).toBe('tree');});
  it('美觀與遊戲TES不超過100', () => {let g=newGame('official');g=unpave(g,'大同區');for(let i=0;i<30;i++) g=plant(g,'official','大同區',i,'rain');const e=eco(g,'official','大同區');expect(e.beauty).toBe(100);expect(e.tes).toBe(100);});
});