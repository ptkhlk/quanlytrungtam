import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { cardCls, inputCls, btnSecondary, thCls, tdCls } from "@/lib/ui";
import {
  vnd,
  fmtDate,
  fmtTime,
  durationMinutes,
  nowMonthKey,
  badge,
  SESSION_STATUS,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

type TeacherSalary = {
  id: string;
  code: string;
  full_name: string;
  hourly_rate: number;
  sessions: number;
  minutes: number;
  salary: number;
};

export default async function SalaryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; teacher?: string }>;
}) {
  const session = await getUser();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const month = sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : nowMonthKey();
  const teacherFilter = sp.teacher ?? "";

  const supabase = await createClient();

  const { data: teachers } = await supabase
    .from("teachers")
    .select("id, code, full_name, hourly_rate, status, subject")
    .order("created_at");

  let sessQuery = supabase
    .from("sessions")
    .select(
      "id, session_date, start_time, end_time, topic, status, classes(name, teacher_id, teachers(full_name, hourly_rate))"
    )
    .eq("status", "done")
    .gte("session_date", `${month}-01`)
    .lte("session_date", `${month}-31`);

  if (teacherFilter) {
    sessQuery = sessQuery.eq("classes.teacher_id", teacherFilter);
  }

const { data: sessions } = await sessQuery.order("session_date", { ascending: true });

type JoinedSession = {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  topic: string | null;
  status: string;
  classes: {
    name: string | null;
    teacher_id: string | null;
    teachers: { full_name: string | null; hourly_rate: number | null } | null;
  } | null;
};
const joinedSessions = (sessions ?? []) as unknown as JoinedSession[];

const byTeacher = new Map<string, TeacherSalary>();
const detailRows: {
  teacherId: string;
  id: string;
  date: string;
  start: string;
  end: string;
  mins: number;
  topic: string | null;
  className: string | null;
  fullName: string;
}[] = [];

joinedSessions.forEach((s) => {
  const t = s.classes?.teachers;
  const tid = s.classes?.teacher_id;
  if (!tid) return;

  const mins = durationMinutes(s.start_time, s.end_time);
  const rec = byTeacher.get(tid) ?? {
    id: tid,
    code: "",
    full_name: t?.full_name ?? "—",
    hourly_rate: Number(t?.hourly_rate ?? 0),
    sessions: 0,
    minutes: 0,
    salary: 0,
  };
  rec.sessions += 1;
  rec.minutes += mins;
  byTeacher.set(tid, rec);

  detailRows.push({
    teacherId: tid,
    id: s.id,
    date: s.session_date,
    start: s.start_time,
    end: s.end_time,
    mins,
    topic: s.topic,
    className: s.classes?.name ?? null,
    fullName: t?.full_name ?? "—",
  });
});

  const rows = Array.from(byTeacher.values()).map((r) => {
    const salary = (r.minutes / 60) * r.hourly_rate;
    return { ...r, salary };
  });

  const totalSalary = rows.reduce((s, r) => s + r.salary, 0);
  const totalMinutes = rows.reduce((s, r) => s + r.minutes, 0);
  const details = teacherFilter
    ? detailRows.filter((d) => d.teacherId === teacherFilter)
    : detailRows;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lương giáo viên</h1>
        <p className="text-sm text-gray-500">
          Tính lương theo số buổi/giờ đã dạy (trạng thái buổi = Đã dạy) × lương theo giờ
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-center gap-2">
        <input
          name="month"
          type="month"
          defaultValue={month}
          className={`${inputCls} max-w-[180px]`}
        />
        <select name="teacher" defaultValue={teacherFilter} className={`${inputCls} max-w-xs`}>
          <option value="">— Tất cả giáo viên —</option>
          {(teachers ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.full_name} ({t.code})
            </option>
          ))}
        </select>
        <button type="submit" className={btnSecondary}>
          Xem lương
        </button>
        <Link href="/dashboard/luong" className={`${btnSecondary} text-red-600 hover:text-red-700`}>
          Xóa lọc
        </Link>
      </form>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className={cardCls}>
          <p className="text-xs text-gray-500">Tổng lương phải trả</p>
          <p className="mt-1 text-xl font-bold text-indigo-700">{vnd(totalSalary)}</p>
        </div>
        <div className={cardCls}>
          <p className="text-xs text-gray-500">Tổng buổi đã dạy</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {rows.reduce((s, r) => s + r.sessions, 0)} buổi
          </p>
        </div>
        <div className={cardCls}>
          <p className="text-xs text-gray-500">Tổng giờ dạy</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {(totalMinutes / 60).toFixed(1)}h
          </p>
        </div>
        <div className={cardCls}>
          <p className="text-xs text-gray-500">Số giáo viên có dạy</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{rows.length}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <p className="text-sm font-semibold text-gray-700">
            Bảng lương tháng {month}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={thCls}>Giáo viên</th>
                <th className={thCls}>Bộ môn</th>
                <th className={thCls}>Buổi đã dạy</th>
                <th className={thCls}>Tổng giờ</th>
                <th className={thCls}>Lương/giờ</th>
                <th className={`${thCls} text-right`}>Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                    Không có giờ dạy nào trong tháng này.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className={`${tdCls} font-medium`}>
                    {r.full_name}
                    <span className="ml-2 text-xs text-gray-400">{r.code}</span>
                  </td>
                  <td className={tdCls}>
                    {teachers?.find((t) => t.id === r.id)?.subject ?? "—"}
                  </td>
                  <td className={tdCls}>{r.sessions} buổi</td>
                  <td className={tdCls}>{(r.minutes / 60).toFixed(1)}h</td>
                  <td className={tdCls}>{vnd(r.hourly_rate)}</td>
                  <td className={`${tdCls} text-right font-bold text-indigo-700`}>
                    {vnd(r.salary)}
                  </td>
                </tr>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-700" colSpan={2}>
                    Tổng cộng
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {rows.reduce((s, r) => s + r.sessions, 0)} buổi
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {(totalMinutes / 60).toFixed(1)}h
                  </td>
                  <td className={`px-4 py-2 text-sm text-gray-700`}></td>
                  <td className="px-4 py-2 text-right text-sm font-bold text-indigo-700">
                    {vnd(totalSalary)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {teacherFilter && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3">
            <p className="text-sm font-semibold text-gray-700">
              Chi tiết từng buổi dạy trong tháng {month}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={thCls}>Ngày</th>
                  <th className={thCls}>Lớp</th>
                  <th className={thCls}>Giờ dạy</th>
                  <th className={thCls}>Số giờ</th>
                  <th className={thCls}>Nội dung</th>
                  <th className={thCls}>Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {details.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                      Không có buổi dạy nào.
                    </td>
                  </tr>
                )}
                {details.map((d) => (
                  <tr key={d.id}>
                    <td className={tdCls}>{fmtDate(d.date)}</td>
                    <td className={tdCls}>{d.className ?? "—"}</td>
                    <td className={tdCls}>
                      {fmtTime(d.start)} - {fmtTime(d.end)}
                    </td>
                    <td className={tdCls}>{(d.mins / 60).toFixed(1)}h</td>
                    <td className={tdCls}>{d.topic || "—"}</td>
                    <td className={tdCls}>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge("done")}`}>
                        {SESSION_STATUS.done}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}