import { createFileRoute } from '@tanstack/react-router';
import { generateResponse, GatewayError } from '@lovable.dev/ai-gateway';
import { authenticateCronRequest } from '@/integrations/supabase/cron-auth';
import { buildSummaryPrompt, summarizeProgress, weekStartTaipei } from '@/lib/treeback/summary-model';

const JOB = 'weekly-oasis-summary';
const BATCH_LIMIT = 20;

export const Route = createFileRoute('/api/public/jobs/weekly-oasis-summary')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;

        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

        // 暫停保護：被暫停的工作不再呼叫 AI
        const { data: job } = await supabaseAdmin.from('ai_job_runs').select('*').eq('job', JOB).single();
        if (job?.paused) {
          return Response.json({ skipped: true, reason: job.pause_reason ?? 'paused' });
        }

        // 單次執行鎖：十分鐘內只允許一個執行個體
        const now = new Date();
        if (job?.lease_until && new Date(job.lease_until) > now) {
          return Response.json({ skipped: true, reason: 'another run in progress' });
        }
        await supabaseAdmin.from('ai_job_runs').update({ lease_until: new Date(now.getTime() + 10 * 60 * 1000).toISOString(), last_run_at: now.toISOString() }).eq('job', JOB);

        const weekStart = weekStartTaipei(now);
        try {
          // 本週有玩過的玩家（進度在最近 8 天內更新），每批上限 BATCH_LIMIT
          const since = new Date(now.getTime() - 8 * 86400 * 1000).toISOString();
          const { data: rows, error } = await supabaseAdmin
            .from('oasis_progress')
            .select('user_id, state')
            .gte('updated_at', since)
            .limit(BATCH_LIMIT);
          if (error) throw error;

          // 冪等：已有本週摘要的玩家跳過
          const userIds = (rows ?? []).map((r) => r.user_id);
          const { data: existing } = userIds.length
            ? await supabaseAdmin.from('oasis_weekly_summaries').select('user_id').eq('week_start', weekStart).in('user_id', userIds)
            : { data: [] };
          const done = new Set((existing ?? []).map((r) => r.user_id));

          let created = 0;
          for (const row of rows ?? []) {
            if (done.has(row.user_id)) continue;
            const stats = summarizeProgress(row.state);
            if (!stats) continue;
            try {
              const res = await generateResponse({
                model: 'openai/gpt-6-astra',
                input: buildSummaryPrompt(stats, weekStart),
              });
              const text = (res as { output_text?: string }).output_text?.trim();
              if (!text) throw new Error('empty AI response');
              const { error: upErr } = await supabaseAdmin
                .from('oasis_weekly_summaries')
                .upsert({ user_id: row.user_id, week_start: weekStart, summary: text.slice(0, 2000) });
              if (upErr) throw upErr;
              created++;
            } catch (e) {
              // 熔斷：額度、權限或持續限速時暫停整個工作
              if (e instanceof GatewayError && (e.httpStatus === 402 || e.httpStatus === 403 || e.httpStatus === 429)) {
                await supabaseAdmin.from('ai_job_runs').update({ paused: true, pause_reason: `AI 呼叫被阻擋（HTTP ${e.httpStatus}），請檢查額度或權限後恢復`, lease_until: null }).eq('job', JOB);
                return Response.json({ paused: true, created, status: e.httpStatus });
              }
              throw e;
            }
          }

          await supabaseAdmin.from('ai_job_runs').update({ lease_until: null, last_result: `created ${created} summaries for week ${weekStart}` }).eq('job', JOB);
          return Response.json({ ok: true, weekStart, created, candidates: userIds.length });
        } catch (e) {
          await supabaseAdmin.from('ai_job_runs').update({ lease_until: null, last_result: `failed: ${e instanceof Error ? e.message : 'unknown'}` }).eq('job', JOB);
          return Response.json({ ok: false }, { status: 500 });
        }
      },
    },
  },
});
