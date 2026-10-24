CREATE TABLE public.tree_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('空樹穴','水泥填平','寬敞人行道')),
  district text NOT NULL CHECK (district IN ('大同區','萬華區','中正區','中山區','松山區','大安區','信義區','南港區','士林區','內湖區','北投區','文山區')),
  note text NOT NULL DEFAULT '' CHECK (char_length(note) <= 500),
  lat double precision,
  lng double precision,
  photo_path text,
  wishes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tree_reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tree_reports TO authenticated;
GRANT ALL ON public.tree_reports TO service_role;
ALTER TABLE public.tree_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reports" ON public.tree_reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Players create own reports" ON public.tree_reports FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Players update own reports" ON public.tree_reports FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Players delete own reports" ON public.tree_reports FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);
CREATE OR REPLACE FUNCTION public.increment_wishes(_report_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.tree_reports SET wishes = wishes + 1 WHERE id = _report_id;
$$;
REVOKE ALL ON FUNCTION public.increment_wishes(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.increment_wishes(uuid) TO anon, authenticated;
CREATE POLICY "Anyone can read report photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'report-photos');
CREATE POLICY "Players upload own report photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'report-photos' AND (storage.foldername(name))[1] = (select auth.uid())::text);
CREATE POLICY "Players delete own report photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'report-photos' AND (storage.foldername(name))[1] = (select auth.uid())::text);