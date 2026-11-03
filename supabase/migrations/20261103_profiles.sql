-- ==============================================================================
-- Learning Universe — Cấu trúc dữ liệu Hồ sơ Học viên & Phân quyền Phê duyệt
-- File: supabase/migrations/20261103_profiles.sql
-- ==============================================================================

-- 1. Bảng hồ sơ học viên (public.profiles)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text not null check (role in ('student', 'admin')) default 'student',
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Chỉ mục hỗ trợ lọc trạng thái và tìm kiếm học viên
create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);

-- 2. Tự động cập nhật `updated_at`
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

-- 3. Tự động tạo bản ghi hồ sơ khi người dùng đăng ký qua Google OAuth
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_full_name text;
  v_avatar_url text;
begin
  v_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );
  v_avatar_url := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    ''
  );

  insert into public.profiles (id, email, full_name, avatar_url, role, status)
  values (
    new.id,
    new.email,
    v_full_name,
    v_avatar_url,
    'student',
    'pending'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 4. Kích hoạt Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Chính sách xem hồ sơ:
-- - Người dùng đã xác thực hoặc khách công khai được đọc thông tin cơ bản
create policy "profiles_select_public"
on public.profiles for select
using (true);

-- Chính sách cập nhật hồ sơ:
-- - Người dùng có thể tự cập nhật tên và avatar của mình
create policy "profiles_user_update_self"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- - Quản trị viên (admin) có quyền cập nhật trạng thái và vai trò
create policy "profiles_admin_update"
on public.profiles for update
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  or
  exists (
    select 1 from auth.users
    where id = auth.uid() and raw_user_meta_data->>'role' = 'admin'
  )
);

-- 5. Bảng tiến độ và dữ liệu học tập cá nhân (chỉ học viên được duyệt mới lưu trữ)
create table if not exists public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  constraint unique_user_lesson_progress unique(user_id, lesson_id)
);

create table if not exists public.user_bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id text not null,
  created_at timestamptz not null default now(),
  constraint unique_user_lesson_bookmark unique(user_id, lesson_id)
);

create table if not exists public.user_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_user_lesson_note unique(user_id, lesson_id)
);

alter table public.user_progress enable row level security;
alter table public.user_bookmarks enable row level security;
alter table public.user_notes enable row level security;

create policy "progress_owner_all"
on public.user_progress for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "bookmarks_owner_all"
on public.user_bookmarks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "notes_owner_all"
on public.user_notes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
