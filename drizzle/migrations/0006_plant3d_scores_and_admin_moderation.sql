CREATE TABLE public.plant3d_scores (
  user_id uuid not null,
  display_name text not null,
  trees integer not null,
  created_at timestamptz not null default now(),
  PRIMARY KEY (user_id, created_at)
);
GRANT SELECT ON public.plant3d_scores TO anon, authenticated;
GRANT DELETE ON public.plant3d_scores TO authenticated;
GRANT ALL ON public.plant3d_scores TO service_role;
ALTER TABLE public.plant3d_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read plant3d scores" ON public.plant3d_scores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Players remove own plant3d score" ON public.plant3d_scores FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Admins can delete plant3d scores" ON public.plant3d_scores FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.publish_plant3d_score(_display_name text, _trees integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _display_name IS NULL OR char_length(trim(_display_name)) < 1 OR char_length(_display_name) > 20 THEN
    RAISE EXCEPTION 'invalid display name';
  END IF;
  IF _trees IS NULL OR _trees < 1 OR _trees > 500 THEN
    RAISE EXCEPTION 'invalid tree count';
  END IF;
  INSERT INTO public.plant3d_scores (user_id, display_name, trees) VALUES (_uid, trim(_display_name), _trees);
END;
$$;

CREATE POLICY "Admins can delete reports" ON public.tree_reports FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete subscriptions" ON public.tree_subscriptions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete alerts" ON public.tree_alerts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete leaderboard entries" ON public.oasis_leaderboard FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.admin_reset_sim_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _reports int; _subs int; _alerts int; _board int;
BEGIN
  IF _uid IS NULL OR NOT public.has_role(_uid, 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  DELETE FROM public.tree_reports WHERE user_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS _reports = ROW_COUNT;
  DELETE FROM public.tree_subscriptions WHERE user_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS _subs = ROW_COUNT;
  DELETE FROM public.tree_alerts WHERE user_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS _alerts = ROW_COUNT;
  DELETE FROM public.oasis_leaderboard WHERE display_name LIKE '模擬玩家%' OR user_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS _board = ROW_COUNT;
  RETURN jsonb_build_object('reports', _reports, 'subscriptions', _subs, 'alerts', _alerts, 'leaderboard', _board);
END;
$$;