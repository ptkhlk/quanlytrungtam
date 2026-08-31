"use client";

import { useState } from "react";
import { toast } from "@/lib/custom-events";
import { deleteStudent } from "@/app/actions";
import { btnGhost, thCls, tdCls } from "@/lib/ui";
import StudentForm, { type StudentRecord } from "./student-form";
import { STUDENT_STATUS, GENDER_LABEL, badge, fmtDate } from "@/lib/utils";

export default function StudentsList({
  students,
}: {
  students: (StudentRecord & { classCount: number })[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StudentRecord | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(s: StudentRecord) {
    setEditing(s);
    setFormOpen(true);
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Xóa học viên "${name}"?\nCác dữ liệu liên quan (điểm danh, học phí) cũng sẽ bị xóa.`)) return;
    const err = await deleteStudent(id);
    if (err) toast(err, "error");
    else toast("Đã xóa học viên", "success");
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <p className="text-sm font-semibold text-gray-700">
          {students.length} học viên
        </p>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Thêm học viên
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={thCls}>Mã</th>
              <th className={thCls}>Họ và tên</th>
              <th className={thCls}>Giới tính</th>
              <th className={thCls}>Ngày sinh</th>
              <th className={thCls}>SĐT</th>
              <th className={thCls}>ĐT phụ huynh</th>
              <th className={thCls}>Số lớp</th>
              <th className={thCls}>Trạng thái</th>
              <th className={`${thCls} text-right`}>Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                  Không có học viên nào.
                </td>
              </tr>
            )}
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className={tdCls}>{s.code}</td>
                <td className={`${tdCls} font-medium`}>{s.full_name}</td>
                <td className={tdCls}>{GENDER_LABEL[s.gender] ?? s.gender}</td>
                <td className={tdCls}>{s.birth_date ? fmtDate(s.birth_date) : "—"}</td>
                <td className={tdCls}>{s.phone || "—"}</td>
                <td className={tdCls}>{s.parent_phone || "—"}</td>
                <td className={tdCls}>
                  {s.classCount > 0 ? (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {s.classCount}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className={tdCls}>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge(s.status)}`}>
                    {STUDENT_STATUS[s.status]}
                  </span>
                </td>
                <td className={`${tdCls} whitespace-nowrap text-right`}>
                  <button className={btnGhost} onClick={() => openEdit(s)}>
                    Sửa
                  </button>
                  <span className="mx-1 text-gray-300">|</span>
                  <button className="text-sm font-medium text-red-600 hover:text-red-800" onClick={() => handleDelete(s.id, s.full_name)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StudentForm open={formOpen} onClose={() => setFormOpen(false)} student={editing} />
    </div>
  );
}