import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import StudentsList from "@/components/students-list";
import { inputCls, btnSecondary } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getUser();
  if (!session) redirect("/login");
  const { q } = await searchParams;

  const supabase = await createClient();

  let query = supabase
    .from("students")
    .select("*, class_students(class_id)")
    .order("created_at", { ascending: false });

  if (q?.trim()) {
    const pattern = `%${q.trim()}%`;
    query = query.or(
      `full_name.ilike.${pattern},code.ilike.${pattern},phone.ilike.${pattern},email.ilike.${pattern}`
    );
  }

  const { data } = await query;

  const students = (data ?? []).map((s) => ({
    id: s.id,
    code: s.code,
    full_name: s.full_name,
    gender: s.gender,
    birth_date: s.birth_date,
    phone: s.phone,
    email: s.email,
    parent_phone: s.parent_phone,
    address: s.address,
    status: s.status,
    note: s.note,
    classCount: (s.class_students as unknown as { class_id: string }[] | null)?.length ?? 0,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý học viên</h1>
          <p className="text-sm text-gray-500">Danh sách học viên trung tâm</p>
        </div>
      </div>

      <form method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Tìm theo tên, mã, SĐT, email..."
          className={`${inputCls} max-w-xs`}
        />
        <button type="submit" className={btnSecondary}>
          Tìm kiếm
        </button>
        {q && (
          <Link
            href="/dashboard/hocvien"
            className={`${btnSecondary} text-red-600 hover:text-red-700`}
          >
            Xóa lọc
          </Link>
        )}
      </form>

      <StudentsList students={students} />
    </div>
  );
}