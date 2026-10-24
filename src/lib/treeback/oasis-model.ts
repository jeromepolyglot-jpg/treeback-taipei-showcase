export type Role = 'citizen' | 'enterprise' | 'official';
export const ROLES = {
  citizen: { name: '市民', english: 'CITIZEN', budget: 1000, perk: '滿意度 +20% · 社群許願', mission: '從一個空樹穴開始，讓社區多一片樹蔭。' },
  enterprise: { name: '科企人員', english: 'ENTERPRISE CSR', budget: 20000, perk: '固碳收益 ×1.5 · 智慧感測', mission: '贊助口袋公園，串起社區的智慧綠廊。' },
  official: { name: '政府人員', english: 'CITY OFFICIAL', budget: 100000, perk: '綠化專區 · 批次拆除 · 施工監督', mission: '修復樹蔭不足的街區，守住城市的大樹。' },
} as const;
export const SPECIES = [
  { id: 'bischofia', name: '茄苳', latin: 'Bischofia javanica', cost: 800, oxygen: 130, carbon: 0, cooling: .8, beauty: 15, canopy: '極大', years: 15, icon: '🌳', note: '常綠大喬木；種植前須確認根系與樹冠所需空間。' },
  { id: 'camphor', name: '樟樹', latin: 'Cinnamomum camphora', cost: 1200, oxygen: 120, carbon: 45, cooling: 0, beauty: 20, canopy: '大', years: 12, icon: '🌿', note: '常綠喬木；不適合以狹小樹穴限制長期生長。' },
  { id: 'rain', name: '台灣欒樹', latin: 'Koelreuteria elegans subsp. formosana', cost: 1000, oxygen: 90, carbon: 0, cooling: .5, beauty: 30, canopy: '中', years: 10, icon: '🌼', note: '季節性的花果色彩，是觀察城市物候的好對象。' },
  { id: 'sweetgum', name: '楓香', latin: 'Liquidambar formosana', cost: 1500, oxygen: 0, carbon: 50, cooling: .6, beauty: 25, canopy: '中大', years: 12, icon: '🍁', note: '落葉喬木；選址仍需確認土壤、排水與可用空間。' },
] as const;
export const AREAS = ['大同區', '萬華區', '中山區', '信義區'] as const;
export type Area = typeof AREAS[number];
export type Tile = { kind: 'well' | 'cement' | 'sidewalk' | 'tree'; species?: string; age?: number; planted?: boolean; wished?: boolean; sensor?: boolean };
export type Game = { budget: number; month: number; satisfaction: number; boards: Record<Area, Tile[]>; logs: string[]; zone: boolean; offset: boolean; alerts: boolean };
export function newGame(role: Role): Game {
  const boards = Object.fromEntries(AREAS.map((area, a) => [area, Array.from({ length: 30 }, (_, i): Tile => {
    const kind = (['well', 'cement', 'sidewalk', 'cement', 'tree', 'sidewalk'] as const)[(i + a * 2 + Math.floor(i / 6)) % 6] ?? 'well';
    return kind === 'tree' ? { kind, species: SPECIES[i % 4]?.id ?? 'bischofia', age: 40 } : { kind };
  })])) as Record<Area, Tile[]>;
  return { budget: ROLES[role].budget, month: 1, satisfaction: 50, boards, logs: ['綠洲計畫啟動，基金已到位。'], zone: false, offset: false, alerts: false };
}
export function eco(game: Game, role: Role, area?: Area) {
  const tiles = area ? game.boards[area] : Object.values(game.boards).flat();
  const trees = tiles.filter(t => t.planted);
  const species = trees.map(t => SPECIES.find(s => s.id === t.species));
  const oxygen = species.reduce((sum, s) => sum + (s?.oxygen ?? 0), 0);
  const carbon = species.reduce((sum, s) => sum + (s?.carbon ?? 0), 0) * (role === 'enterprise' ? 1.5 : 1);
  const cooling = species.reduce((sum, s) => sum + (s?.cooling ?? 0), 0);
  const beauty = Math.min(100, 25 + species.reduce((sum, s) => sum + (s?.beauty ?? 0), 0));
  // A deliberately fictional game progress score, not the existing TES formula.
  const tes = Math.min(100, 35 + trees.length * 5 + tiles.filter(t => t.kind === 'well').length);
  const initial = area ? newGame(role).boards[area] : Object.values(newGame(role).boards).flat();
  return { trees: trees.length, oxygen, carbon, cooling, beauty, tes, improvement: tes - (35 + initial.filter(t => t.kind === 'well').length) };
}
export function plant(game: Game, role: Role, area: Area, index: number, speciesId: string): Game {
  const tile = game.boards[area][index];
  const s = SPECIES.find(s => s.id === speciesId);
  if (!tile || !s || tile.kind === 'tree' || tile.kind === 'cement' || game.budget < s.cost) return game;
  const boards = { ...game.boards, [area]: game.boards[area].map((t, i) => i === index ? { kind: 'tree' as const, species: s.id, age: 0, planted: true } : t) };
  return { ...game, boards, budget: game.budget - s.cost, satisfaction: Math.min(100, game.satisfaction + 5 * (role === 'citizen' ? 1.2 : 1)), logs: [`${area}種下${s.name}，支出 $${s.cost.toLocaleString()}。`, ...game.logs] };
}
export function unpave(game: Game, area: Area, index?: number): Game {
  const indices = game.boards[area].flatMap((t, i) => t.kind === 'cement' && (index === undefined || index === i) ? [i] : []);
  const cost = indices.length * 300;
  if (!indices.length || game.budget < cost) return game;
  return { ...game, budget: game.budget - cost, boards: { ...game.boards, [area]: game.boards[area].map((t, i) => indices.includes(i) ? { kind: 'well' as const } : t) }, logs: [`${area}還原 ${indices.length} 處土壤，支出 $${cost.toLocaleString()}。`, ...game.logs] };
}
export function nextMonth(game: Game): Game {
  return { ...game, month: game.month + 1, boards: Object.fromEntries(AREAS.map(a => [a, game.boards[a].map(t => t.kind === 'tree' ? { ...t, age: (t.age ?? 0) + 1 / 12 } : t)])) as Game['boards'] };
}