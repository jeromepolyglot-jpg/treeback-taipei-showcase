CREATE TABLE public.oasis_weekly_summaries (
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  summary text NOT NULL CHECK (char_length(summary) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, week_start)
);
GRANT SELECT ON public.oasis_weekly_summaries TO authenticated;
GRANT ALL ON public.oasis_weekly_summaries TO service_role;
ALTER TABLE public.oasis_weekly_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players read own summaries" ON public.oasis_weekly_summaries FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE TABLE public.ai_job_runs (
  job text PRIMARY KEY,
  lease_until timestamptz,
  paused boolean NOT NULL DEFAULT false,
  pause_reason text,
  last_run_at timestamptz,
  last_result text
);
GRANT ALL ON public.ai_job_runs TO service_role;
ALTER TABLE public.ai_job_runs ENABLE ROW LEVEL SECURITY;
INSERT INTO public.ai_job_runs (job) VALUES ('weekly-oasis-summary');