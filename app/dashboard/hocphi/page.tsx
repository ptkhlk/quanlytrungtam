import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import TuitionList from "@/components/tuition-list";
import { inputCls, btnSecondary } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function TuitionPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await getUser();
  if (!session) redirect("/login");
  const { month } = await searchParams;

  const supabase = await createClient();

  let invQuery = supabase
    .from("invoices")
    .select("*, students(code, full_name), classes(name), payments(amount)")
    .order("created_at", { ascending: false });

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    invQuery = invQuery
      .gte("due_date", `${month}-01`)
      .lte("due_date", `${month}-31`);
  }

  const { data: invoices } = await invQuery;

  const [{ data: students }, { data: classes }] = await Promise.all([
    supabase.from("students").select("id, code, full_name, status").order("full_name"),
    supabase.from("classes").select("id, name").order("created_at", { ascending: false }),
  ]);

  const rows = (invoices ?? []).map((inv) => ({
    id: inv.id,
    student_id: inv.student_id,
    class_id: inv.class_id,
    description: inv.description,
    amount: inv.amount,
    due_date: inv.due_date,
    status: inv.status,
    student_code: inv.students?.code ?? null,
    student_name: inv.students?.full_name ?? null,
    class_name: inv.classes?.name ?? null,
    payments: (inv.payments as unknown as { amount: number }[] | null)?.map((p) =>
      Number(p.amount)
    ) ?? [],
  }));

  const activeStudents = (students ?? []).filter(
    (s) => s.status === "active" || s.status === "new"
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý học phí</h1>
        <p className="text-sm text-gray-500">
          Theo dõi tiền học phí của học viên theo lớp
        </p>
      </div>

      <form method="get" className="flex items-center gap-2">
        <input
          name="month"
          type="month"
          defaultValue={month ?? ""}
          className={`${inputCls} max-w-[180px]`}
        />
        <button type="submit" className={btnSecondary}>
          Lọc theo hạn đóng
        </button>
        {month && (
          <Link href="/dashboard/hocphi" className={`${btnSecondary} text-red-600 hover:text-red-700`}>
            Xóa lọc
          </Link>
        )}
      </form>

      <TuitionList
        invoices={rows}
        students={activeStudents.map((s) => ({ id: s.id, code: s.code, full_name: s.full_name }))}
        classes={(classes ?? []).map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}