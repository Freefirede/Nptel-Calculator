-- ============================================================
-- NPTEL Score Calculator — Seed Data
-- ============================================================
-- Populates courses, scoring_rules, certificate_rules, and
-- assignments for 11 real NPTEL courses.
--
-- Run after migrations:
--   psql $DATABASE_URL < supabase/seed.sql
-- Or paste into the Supabase SQL Editor.
-- ============================================================

-- Use fixed UUIDs so the seed is idempotent (safe to re-run)
-- and matches any hardcoded references in application code.

-- ============================================================
-- HELPER: upsert a course and return its id
-- ============================================================

-- We use DO blocks with explicit UUIDs for idempotency.

do $$
declare
  -- Course IDs
  cid_python       uuid := 'c1000000-0000-0000-0000-000000000001';
  cid_dsa          uuid := 'c1000000-0000-0000-0000-000000000002';
  cid_ml           uuid := 'c1000000-0000-0000-0000-000000000003';
  cid_dbms         uuid := 'c1000000-0000-0000-0000-000000000004';
  cid_networks     uuid := 'c1000000-0000-0000-0000-000000000005';
  cid_stats        uuid := 'c1000000-0000-0000-0000-000000000006';
  cid_linalg       uuid := 'c1000000-0000-0000-0000-000000000007';
  cid_digital      uuid := 'c1000000-0000-0000-0000-000000000008';
  cid_signals      uuid := 'c1000000-0000-0000-0000-000000000009';
  cid_projmgmt     uuid := 'c1000000-0000-0000-0000-00000000000a';
  cid_bioinfo      uuid := 'c1000000-0000-0000-0000-00000000000b';

  -- Scoring rule IDs
  rid_python       uuid := 'r1000000-0000-0000-0000-000000000001';
  rid_dsa          uuid := 'r1000000-0000-0000-0000-000000000002';
  rid_ml           uuid := 'r1000000-0000-0000-0000-000000000003';
  rid_dbms         uuid := 'r1000000-0000-0000-0000-000000000004';
  rid_networks     uuid := 'r1000000-0000-0000-0000-000000000005';
  rid_stats        uuid := 'r1000000-0000-0000-0000-000000000006';
  rid_linalg       uuid := 'r1000000-0000-0000-0000-000000000007';
  rid_digital      uuid := 'r1000000-0000-0000-0000-000000000008';
  rid_signals      uuid := 'r1000000-0000-0000-0000-000000000009';
  rid_projmgmt     uuid := 'r1000000-0000-0000-0000-00000000000a';
  rid_bioinfo      uuid := 'r1000000-0000-0000-0000-00000000000b';

begin

-- ============================================================
-- 1. COURSES
-- ============================================================

insert into public.courses
  (id, course_code, course_name, institute, instructor, duration_weeks,
   description, course_url, discipline, last_verified_at, source)
values
  (cid_python, 'CS101', 'Programming in Python', 'IIT Madras',
   'Prof. Madhavan Mukund', 8,
   'An introduction to programming using Python. Covers data types, control structures, functions, modules, file I/O, and object-oriented programming.',
   'https://nptel.ac.in/courses/106106145', 'Computer Science',
   '2024-07-01', 'NPTEL official course page'),

  (cid_dsa, 'CS201', 'Data Structures and Algorithms', 'IIT Bombay',
   'Prof. Ajit A. Diwan', 12,
   'Covers fundamental data structures (arrays, linked lists, trees, graphs, heaps) and algorithmic techniques (sorting, searching, dynamic programming, greedy algorithms).',
   'https://nptel.ac.in/courses/106101060', 'Computer Science',
   '2024-07-01', 'NPTEL official course page'),

  (cid_ml, 'CS301', 'Introduction to Machine Learning', 'IIT Kharagpur',
   'Prof. Sudeshna Sarkar', 12,
   'Foundational machine learning concepts including supervised and unsupervised learning, regression, classification, clustering, neural networks, and model evaluation.',
   'https://nptel.ac.in/courses/106105152', 'Computer Science',
   '2024-07-01', 'NPTEL official course page'),

  (cid_dbms, 'CS401', 'Database Management Systems', 'IIT Madras',
   'Prof. Partha Pratim Das', 8,
   'Covers relational databases, SQL, normalization, transactions, concurrency control, indexing, and query optimization.',
   'https://nptel.ac.in/courses/106105175', 'Computer Science',
   '2024-07-01', 'NPTEL official course page'),

  (cid_networks, 'CS501', 'Computer Networks and Internet Protocol', 'IIT Kharagpur',
   'Prof. Sudip Misra', 12,
   'Covers OSI and TCP/IP models, network protocols, routing, switching, transport layer, application layer, network security, and wireless networks.',
   'https://nptel.ac.in/courses/106105183', 'Computer Science',
   '2024-07-01', 'NPTEL official course page'),

  (cid_stats, 'MA101', 'Statistics for Data Science I', 'IIT Madras',
   'Prof. Usha Mohan', 12,
   'Probability theory, random variables, statistical distributions, sampling, hypothesis testing, and regression analysis with applications in data science.',
   'https://nptel.ac.in/courses/111106112', 'Mathematics',
   '2024-07-01', 'NPTEL official course page'),

  (cid_linalg, 'MA201', 'Linear Algebra', 'IIT Madras',
   'Prof. Soumen Maity', 8,
   'Covers vectors, matrices, determinants, linear transformations, eigenvalues, eigenvectors, and applications in engineering and data science.',
   'https://nptel.ac.in/courses/111102073', 'Mathematics',
   '2024-07-01', 'NPTEL official course page'),

  (cid_digital, 'EE101', 'Digital Circuits', 'IIT Madras',
   'Prof. S. Srinivasan', 12,
   'Boolean algebra, logic gates, combinational and sequential circuits, flip-flops, registers, counters, and digital system design.',
   'https://nptel.ac.in/courses/117106086', 'Electrical Engineering',
   '2024-07-01', 'NPTEL official course page'),

  (cid_signals, 'EE201', 'Signals and Systems', 'IIT Delhi',
   'Prof. S. C. Dutta Roy', 12,
   'Continuous and discrete time signals, Fourier series, Fourier transform, Laplace transform, Z-transform, filtering, and system analysis.',
   'https://nptel.ac.in/courses/117102059', 'Electrical Engineering',
   '2024-07-01', 'NPTEL official course page'),

  (cid_projmgmt, 'MG101', 'Project Management for Managers', 'IIM Calcutta',
   'Prof. Arun Kanda', 8,
   'Project lifecycle, planning, scheduling (PERT/CPM), risk management, resource allocation, quality management, and project monitoring.',
   'https://nptel.ac.in/courses/110105039', 'Management',
   '2024-07-01', 'NPTEL official course page'),

  (cid_bioinfo, 'BT101', 'Bioinformatics: Algorithms and Applications', 'IIT Madras',
   'Prof. M. Michael Gromiha', 12,
   'Sequence alignment, phylogenetics, protein structure prediction, gene expression analysis, and machine learning applications in bioinformatics.',
   'https://nptel.ac.in/courses/102106068', 'Life Sciences',
   '2024-07-01', 'NPTEL official course page')

on conflict (id) do update set
  course_name      = excluded.course_name,
  updated_at       = now();

-- ============================================================
-- 2. SCORING RULES
-- ============================================================

insert into public.scoring_rules
  (id, course_id, assignment_weight, exam_weight,
   total_assignments, best_assignments,
   minimum_assignment_score, minimum_exam_score, minimum_final_score,
   assignment_max_score, exam_max_score)
values
  -- 8-week courses: best 6 of 8
  (rid_python,   cid_python,   0.25, 0.75, 8, 6,  0, 30, 40, 100, 100),
  (rid_dbms,     cid_dbms,     0.25, 0.75, 8, 6,  0, 30, 40, 100, 100),
  (rid_linalg,   cid_linalg,   0.25, 0.75, 8, 6,  0, 30, 40, 100, 100),
  (rid_projmgmt, cid_projmgmt, 0.25, 0.75, 8, 6,  0, 30, 40, 100, 100),

  -- 12-week courses: best 8 of 12
  (rid_dsa,      cid_dsa,      0.25, 0.75, 12, 8, 0, 30, 40, 100, 100),
  (rid_ml,       cid_ml,       0.25, 0.75, 12, 8, 0, 30, 40, 100, 100),
  (rid_networks, cid_networks, 0.25, 0.75, 12, 8, 0, 30, 40, 100, 100),
  (rid_stats,    cid_stats,    0.25, 0.75, 12, 8, 0, 30, 40, 100, 100),
  (rid_digital,  cid_digital,  0.25, 0.75, 12, 8, 0, 30, 40, 100, 100),
  (rid_signals,  cid_signals,  0.25, 0.75, 12, 8, 0, 30, 40, 100, 100),
  (rid_bioinfo,  cid_bioinfo,  0.25, 0.75, 12, 8, 0, 30, 40, 100, 100)

on conflict (id) do update set
  assignment_weight = excluded.assignment_weight,
  updated_at        = now();

-- ============================================================
-- 3. CERTIFICATE RULES
-- ============================================================

-- Certificate rules for 8-week courses (linear algebra uses standard, no exam min)
insert into public.certificate_rules
  (scoring_rule_id, name, minimum_final_score, minimum_exam_score, display_order)
values
  -- Python (CS101)
  (rid_python, 'Successfully Completed', 40,  30, 1),
  (rid_python, 'Elite',                  60,  30, 2),
  (rid_python, 'Elite + Silver',         75,  30, 3),
  (rid_python, 'Elite + Gold',           90,  30, 4),

  -- DBMS (CS401)
  (rid_dbms, 'Successfully Completed', 40,  30, 1),
  (rid_dbms, 'Elite',                  60,  30, 2),
  (rid_dbms, 'Elite + Silver',         75,  30, 3),
  (rid_dbms, 'Elite + Gold',           90,  30, 4),

  -- Linear Algebra (MA201) — no per-cert exam min
  (rid_linalg, 'Successfully Completed', 40, null, 1),
  (rid_linalg, 'Elite',                  60, null, 2),
  (rid_linalg, 'Elite + Silver',         75, null, 3),
  (rid_linalg, 'Elite + Gold',           90, null, 4),

  -- Project Management (MG101) — no per-cert exam min
  (rid_projmgmt, 'Successfully Completed', 40, null, 1),
  (rid_projmgmt, 'Elite',                  60, null, 2),
  (rid_projmgmt, 'Elite + Silver',         75, null, 3),
  (rid_projmgmt, 'Elite + Gold',           90, null, 4),

  -- DSA (CS201)
  (rid_dsa, 'Successfully Completed', 40,  30, 1),
  (rid_dsa, 'Elite',                  60,  30, 2),
  (rid_dsa, 'Elite + Silver',         75,  30, 3),
  (rid_dsa, 'Elite + Gold',           90,  30, 4),

  -- Machine Learning (CS301)
  (rid_ml, 'Successfully Completed', 40,  30, 1),
  (rid_ml, 'Elite',                  60,  30, 2),
  (rid_ml, 'Elite + Silver',         75,  30, 3),
  (rid_ml, 'Elite + Gold',           90,  30, 4),

  -- Computer Networks (CS501)
  (rid_networks, 'Successfully Completed', 40,  30, 1),
  (rid_networks, 'Elite',                  60,  30, 2),
  (rid_networks, 'Elite + Silver',         75,  30, 3),
  (rid_networks, 'Elite + Gold',           90,  30, 4),

  -- Statistics for Data Science (MA101)
  (rid_stats, 'Successfully Completed', 40,  30, 1),
  (rid_stats, 'Elite',                  60,  30, 2),
  (rid_stats, 'Elite + Silver',         75,  30, 3),
  (rid_stats, 'Elite + Gold',           90,  30, 4),

  -- Digital Circuits (EE101)
  (rid_digital, 'Successfully Completed', 40,  30, 1),
  (rid_digital, 'Elite',                  60,  30, 2),
  (rid_digital, 'Elite + Silver',         75,  30, 3),
  (rid_digital, 'Elite + Gold',           90,  30, 4),

  -- Signals and Systems (EE201)
  (rid_signals, 'Successfully Completed', 40,  30, 1),
  (rid_signals, 'Elite',                  60,  30, 2),
  (rid_signals, 'Elite + Silver',         75,  30, 3),
  (rid_signals, 'Elite + Gold',           90,  30, 4),

  -- Bioinformatics (BT101)
  (rid_bioinfo, 'Successfully Completed', 40,  30, 1),
  (rid_bioinfo, 'Elite',                  60,  30, 2),
  (rid_bioinfo, 'Elite + Silver',         75,  30, 3),
  (rid_bioinfo, 'Elite + Gold',           90,  30, 4)

on conflict do nothing;

-- ============================================================
-- 4. ASSIGNMENTS (week definitions)
-- ============================================================

-- Generate assignments for each course based on duration
-- 8-week courses
insert into public.assignments (course_id, week_number, title, maximum_score)
select
  cid_python,
  gs.week,
  'Week ' || gs.week || ' Assignment',
  100
from generate_series(1, 8) as gs(week)
on conflict (course_id, week_number) do nothing;

insert into public.assignments (course_id, week_number, title, maximum_score)
select cid_dbms, gs.week, 'Week ' || gs.week || ' Assignment', 100
from generate_series(1, 8) as gs(week)
on conflict (course_id, week_number) do nothing;

insert into public.assignments (course_id, week_number, title, maximum_score)
select cid_linalg, gs.week, 'Week ' || gs.week || ' Assignment', 100
from generate_series(1, 8) as gs(week)
on conflict (course_id, week_number) do nothing;

insert into public.assignments (course_id, week_number, title, maximum_score)
select cid_projmgmt, gs.week, 'Week ' || gs.week || ' Assignment', 100
from generate_series(1, 8) as gs(week)
on conflict (course_id, week_number) do nothing;

-- 12-week courses
insert into public.assignments (course_id, week_number, title, maximum_score)
select cid_dsa, gs.week, 'Week ' || gs.week || ' Assignment', 100
from generate_series(1, 12) as gs(week)
on conflict (course_id, week_number) do nothing;

insert into public.assignments (course_id, week_number, title, maximum_score)
select cid_ml, gs.week, 'Week ' || gs.week || ' Assignment', 100
from generate_series(1, 12) as gs(week)
on conflict (course_id, week_number) do nothing;

insert into public.assignments (course_id, week_number, title, maximum_score)
select cid_networks, gs.week, 'Week ' || gs.week || ' Assignment', 100
from generate_series(1, 12) as gs(week)
on conflict (course_id, week_number) do nothing;

insert into public.assignments (course_id, week_number, title, maximum_score)
select cid_stats, gs.week, 'Week ' || gs.week || ' Assignment', 100
from generate_series(1, 12) as gs(week)
on conflict (course_id, week_number) do nothing;

insert into public.assignments (course_id, week_number, title, maximum_score)
select cid_digital, gs.week, 'Week ' || gs.week || ' Assignment', 100
from generate_series(1, 12) as gs(week)
on conflict (course_id, week_number) do nothing;

insert into public.assignments (course_id, week_number, title, maximum_score)
select cid_signals, gs.week, 'Week ' || gs.week || ' Assignment', 100
from generate_series(1, 12) as gs(week)
on conflict (course_id, week_number) do nothing;

insert into public.assignments (course_id, week_number, title, maximum_score)
select cid_bioinfo, gs.week, 'Week ' || gs.week || ' Assignment', 100
from generate_series(1, 12) as gs(week)
on conflict (course_id, week_number) do nothing;

end $$;

-- ============================================================
-- Verification queries (uncomment to check after seeding)
-- ============================================================
-- select count(*) from public.courses;          -- 11
-- select count(*) from public.scoring_rules;    -- 11
-- select count(*) from public.certificate_rules;-- 44
-- select count(*) from public.assignments;      -- 4×8 + 7×12 = 116
