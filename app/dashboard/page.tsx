import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import {
  vnd,
  fmtDate,
  fmtTime,
  dayOfWeek,
  durationMinutes,
  nowMonthKey,
  SESSION_STATUS,
  badge,
} from "@/lib/utils";
import { btnPrimary, cardCls } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();
  const month = nowMonthKey();
  const today = new Date().toISOString().slice(0, 10);
  const { full_name: prof } = session.profile ?? {};

  const [{ count: studentTotal }, { count: teacherTotal }, { count: classTotal }] =
    await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase.from("teachers").select("*", { count: "exact", head: true }),
      supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
    ]);

  const { data: payments } = await supabase
    .from("payments")
    .select("amount, payment_date")
    .gte("payment_date", `${month}-01`)
    .lte("payment_date", `${month}-31`);

  const revenue = (payments ?? []).reduce(
    (s, p) => s + Number(p.amount),
    0
  );

  const { data: sessionsMonth } = await supabase
    .from("sessions")
    .select("start_time, end_time")
    .eq("status", "done")
    .gte("session_date", `${month}-01`)
    .lte("session_date", `${month}-31`);

  const monthHours =
    (sessionsMonth ?? []).reduce(
      (s, x) => s + durationMinutes(x.start_time, x.end_time),
      0
    ) / 60;

  const { data: sessionsToday } = await supabase
    .from("sessions")
    .select(
      "id, session_date, start_time, end_time, topic, status, classes(name, room, teacher_id, teachers(full_name))"
    )
    .eq("session_date", today)
    .order("start_time");

type TodaySession = {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  topic: string | null;
  status: string;
  classes: {
    name: string | null;
    room: string | null;
    teacher_id: string | null;
    teachers: { full_name: string | null } | null;
  } | null;
};
const todaySessions = (sessionsToday ?? []) as unknown as TodaySession[];

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, amount, status")
    .not("status", "eq", "void");

  const { data: allPayments } = await supabase
    .from("payments")
    .select("invoice_id, amount");

  const paidByInvoice: Record<string, number> = {};
  (allPayments ?? []).forEach((p) => {
    if (!p.invoice_id) return;
    paidByInvoice[p.invoice_id] =
      (paidByInvoice[p.invoice_id] ?? 0) + Number(p.amount);
  });

  const outstanding = (invoices ?? []).reduce((sum, inv) => {
    const paid = paidByInvoice[inv.id] ?? 0;
    return sum + Math.max(0, Number(inv.amount) - paid);
  }, 0);

  const stats = [
    { label: "Học viên đang học", value: String(studentTotal ?? 0), href: "/dashboard/hocvien", color: "text-blue-600" },
    { label: "Giáo viên", value: String(teacherTotal ?? 0), href: "/dashboard/giaovien", color: "text-purple-600" },
    { label: "Lớp đang mở", value: String(classTotal ?? 0), href: "/dashboard/lophoc", color: "text-indigo-600" },
    { label: "Doanh thu tháng này", value: vnd(revenue), href: "/dashboard/hocphi", color: "text-green-600" },
    { label: "Giờ dạy trong tháng", value: `${monthHours.toFixed(1)}h`, href: "/dashboard/luong", color: "text-orange-600" },
    { label: "Học phí còn thiếu", value: vnd(outstanding), href: "/dashboard/hocphi", color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tổng quan {prof ? `- ${prof}` : ""}
        </h1>
        <p className="text-sm text-gray-500">
          {new Intl.DateTimeFormat("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(new Date())}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`${cardCls} block transition hover:border-blue-300 hover:shadow`}
          >
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`mt-1 text-xl font-bold ${s.color}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cardCls}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Buổi học hôm nay</h2>
            <Link href="/dashboard/lophoc" className="text-sm font-medium text-blue-600 hover:underline">
              Xem tất cả
            </Link>
          </div>
          {todaySessions.length === 0 ? (
            <p className="text-sm text-gray-500">Hôm nay không có buổi học nào.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {todaySessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {s.classes?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fmtTime(s.start_time)} - {fmtTime(s.end_time)} ·{" "}
                      {s.classes?.room ?? "Chưa có phòng"} ·{" "}
                      {s.classes?.teachers?.full_name ?? "Chưa phân GV"}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge(s.status)}`}>
                    {SESSION_STATUS[s.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={cardCls}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Thông tin nhanh</h2>
            <Link href="/dashboard/luong" className={btnPrimary}>
              Xem lương giáo viên
            </Link>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex justify-between border-b border-gray-100 pb-2">
              <span>Ngày</span>
              <span className="font-medium">{fmtDate(today)} ({dayOfWeek(today)})</span>
            </li>
            <li className="flex justify-between border-b border-gray-100 pb-2">
              <span>Buổi dạy đã hoàn thành tháng này</span>
              <span className="font-medium">{sessionsMonth?.length ?? 0} buổi</span>
            </li>
            <li className="flex justify-between border-b border-gray-100 pb-2">
              <span>Doanh thu tháng</span>
              <span className="font-medium text-green-600">{vnd(revenue)}</span>
            </li>
            <li className="flex justify-between">
              <span>Học phí còn thiếu</span>
              <span className="font-medium text-red-600">{vnd(outstanding)}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}