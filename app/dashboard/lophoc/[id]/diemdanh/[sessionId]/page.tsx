import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import AttendanceSheet from "@/components/attendance-sheet";
import { cardCls, btnSecondary } from "@/lib/ui";
import { fmtDate, fmtTime, dayName, badge, SESSION_STATUS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const session = await getUser();
  if (!session) redirect("/login");
  const { id, sessionId } = await params;

  const supabase = await createClient();

  const { data: sess } = await supabase
    .from("sessions")
    .select("*, classes(name, start_time)")
    .eq("id", sessionId)
    .maybeSingle();

  if (!sess || sess.class_id !== id) notFound();

  const { data: csRows } = await supabase
    .from("class_students")
    .select("students(*)")
    .eq("class_id", id)
    .order("full_name", { referencedTable: "students" });

  const students = (csRows ?? [])
    .map((r) => r.students as unknown as Record<string, unknown> | null)
    .filter((st): st is Record<string, unknown> => st != null)
    .map((st) => ({
      id: st.id as string,
      code: st.code as string,
      full_name: st.full_name as string,
      gender: (st.gender as string) ?? "nam",
      birth_date: (st.birth_date as string) ?? null,
      phone: (st.phone as string) ?? null,
      email: (st.email as string) ?? null,
      parent_phone: (st.parent_phone as string) ?? null,
      address: (st.address as string) ?? null,
      status: (st.status as string) ?? "active",
      note: (st.note as string) ?? null,
    }));

  const { data: attRows } = await supabase
    .from("attendance")
    .select("student_id, status")
    .eq("session_id", sessionId);

  const existing: Record<string, string> = {};
  (attRows ?? []).forEach((a) => {
    existing[a.student_id] = a.status;
  });

  return (
    <div className="space-y-4">
      <Link href={`/dashboard/lophoc/${id}`} className="text-sm font-medium text-blue-600 hover:underline">
        ← Trở về lớp {sess.classes?.name}
      </Link>

      <div className={cardCls}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Điểm danh buổi học</h1>
            <p className="mt-1 text-sm text-gray-600">
              {sess.classes?.name} · {fmtDate(sess.session_date)} ({dayName(sess.session_date)}) ·{" "}
              {fmtTime(sess.start_time)} - {fmtTime(sess.end_time)}
              {sess.topic ? ` · ${sess.topic}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge(sess.status)}`}>
              {SESSION_STATUS[sess.status]}
            </span>
            <Link href={`/dashboard/lophoc/${id}/diemdanh/${sessionId}`} className={btnSecondary}>
              Làm mới
            </Link>
          </div>
        </div>
      </div>

      <div className={cardCls}>
        <AttendanceSheet
          sessionId={sessionId}
          classId={id}
          students={students}
          existing={existing}
        />
      </div>
    </div>
  );
}