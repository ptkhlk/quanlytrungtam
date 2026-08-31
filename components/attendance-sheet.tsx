"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveAttendance } from "@/app/actions";
import { btnPrimary, btnSecondary } from "@/lib/ui";
import { badge } from "@/lib/utils";
import { type StudentRecord } from "./student-form";

export default function AttendanceSheet({
  sessionId,
  classId,
  students,
  existing,
}: {
  sessionId: string;
  classId: string;
  students: StudentRecord[];
  existing: Record<string, string>;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(students.map((s) => [s.id, existing[s.id] ?? "present"]))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(() => {
    if (students.length === 0) return false;
    return students.some((s) => (rows[s.id] ?? "present") !== (existing[s.id] ?? "present"));
  }, [rows, existing, students]);

  const counts = useMemo(() => {
    const c = { present: 0, late: 0, absent: 0, total: students.length };
    students.forEach((s) => {
      const st = rows[s.id] ?? "present";
      if (st === "present") c.present++;
      else if (st === "late") c.late++;
      else c.absent++;
    });
    return c;
  }, [rows, students]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const err = await saveAttendance(
      sessionId,
      classId,
      students.map((s) => ({ student_id: s.id, status: rows[s.id] ?? "present" }))
    );
    setSaving(false);
    if (err) {
      setError(err);
    } else {
      router.refresh();
    }
  }

  if (students.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Lớp chưa có học viên. Hãy thêm học viên vào lớp trước khi điểm danh.
      </p>
    );
  }

  const opts = [
    ["present", "Có mặt"],
    ["late", "Đi muộn"],
    ["absent", "Vắng"],
  ] as const;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>
            <span className="font-semibold text-green-600">{counts.present}</span> có mặt
          </span>
          <span>
            <span className="font-semibold text-amber-600">{counts.late}</span> muộn
          </span>
          <span>
            <span className="font-semibold text-red-600">{counts.absent}</span> vắng
          </span>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-sm text-red-600">{error}</span>}
          <button type="button" onClick={handleSave} disabled={!dirty || saving} className={btnPrimary}>
            {saving ? "Đang lưu..." : "Lưu điểm danh"}
          </button>
          <button
            type="button"
            onClick={() => setRows(Object.fromEntries(students.map((s) => [s.id, existing[s.id] ?? "present"])))}
            className={btnSecondary}
          >
            Hoàn tác
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">STT</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Mã</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Học viên</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((s, i) => (
              <tr key={s.id}>
                <td className="px-4 py-2 text-sm text-gray-400">{i + 1}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{s.code}</td>
                <td className="px-4 py-2 text-sm font-medium text-gray-800">{s.full_name}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-1.5">
                    {opts.map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRows((r) => ({ ...r, [s.id]: val }))}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                          (rows[s.id] ?? "present") === val
                            ? badge(val)
                            : "border border-gray-200 bg-white text-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}