-- ============================================================
-- NPTEL Score Calculator — Row Level Security Policies
-- ============================================================
-- Run after 0001_initial_schema.sql
-- ============================================================

-- ── Enable RLS on all tables ──────────────────────────────────────────────────

alter table public.courses                  enable row level security;
alter table public.course_runs              enable row level security;
alter table public.scoring_rules            enable row level security;
alter table public.certificate_rules        enable row level security;
alter table public.assignments              enable row level security;
alter table public.users                    enable row level security;
alter table public.user_courses             enable row level security;
alter table public.user_assignment_scores   enable row level security;
alter table public.mock_tests               enable row level security;
alter table public.predictions              enable row level security;

-- ============================================================
-- PUBLIC READ — courses, rules, assignments (no login needed)
-- ============================================================

-- Anyone can read course data (anonymous calculator works without auth)
create policy "courses_public_read"
  on public.courses for select
  using (true);

create policy "course_runs_public_read"
  on public.course_runs for select
  using (true);

create policy "scoring_rules_public_read"
  on public.scoring_rules for select
  using (true);

create policy "certificate_rules_public_read"
  on public.certificate_rules for select
  using (true);

create policy "assignments_public_read"
  on public.assignments for select
  using (true);

-- Only service role can insert/update/delete course data
create policy "courses_service_write"
  on public.courses for all
  using (auth.role() = 'service_role');

create policy "scoring_rules_service_write"
  on public.scoring_rules for all
  using (auth.role() = 'service_role');

create policy "certificate_rules_service_write"
  on public.certificate_rules for all
  using (auth.role() = 'service_role');

create policy "assignments_service_write"
  on public.assignments for all
  using (auth.role() = 'service_role');

-- ============================================================
-- USERS — own row only
-- ============================================================

create policy "users_read_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- ============================================================
-- USER COURSES — own rows only
-- ============================================================

create policy "user_courses_read_own"
  on public.user_courses for select
  using (auth.uid() = user_id);

create policy "user_courses_insert_own"
  on public.user_courses for insert
  with check (auth.uid() = user_id);

create policy "user_courses_delete_own"
  on public.user_courses for delete
  using (auth.uid() = user_id);

-- ============================================================
-- USER ASSIGNMENT SCORES — own rows only
-- ============================================================

create policy "user_assignment_scores_read_own"
  on public.user_assignment_scores for select
  using (auth.uid() = user_id);

create policy "user_assignment_scores_insert_own"
  on public.user_assignment_scores for insert
  with check (auth.uid() = user_id);

create policy "user_assignment_scores_update_own"
  on public.user_assignment_scores for update
  using (auth.uid() = user_id);

create policy "user_assignment_scores_delete_own"
  on public.user_assignment_scores for delete
  using (auth.uid() = user_id);

-- ============================================================
-- MOCK TESTS — own rows only
-- ============================================================

create policy "mock_tests_read_own"
  on public.mock_tests for select
  using (auth.uid() = user_id);

create policy "mock_tests_insert_own"
  on public.mock_tests for insert
  with check (auth.uid() = user_id);

create policy "mock_tests_delete_own"
  on public.mock_tests for delete
  using (auth.uid() = user_id);

-- ============================================================
-- PREDICTIONS — own rows only
-- ============================================================

create policy "predictions_read_own"
  on public.predictions for select
  using (auth.uid() = user_id);

create policy "predictions_insert_own"
  on public.predictions for insert
  with check (auth.uid() = user_id);

create policy "predictions_delete_own"
  on public.predictions for delete
  using (auth.uid() = user_id);
