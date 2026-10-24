import { z } from 'zod';
import { AREAS, newGame, SPECIES, type Tile } from './oasis-model';

export const eventSchema = z.enum(['construction', 'heat', 'rain']).nullable();
const tileSchema = z.object({ kind: z.enum(['well','cement','sidewalk','tree']), species: z.string().refine(id => SPECIES.some(s => s.id === id)).optional(), age: z.number().finite().nonnegative().optional(), planted: z.boolean().optional(), wished: z.boolean().optional(), sensor: z.boolean().optional() }).transform((t): Tile => ({ kind: t.kind, ...(t.species !== undefined ? { species: t.species } : {}), ...(t.age !== undefined ? { age: t.age } : {}), ...(t.planted !== undefined ? { planted: t.planted } : {}), ...(t.wished !== undefined ? { wished: t.wished } : {}), ...(t.sensor !== undefined ? { sensor: t.sensor } : {}) }));
const gameSchema = z.object({ budget: z.number().finite().nonnegative(), month: z.number().int().min(1), satisfaction: z.number().min(0).max(100), boards: z.object({ 大同區: z.array(tileSchema).length(30), 萬華區: z.array(tileSchema).length(30), 中山區: z.array(tileSchema).length(30), 信義區: z.array(tileSchema).length(30) }), logs: z.array(z.string().max(1000)).max(1000), zone: z.boolean(), offset: z.boolean(), alerts: z.boolean() });
export const progressSchema = z.object({ role: z.enum(['citizen','enterprise','official']), area: z.enum(AREAS), event: eventSchema, sessions: z.object({ citizen: gameSchema, enterprise: gameSchema, official: gameSchema }) });
export type Progress = z.infer<typeof progressSchema>;
export function initialProgress(): Progress {
  return { role: 'citizen', area: '大同區', event: null, sessions: { citizen: newGame('citizen'), enterprise: newGame('enterprise'), official: newGame('official') } };
}