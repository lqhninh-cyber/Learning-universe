-- ==============================================================================
-- Learning Universe — Không gian Cá nhân hóa theo từng Tài khoản
-- Bao gồm: To-Do List học thuật, Mốc đếm ngược kỳ thi & Mục tiêu tuần / Pomodoro
-- File: supabase/migrations/20261122_workspace_personalization.sql
-- ==============================================================================

-- 1. Bảng nhiệm vụ học tập cá nhân (public.user_study_tasks)
create table if not exists public.user_study_tasks (
  user_id uuid references public.profiles(id) on delete cascade not null,
  id text not null,
  title text not null,
  due_date date not null,
  subject_slug text check (
    subject_slug is null
    or subject_slug in (
      'cau-truc-dai-so',
      'hinh-hoc-affine',
      'giai-tich-ham-mot-bien',
      'giao-duc-hoc'
    )
  ),
  priority text not null default 'normal' check (priority in ('normal', 'high')),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists idx_user_study_tasks_user_due
  on public.user_study_tasks(user_id, due_date);

create or replace trigger set_user_study_tasks_updated_at
before update on public.user_study_tasks
for each row
execute function public.handle_updated_at();

-- 2. Bảng mốc đếm ngược kỳ thi / hạn nộp (public.user_exam_milestones)
create table if not exists public.user_exam_milestones (
  user_id uuid references public.profiles(id) on delete cascade not null,
  id text not null,
  title text not null,
  exam_date date not null,
  subject_slug text check (
    subject_slug is null
    or subject_slug in (
      'cau-truc-dai-so',
      'hinh-hoc-affine',
      'giai-tich-ham-mot-bien',
      'giao-duc-hoc'
    )
  ),
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists idx_user_exam_milestones_user_date
  on public.user_exam_milestones(user_id, exam_date);

-- 3. Bảng mục tiêu học tập tuần & nhật ký phiên Pomodoro (public.user_study_preferences)
create table if not exists public.user_study_preferences (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  weekly_lesson_goal integer not null default 5 check (weekly_lesson_goal between 1 and 30),
  weekly_pomodoro_goal integer not null default 6 check (weekly_pomodoro_goal between 1 and 40),
  pomodoro_logs jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace trigger set_user_study_preferences_updated_at
before update on public.user_study_preferences
for each row
execute function public.handle_updated_at();

-- 4. Row Level Security (RLS) — Mỗi tài khoản chỉ đọc/ghi dữ liệu của chính mình
alter table public.user_study_tasks enable row level security;
alter table public.user_exam_milestones enable row level security;
alter table public.user_study_preferences enable row level security;

drop policy if exists "study_tasks_owner_all" on public.user_study_tasks;
drop policy if exists "exam_milestones_owner_all" on public.user_exam_milestones;
drop policy if exists "study_preferences_owner_all" on public.user_study_preferences;

create policy "study_tasks_owner_all"
on public.user_study_tasks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "exam_milestones_owner_all"
on public.user_exam_milestones for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "study_preferences_owner_all"
on public.user_study_preferences for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
