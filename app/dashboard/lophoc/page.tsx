import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import ClassesList from "@/components/classes-list";
import { inputCls, btnSecondary } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getUser();
  if (!session) redirect("/login");
  const { q } = await searchParams;

  const supabase = await createClient();

  const select = "*, courses(name, category), teachers(full_name), class_students(class_id)";
  let query = supabase.from("classes").select(select).order("created_at", { ascending: false });

  if (q?.trim()) {
    query = query.ilike("name", `%${q.trim()}%`);
  }

  const { data } = await query;

  const classes = (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    course_id: c.course_id,
    teacher_id: c.teacher_id,
    start_date: c.start_date,
    end_date: c.end_date,
    schedule_day: c.schedule_day,
    start_time: c.start_time,
    end_time: c.end_time,
    room: c.room,
    status: c.status,
    course_name: c.courses?.name ?? null,
    course_category: c.courses?.category ?? null,
    teacher_name: c.teachers?.full_name ?? null,
    studentCount: (c.class_students as unknown as { class_id: string }[] | null)?.length ?? 0,
  }));

  const [{ data: courses }, { data: teachers }] = await Promise.all([
    supabase.from("courses").select("id, name, category, duration_hours, tuition_fee, note").order("created_at"),
    supabase.from("teachers").select("id, code, full_name, gender, birth_date, phone, email, address, hourly_rate, subject, status, note").order("created_at"),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý lớp học</h1>
        <p className="text-sm text-gray-500">
          Lớp học gắn giáo viên, khóa học và danh sách học viên
        </p>
      </div>

      <form method="get" className="flex gap-2">
        <input name="q" defaultValue={q ?? ""} placeholder="Tìm theo tên lớp..." className={`${inputCls} max-w-xs`} />
        <button type="submit" className={btnSecondary}>
          Tìm kiếm
        </button>
        {q && (
          <Link href="/dashboard/lophoc" className={`${btnSecondary} text-red-600 hover:text-red-700`}>
            Xóa lọc
          </Link>
        )}
      </form>

      <ClassesList classes={classes} courses={courses ?? []} teachers={teachers ?? []} />
    </div>
  );
}