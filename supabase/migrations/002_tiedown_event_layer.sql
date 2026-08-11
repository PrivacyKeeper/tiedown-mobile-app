-- 002 — Tie-down roping event layer

CREATE TABLE IF NOT EXISTS public.horses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  barn_name TEXT NOT NULL,
  registered_name TEXT,
  registry TEXT,
  registration_number TEXT,
  sex TEXT,
  foaling_year INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.td_calves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID,
  tag TEXT,
  weight_lb INTEGER,
  speed_rating INTEGER,
  stop_flag BOOLEAN NOT NULL DEFAULT false,
  duck_flag BOOLEAN NOT NULL DEFAULT false,
  kick_rating INTEGER,
  times_used INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS public.td_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID REFERENCES public.horses(id) ON DELETE SET NULL,
  calf_id UUID REFERENCES public.td_calves(id) ON DELETE SET NULL,
  rule_set_id UUID REFERENCES public.rule_sets(id),
  raw_time_ms INTEGER,
  official_time_ms INTEGER,
  catch_ok BOOLEAN,
  calf_thrown_by_hand BOOLEAN,
  legs_tied INTEGER,
  wrap_and_hooey BOOLEAN,
  tie_held BOOLEAN,
  barrier_broken BOOLEAN NOT NULL DEFAULT false,
  loops_thrown INTEGER NOT NULL DEFAULT 1,
  jerk_down BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'clean',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The segment model is the schema that makes this app worth paying for.
CREATE TABLE IF NOT EXISTS public.tie_down_segments (
  run_id UUID PRIMARY KEY REFERENCES public.td_runs(id) ON DELETE CASCADE,
  barrier_break_ms INTEGER,
  leave_box_ms INTEGER,
  catch_ms INTEGER,
  slack_pulled_ms INTEGER,
  dismount_ms INTEGER,
  down_the_rope_ms INTEGER,
  flank_ms INTEGER,
  string_on_ms INTEGER,
  tie_complete_ms INTEGER,
  remount_ms INTEGER,
  horse_step_ms INTEGER,
  judge_approve_ms INTEGER,
  segment_source TEXT NOT NULL DEFAULT 'ai'
    CHECK (segment_source IN ('ai','manual','imported'))
);

-- Public, dimension-by-dimension calf horse ratings. Also the backbone of the
-- marketplace: a horse with an accumulated rating history across riders is
-- worth more and sells faster.
CREATE TABLE IF NOT EXISTS public.td_horse_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id UUID NOT NULL REFERENCES public.horses(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_out_of_box INTEGER CHECK (score_out_of_box BETWEEN 1 AND 10),
  rate INTEGER CHECK (rate BETWEEN 1 AND 10),
  stop INTEGER CHECK (stop BETWEEN 1 AND 10),
  works_rope INTEGER CHECK (works_rope BETWEEN 1 AND 10),
  quiet_in_box INTEGER CHECK (quiet_in_box BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (horse_id, rater_id)
);

CREATE TABLE IF NOT EXISTS public.piggin_strings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand TEXT,
  material TEXT,
  length_in INTEGER,
  runs_count INTEGER NOT NULL DEFAULT 0,
  retired_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.td_practice_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID REFERENCES public.horses(id) ON DELETE SET NULL,
  hand_timed_ms INTEGER,
  segments JSONB,
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_official BOOLEAN NOT NULL DEFAULT false CHECK (is_official = false)
);

ALTER TABLE public.horses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.td_calves         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.td_runs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tie_down_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.td_horse_ratings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piggin_strings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.td_practice_runs  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own horses" ON public.horses;
CREATE POLICY "Users manage own horses" ON public.horses FOR ALL
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "Calves are readable" ON public.td_calves;
CREATE POLICY "Calves are readable" ON public.td_calves FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users manage own runs" ON public.td_runs;
CREATE POLICY "Users manage own runs" ON public.td_runs FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Segments follow the run" ON public.tie_down_segments;
CREATE POLICY "Segments follow the run" ON public.tie_down_segments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.td_runs r
                 WHERE r.id = tie_down_segments.run_id AND r.user_id = auth.uid()));
DROP POLICY IF EXISTS "Horse ratings are public" ON public.td_horse_ratings;
CREATE POLICY "Horse ratings are public" ON public.td_horse_ratings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users write own ratings" ON public.td_horse_ratings;
CREATE POLICY "Users write own ratings" ON public.td_horse_ratings FOR INSERT
  WITH CHECK (rater_id = auth.uid());
DROP POLICY IF EXISTS "Users manage own strings" ON public.piggin_strings;
CREATE POLICY "Users manage own strings" ON public.piggin_strings FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Users manage own practice" ON public.td_practice_runs;
CREATE POLICY "Users manage own practice" ON public.td_practice_runs FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
