import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import ClassDetailClient from "@/components/class-detail";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getUser();
  if (!session) redirect("/login");
  const { id } = await params;

  const supabase = await createClient();

  const { data: cls } = await supabase
    .from("classes")
    .select("*, courses(name, category), teachers(full_name)")
    .eq("id", id)
    .maybeSingle();

  if (!cls) notFound();

  const sessionIds: string[] = [];
  const [csRes, sessionsRes, coursesRes, teachersRes, allStudentsRes] =
    await Promise.all([
      supabase
        .from("class_students")
        .select("students(*)")
        .eq("class_id", id)
        .order("enrolled_at"),
      supabase
        .from("sessions")
        .select("*")
        .eq("class_id", id)
        .order("session_date", { ascending: false })
        .order("start_time"),
      supabase
        .from("courses")
        .select("id, name, category, duration_hours, tuition_fee, note")
        .order("created_at"),
      supabase
        .from("teachers")
        .select("id, code, full_name, gender, birth_date, phone, email, address, hourly_rate, subject, status, note")
        .order("created_at"),
      supabase
        .from("students")
        .select("id, code, full_name, phone, status")
        .order("full_name"),
    ]);

  (sessionsRes.data ?? []).forEach((s) => sessionIds.push(s.id));

  const attendanceRes = sessionIds.length
    ? await supabase
        .from("attendance")
        .select("session_id, status")
        .in("session_id", sessionIds)
    : { data: [] as { session_id: string; status: string }[] };

  const students = (csRes.data ?? [])
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

  const attBySession: Record<string, { present: number; late: number; absent: number }> = {};
  (attendanceRes.data ?? []).forEach((a) => {
    const g = (attBySession[a.session_id] ??= { present: 0, late: 0, absent: 0 });
    if (a.status === "present") g.present++;
    else if (a.status === "late") g.late++;
    else g.absent++;
  });

  const sessionRows = (sessionsRes.data ?? []).map((s) => ({
    id: s.id,
    class_id: s.class_id,
    session_date: s.session_date,
    start_time: s.start_time,
    end_time: s.end_time,
    topic: s.topic,
    status: s.status,
    note: s.note,
    present: attBySession[s.id]?.present ?? 0,
    late: attBySession[s.id]?.late ?? 0,
    absent: attBySession[s.id]?.absent ?? 0,
  }));

  return (
    <ClassDetailClient
      cls={{
        id: cls.id,
        name: cls.name,
        course_id: cls.course_id,
        teacher_id: cls.teacher_id,
        start_date: cls.start_date,
        end_date: cls.end_date,
        schedule_day: cls.schedule_day,
        start_time: cls.start_time,
        end_time: cls.end_time,
        room: cls.room,
        status: cls.status,
        course_name: cls.courses?.name ?? null,
        course_category: cls.courses?.category ?? null,
        teacher_name: cls.teachers?.full_name ?? null,
      }}
      students={students}
      allStudents={(allStudentsRes.data ?? []).map((s) => ({
        id: s.id,
        code: s.code,
        full_name: s.full_name,
      }))}
      sessions={sessionRows}
      courses={coursesRes.data ?? []}
      teachers={teachersRes.data ?? []}
    />
  );
}