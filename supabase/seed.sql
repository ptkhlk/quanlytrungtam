-- =============================================================
--  Dữ liệu mẫu (chạy sau schema.sql)
-- =============================================================

insert into public.teachers (code, full_name, gender, phone, hourly_rate, subject)
values
('GV001', 'Trần Văn An', 'nam', '0912345678', 250000, 'Tiếng Anh'),
('GV002', 'Nguyễn Thị Bình', 'nu', '0912987654', 220000, 'Tiếng Anh'),
('GV003', 'Lê Văn Cường', 'nam', '0913456789', 300000, 'Tin học - Lập trình');

insert into public.courses (name, category, duration_hours, tuition_fee)
values
('Tiếng Anh Giao tiếp A1', 'ngoai_ngu', 60, 2500000),
('Tiếng Anh Giao tiếp A2', 'ngoai_ngu', 60, 2700000),
('Tin học Văn phòng', 'tin_hoc', 30, 1500000),
('Lập trình Python cơ bản', 'tin_hoc', 45, 3000000);

insert into public.students (code, full_name, gender, birth_date, phone, status)
values
('HV001', 'Phạm Minh Châu', 'nu', '2010-03-12', '0901111111', 'active'),
('HV002', 'Hoàng Đức Duy', 'nam', '2011-08-25', '0902222222', 'active'),
('HV003', 'Vũ Thu Hà', 'nu', '2009-01-05', '0903333333', 'active'),
('HV004', 'Đỗ Quang Huy', 'nam', '2012-11-30', '0904444444', 'active');

insert into public.classes (name, course_id, teacher_id, start_date, end_date, schedule_day, start_time, end_time, room)
select c.name || ' - Lớp 01', c.id, t.id, '2026-09-01', '2026-11-30', 'thu2', '18:00:00', '19:30:00', 'P201'
from public.courses c cross join public.teachers t
where c.name = 'Tiếng Anh Giao tiếp A1' and t.code = 'GV001';

insert into public.class_students (class_id, student_id)
select cl.id, s.id
from public.classes cl cross join public.students s
where cl.name = 'Tiếng Anh Giao tiếp A1 - Lớp 01';

insert into public.sessions (class_id, session_date, start_time, end_time, topic, status)
select cl.id, d.d, cl.start_time, cl.end_time, 'Buổi ' || row_number() over () , 'done'
from public.classes cl
cross join lateral (select ('2026-09-07'::date + (n || ' days')::int) as d from generate_series(0, 6) n) d
where cl.name = 'Tiếng Anh Giao tiếp A1 - Lớp 01' and extract(dow from d.d) = 1;

insert into public.attendance (session_id, student_id, status)
select se.id, cs.student_id, 'present'
from public.sessions se
join public.class_students cs on cs.class_id = se.class_id
limit 20;

insert into public.invoices (student_id, class_id, description, amount, status)
select s.id, cl.id, 'Học phí khóa ' || cl.name, co.tuition_fee, 'unpaid'
from public.students s
cross join public.classes cl
join public.courses co on co.id = cl.course_id
where s.code = 'HV001';

insert into public.payments (invoice_id, student_id, amount, payment_date, method)
select i.id, i.student_id, i.amount, '2026-08-30', 'cash'
from public.invoices i;