-- =============================================================
--  Trung tâm Ngoại ngữ - Tin học: Database schema (Supabase)
--  Chạy file này trong Supabase Dashboard -> SQL Editor
-- =============================================================

-- ---------- PROFILES (liên kết với auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

-- Tự tạo profile khi đăng ký tài khoản
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case when not exists (select 1 from public.profiles) then 'admin' else 'staff' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Kiểm tra đã có tài khoản chưa (gọi được từ phiên ẩn danh qua RPC,
-- vì RLS chỉ cho authenticated đọc profiles). Returning true = đã có
-- profile -> khóa đăng ký.
create or replace function public.has_any_profile()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles);
$$;

grant execute on function public.has_any_profile() to anon, authenticated;

-- ---------- HỌC VIÊN ----------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  full_name text not null,
  gender text not null default 'nam' check (gender in ('nam', 'nu')),
  birth_date date,
  phone text,
  email text,
  parent_phone text,
  address text,
  status text not null default 'active' check (status in ('active', 'new', 'stopped')),
  note text,
  created_at timestamptz not null default now()
);

-- ---------- GIÁO VIÊN ----------
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  full_name text not null,
  gender text not null default 'nam' check (gender in ('nam', 'nu')),
  birth_date date,
  phone text,
  email text,
  address text,
  hourly_rate numeric(12,2) not null default 0,
  subject text,
  status text not null default 'active' check (status in ('active', 'stopped')),
  note text,
  created_at timestamptz not null default now()
);

-- ---------- KHÓA HỌC ----------
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'ngoai_ngu' check (category in ('ngoai_ngu', 'tin_hoc')),
  duration_hours int,
  tuition_fee numeric(12,2) not null default 0,
  note text,
  created_at timestamptz not null default now()
);

-- ---------- LỚP HỌC ----------
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_id uuid references public.courses(id) on delete set null,
  teacher_id uuid references public.teachers(id) on delete set null,
  start_date date,
  end_date date,
  schedule_day text,
  start_time time,
  end_time time,
  room text,
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  created_at timestamptz not null default now()
);

-- ---------- HỌC VIÊN - LỚP (đăng ký lớp) ----------
create table if not exists public.class_students (
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

-- ---------- BUỔI HỌC ----------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  session_date date not null,
  start_time time not null,
  end_time time not null,
  topic text,
  status text not null default 'scheduled' check (status in ('scheduled', 'done', 'cancelled')),
  note text,
  created_at timestamptz not null default now()
);

-- ---------- ĐIỂM DANH ----------
create table if not exists public.attendance (
  session_id uuid not null references public.sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status text not null default 'present' check (status in ('present', 'late', 'absent')),
  note text,
  created_at timestamptz not null default now(),
  primary key (session_id, student_id)
);

-- ---------- HỌC PHÍ (khoản phải đóng) ----------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  description text not null default 'Học phí',
  amount numeric(12,2) not null default 0,
  due_date date,
  status text not null default 'unpaid' check (status in ('unpaid', 'partial', 'paid', 'void')),
  created_at timestamptz not null default now()
);

-- ---------- HỌC PHÍ (khoản đã đóng) ----------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete set null,
  student_id uuid not null references public.students(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  payment_date date not null default current_date,
  method text not null default 'cash' check (method in ('cash', 'transfer', 'card')),
  note text,
  created_at timestamptz not null default now()
);

-- =============================================================
--  ROW LEVEL SECURITY
--  Mọi tài khoản đã đăng nhập đều thao tác được dữ liệu
--  (phù hợp trung tâm nhỏ, 1 chi nhánh)
-- =============================================================
alter table public.profiles    enable row level security;
alter table public.students    enable row level security;
alter table public.teachers    enable row level security;
alter table public.courses     enable row level security;
alter table public.classes     enable row level security;
alter table public.class_students enable row level security;
alter table public.sessions    enable row level security;
alter table public.attendance  enable row level security;
alter table public.invoices    enable row level security;
alter table public.payments    enable row level security;

create policy "authenticated_all" on public.profiles for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all" on public.students for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all" on public.teachers for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all" on public.courses for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all" on public.classes for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all" on public.class_students for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all" on public.sessions for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all" on public.attendance for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all" on public.invoices for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all" on public.payments for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Cập nhật trạng thái invoice theo số tiền đã đóng
create or replace function public.sync_invoice_status()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare paid numeric;
begin
  if tg_op in ('INSERT', 'UPDATE') then
    select coalesce(sum(p.amount), 0) into paid from public.payments p where p.invoice_id = new.invoice_id;
  else
    select coalesce(sum(p.amount), 0) into paid from public.payments p where p.invoice_id = old.invoice_id;
  end if;

  if tg_op = 'DELETE' then
    update public.invoices set status = 'unpaid' where id = old.invoice_id;
  else
    update public.invoices i set status = case
      when paid >= i.amount then 'paid'
      when paid > 0 then 'partial'
      else 'unpaid'
    end
    where i.id = coalesce(new.invoice_id, old.invoice_id);
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists sync_invoice_status_after on public.payments;
create trigger sync_invoice_status_after
  after insert or update or delete on public.payments
  for each row execute function public.sync_invoice_status();