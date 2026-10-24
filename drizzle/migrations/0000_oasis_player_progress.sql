CREATE TABLE public.oasis_progress (
 user_id uuid PRIMARY KEY,
 version integer NOT NULL DEFAULT 1,
 state jsonb NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.oasis_progress TO authenticated;
GRANT ALL ON public.oasis_progress TO service_role;
ALTER TABLE public.oasis_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players read own progress" ON public.oasis_progress FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "Players create own progress" ON public.oasis_progress FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Players update own progress" ON public.oasis_progress FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);