import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { progressSchema } from './oasis-progress';

export const loadOasisProgress = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from('oasis_progress').select('version,state').eq('user_id', context.userId).maybeSingle();
  if (error) throw new Error('無法讀取進度，請重試。');
  if (!data) return null;
  if (data.version !== 1) throw new Error('此進度版本暫不支援，原存檔未更動。');
  return progressSchema.parse(data.state);
});
export const saveOasisProgress = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => progressSchema.parse(input)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from('oasis_progress').upsert({ user_id: context.userId, version: 1, state: data, updated_at: new Date().toISOString() });
  if (error) throw new Error('進度尚未保存，請重試。');
  return { saved: true };
});