-- ============================================================
-- NPTEL Score Calculator — Initial Schema Migration
-- ============================================================
-- Run this against your Supabase project:
--   supabase db push
-- Or paste into the Supabase SQL Editor.
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. COURSES
-- ============================================================

create table if not exists public.courses (
  id                uuid        primary key default gen_random_uuid(),
  course_code       text        not null,
  course_name       text        not null,
  institute         text        not null,
  instructor        text        not null,
  duration_weeks    integer     not null check (duration_weeks > 0),
  description       text        not null default '',
  course_url        text,
  discipline        text        not null,
  last_verified_at  date        not null default current_date,
  source            text        not null default '',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.courses is
  'NPTEL course catalogue. Each course has its own scoring rules.';

create unique index if not exists courses_course_code_idx on public.courses (course_code);

-- ============================================================
-- 2. COURSE RUNS
-- ============================================================

create table if not exists public.course_runs (
  id          uuid        primary key default gen_random_uuid(),
  course_id   uuid        not null references public.courses (id) on delete cascade,
  semester    text        not null,      -- e.g. 'Jan–Apr 2025'
  year        integer     not null,
  start_date  date,
  end_date    date,
  exam_date   date,
  is_active   boolean     not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.course_runs is
  'A specific semester offering of a course.';

create index if not exists course_runs_course_id_idx on public.course_runs (course_id);

-- ============================================================
-- 3. SCORING RULES
-- ============================================================

create table if not exists public.scoring_rules (
  id                        uuid        primary key default gen_random_uuid(),
  course_id                 uuid        not null references public.courses (id) on delete cascade,
  -- Weights must sum to 1.0
  assignment_weight         numeric(4,3) not null check (assignment_weight >= 0 and assignment_weight <= 1),
  exam_weight               numeric(4,3) not null check (exam_weight >= 0 and exam_weight <= 1),
  total_assignments         integer     not null check (total_assignments > 0),
  best_assignments          integer     not null check (best_assignments > 0),
  minimum_assignment_score  numeric(5,2) not null default 0 check (minimum_assignment_score >= 0),
  minimum_exam_score        numeric(5,2) not null default 0 check (minimum_exam_score >= 0),
  minimum_final_score       numeric(5,2) not null default 40 check (minimum_final_score >= 0),
  assignment_max_score      numeric(5,2) not null default 100,
  exam_max_score            numeric(5,2) not null default 100,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),

  constraint scoring_rules_weights_sum check (
    abs((assignment_weight + exam_weight) - 1.0) < 0.001
  ),
  constraint scoring_rules_best_lte_total check (
    best_assignments <= total_assignments
  )
);

comment on table public.scoring_rules is
  'Per-course configurable scoring rules. Weights must sum to 1.0.';

create unique index if not exists scoring_rules_course_id_idx on public.scoring_rules (course_id);

-- ============================================================
-- 4. CERTIFICATE RULES
-- ============================================================

create table if not exists public.certificate_rules (
  id                       uuid        primary key default gen_random_uuid(),
  scoring_rule_id          uuid        not null references public.scoring_rules (id) on delete cascade,
  name                     text        not null,   -- e.g. 'Elite + Gold'
  minimum_final_score      numeric(5,2) not null,
  minimum_assignment_score numeric(5,2),           -- NULL = no per-cert assignment minimum
  minimum_exam_score       numeric(5,2),           -- NULL = no per-cert exam minimum
  display_order            integer     not null default 1,
  created_at               timestamptz not null default now()
);

comment on table public.certificate_rules is
  'Per-certificate thresholds. Belong to a scoring_rule, not global.';

create index if not exists cert_rules_scoring_rule_id_idx on public.certificate_rules (scoring_rule_id);

-- ============================================================
-- 5. ASSIGNMENTS (weekly assignment definitions)
-- ============================================================

create table if not exists public.assignments (
  id            uuid        primary key default gen_random_uuid(),
  course_id     uuid        not null references public.courses (id) on delete cascade,
  week_number   integer     not null check (week_number >= 1),
  title         text        not null default '',
  maximum_score numeric(5,2) not null default 100,
  created_at    timestamptz not null default now(),

  constraint assignments_course_week_unique unique (course_id, week_number)
);

comment on table public.assignments is
  'Individual weekly assignment definitions for each course.';

create index if not exists assignments_course_id_idx on public.assignments (course_id);

-- ============================================================
-- 6. USERS (mirrors Supabase auth.users)
-- ============================================================

create table if not exists public.users (
  id          uuid        primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.users is
  'Public user profile — mirrors auth.users. Created on first login.';

-- ============================================================
-- 7. USER COURSES (saved courses per user)
-- ============================================================

create table if not exists public.user_courses (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.users (id) on delete cascade,
  course_id   uuid        not null references public.courses (id) on delete cascade,
  run_id      uuid        references public.course_runs (id) on delete set null,
  saved_at    timestamptz not null default now(),

  constraint user_courses_unique unique (user_id, course_id)
);

comment on table public.user_courses is
  'Courses bookmarked/saved by a user.';

create index if not exists user_courses_user_id_idx on public.user_courses (user_id);

-- ============================================================
-- 8. USER ASSIGNMENT SCORES
-- ============================================================

create table if not exists public.user_assignment_scores (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references public.users (id) on delete cascade,
  assignment_id uuid        not null references public.assignments (id) on delete cascade,
  score         numeric(5,2) not null check (score >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint user_assignment_scores_unique unique (user_id, assignment_id)
);

comment on table public.user_assignment_scores is
  'A user''s score for each weekly assignment.';

create index if not exists user_assignment_scores_user_id_idx on public.user_assignment_scores (user_id);
create index if not exists user_assignment_scores_assignment_id_idx on public.user_assignment_scores (assignment_id);

-- ============================================================
-- 9. MOCK TESTS
-- ============================================================

create table if not exists public.mock_tests (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.users (id) on delete cascade,
  course_id   uuid        not null references public.courses (id) on delete cascade,
  score       numeric(5,2) not null check (score >= 0 and score <= 100),
  taken_at    timestamptz not null default now(),
  notes       text
);

comment on table public.mock_tests is
  'Mock test scores entered by a user for exam prediction.';

create index if not exists mock_tests_user_course_idx on public.mock_tests (user_id, course_id);

-- ============================================================
-- 10. PREDICTIONS
-- ============================================================

create table if not exists public.predictions (
  id                      uuid        primary key default gen_random_uuid(),
  user_id                 uuid        not null references public.users (id) on delete cascade,
  course_id               uuid        not null references public.courses (id) on delete cascade,
  estimated_exam_score    numeric(5,2),
  estimated_final_score   numeric(5,2),
  estimated_range_low     numeric(5,2),
  estimated_range_high    numeric(5,2),
  confidence_level        text        check (confidence_level in ('high','medium','low','insufficient')),
  confidence_score        integer     check (confidence_score >= 0 and confidence_score <= 100),
  predictor_version       text        not null default 'rule-based-v1',
  created_at              timestamptz not null default now()
);

comment on table public.predictions is
  'Stored prediction results for each user/course combination.';

create index if not exists predictions_user_course_idx on public.predictions (user_id, course_id);

-- ============================================================
-- 11. UPDATED_AT TRIGGER FUNCTION
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at trigger to relevant tables
create or replace trigger courses_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

create or replace trigger scoring_rules_updated_at
  before update on public.scoring_rules
  for each row execute function public.set_updated_at();

create or replace trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create or replace trigger user_assignment_scores_updated_at
  before update on public.user_assignment_scores
  for each row execute function public.set_updated_at();

-- ============================================================
-- 12. AUTO-CREATE USER PROFILE ON SIGN-UP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
