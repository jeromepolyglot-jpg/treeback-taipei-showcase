CREATE TABLE public.tree_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tree_id text NOT NULL,
  tree_label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tree_id)
);
GRANT SELECT, INSERT, DELETE ON public.tree_subscriptions TO authenticated;
GRANT ALL ON public.tree_subscriptions TO service_role;
ALTER TABLE public.tree_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players read own subscriptions" ON public.tree_subscriptions FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "Players create own subscriptions" ON public.tree_subscriptions FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Players delete own subscriptions" ON public.tree_subscriptions FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);
CREATE TABLE public.tree_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tree_id text NOT NULL,
  message text NOT NULL CHECK (char_length(message) <= 500),
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tree_alerts TO authenticated;
GRANT ALL ON public.tree_alerts TO service_role;
ALTER TABLE public.tree_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players read own alerts" ON public.tree_alerts FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "Players create own alerts" ON public.tree_alerts FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Players update own alerts" ON public.tree_alerts FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Players delete own alerts" ON public.tree_alerts FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);