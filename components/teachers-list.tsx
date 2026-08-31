"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "@/lib/custom-events";
import { deleteTeacher } from "@/app/actions";
import { btnGhost, thCls, tdCls } from "@/lib/ui";
import TeacherForm, { type TeacherRecord } from "./teacher-form";
import { TEACHER_STATUS, GENDER_LABEL, badge, vnd } from "@/lib/utils";

export default function TeachersList({
  teachers,
}: {
  teachers: (TeacherRecord & { classCount: number })[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TeacherRecord | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(t: TeacherRecord) {
    setEditing(t);
    setFormOpen(true);
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Xóa giáo viên "${name}"?\nCác lớp đang dạy sẽ mất giáo viên này.`)) return;
    const err = await deleteTeacher(id);
    if (err) toast(err, "error");
    else toast("Đã xóa giáo viên", "success");
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <p className="text-sm font-semibold text-gray-700">
          {teachers.length} giáo viên
        </p>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Thêm giáo viên
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={thCls}>Mã</th>
              <th className={thCls}>Họ và tên</th>
              <th className={thCls}>Bộ môn</th>
              <th className={thCls}>SĐT</th>
              <th className={thCls}>Lương/giờ</th>
              <th className={thCls}>Số lớp đang dạy</th>
              <th className={thCls}>Trạng thái</th>
              <th className={`${thCls} text-right`}>Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teachers.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                  Không có giáo viên nào.
                </td>
              </tr>
            )}
            {teachers.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className={tdCls}>{t.code}</td>
                <td className={`${tdCls} font-medium`}>
                  {t.full_name}
                  <span className="ml-2 text-xs text-gray-400">
                    {GENDER_LABEL[t.gender]}
                  </span>
                </td>
                <td className={tdCls}>{t.subject || "—"}</td>
                <td className={tdCls}>{t.phone || "—"}</td>
                <td className={tdCls}>{vnd(t.hourly_rate)}</td>
                <td className={tdCls}>
                  {t.classCount > 0 ? (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      {t.classCount}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className={tdCls}>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge(t.status)}`}>
                    {TEACHER_STATUS[t.status]}
                  </span>
                </td>
                <td className={`${tdCls} whitespace-nowrap text-right`}>
                  <Link href={`/dashboard/luong?teacher=${t.id}`} className={btnGhost}>
                    Lương
                  </Link>
                  <span className="mx-1 text-gray-300">|</span>
                  <button className={btnGhost} onClick={() => openEdit(t)}>
                    Sửa
                  </button>
                  <span className="mx-1 text-gray-300">|</span>
                  <button className="text-sm font-medium text-red-600 hover:text-red-800" onClick={() => handleDelete(t.id, t.full_name)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TeacherForm open={formOpen} onClose={() => setFormOpen(false)} teacher={editing} />
    </div>
  );
}