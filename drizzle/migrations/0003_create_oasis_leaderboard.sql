CREATE TABLE public.oasis_leaderboard (
  user_id uuid PRIMARY KEY,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 24),
  role text NOT NULL CHECK (role IN ('citizen','enterprise','official')),
  trees integer NOT NULL DEFAULT 0 CHECK (trees >= 0),
  improvement integer NOT NULL DEFAULT 0,
  month integer NOT NULL DEFAULT 1 CHECK (month >= 1),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.oasis_leaderboard TO anon;
GRANT SELECT, DELETE ON public.oasis_leaderboard TO authenticated;
GRANT ALL ON public.oasis_leaderboard TO service_role;
ALTER TABLE public.oasis_leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read leaderboard" ON public.oasis_leaderboard FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Players remove own score" ON public.oasis_leaderboard FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);
CREATE OR REPLACE FUNCTION public.publish_oasis_score(_display_name text, _role text, _trees integer, _improvement integer, _month integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _role NOT IN ('citizen','enterprise','official') THEN RAISE EXCEPTION 'invalid role'; END IF;
  IF char_length(trim(_display_name)) < 1 OR char_length(_display_name) > 24 THEN RAISE EXCEPTION 'invalid display name'; END IF;
  INSERT INTO public.oasis_leaderboard (user_id, display_name, role, trees, improvement, month, updated_at)
  VALUES (auth.uid(), trim(_display_name), _role, GREATEST(0, _trees), _improvement, GREATEST(1, _month), now())
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    trees = EXCLUDED.trees,
    improvement = EXCLUDED.improvement,
    month = EXCLUDED.month,
    updated_at = now();
END;
$$;
REVOKE ALL ON FUNCTION public.publish_oasis_score(text, text, integer, integer, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.publish_oasis_score(text, text, integer, integer, integer) TO authenticated;