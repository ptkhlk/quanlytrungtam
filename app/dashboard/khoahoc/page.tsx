import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import CoursesList from "@/components/courses-list";
import { inputCls, btnSecondary } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getUser();
  if (!session) redirect("/login");
  const { q } = await searchParams;

  const supabase = await createClient();

  let query = supabase
    .from("courses")
    .select("*, classes(id)")
    .order("created_at", { ascending: false });

  if (q?.trim()) {
    query = query.ilike("name", `%${q.trim()}%`);
  }

  const { data } = await query;

  const courses = (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    duration_hours: c.duration_hours,
    tuition_fee: c.tuition_fee,
    note: c.note,
    classCount: (c.classes as unknown as { id: string }[] | null)?.length ?? 0,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Khóa học</h1>
        <p className="text-sm text-gray-500">Danh mục khóa học ngoại ngữ và tin học</p>
      </div>

      <form method="get" className="flex gap-2">
        <input name="q" defaultValue={q ?? ""} placeholder="Tìm theo tên khóa học..." className={`${inputCls} max-w-xs`} />
        <button type="submit" className={btnSecondary}>
          Tìm kiếm
        </button>
        {q && (
          <Link href="/dashboard/khoahoc" className={`${btnSecondary} text-red-600 hover:text-red-700`}>
            Xóa lọc
          </Link>
        )}
      </form>

      <CoursesList courses={courses} />
    </div>
  );
}