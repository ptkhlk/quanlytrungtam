import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import TeachersList from "@/components/teachers-list";
import { inputCls, btnSecondary } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getUser();
  if (!session) redirect("/login");
  const { q } = await searchParams;

  const supabase = await createClient();

  let query = supabase
    .from("teachers")
    .select("*, classes(id)")
    .order("created_at", { ascending: false });

  if (q?.trim()) {
    const pattern = `%${q.trim()}%`;
    query = query.or(
      `full_name.ilike.${pattern},code.ilike.${pattern},phone.ilike.${pattern},subject.ilike.${pattern}`
    );
  }

  const { data } = await query;

  const teachers = (data ?? []).map((t) => ({
    id: t.id,
    code: t.code,
    full_name: t.full_name,
    gender: t.gender,
    birth_date: t.birth_date,
    phone: t.phone,
    email: t.email,
    address: t.address,
    hourly_rate: t.hourly_rate,
    subject: t.subject,
    status: t.status,
    note: t.note,
    classCount: (t.classes as unknown as { id: string }[] | null)?.length ?? 0,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý giáo viên</h1>
        <p className="text-sm text-gray-500">
          Giáo viên, mức lương theo giờ và lớp đang phụ trách
        </p>
      </div>

      <form method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Tìm theo tên, mã, bộ môn..."
          className={`${inputCls} max-w-xs`}
        />
        <button type="submit" className={btnSecondary}>
          Tìm kiếm
        </button>
        {q && (
          <Link href="/dashboard/giaovien" className={`${btnSecondary} text-red-600 hover:text-red-700`}>
            Xóa lọc
          </Link>
        )}
      </form>

      <TeachersList teachers={teachers} />
    </div>
  );
}