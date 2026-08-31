"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "@/lib/custom-events";
import { deleteClass } from "@/app/actions";
import { btnGhost, thCls, tdCls } from "@/lib/ui";
import ClassForm, { type ClassRecord } from "./class-form";
import type { CourseRecord } from "./course-form";
import type { TeacherRecord } from "./teacher-form";
import { CLASS_STATUS, CATEGORY_LABEL, badge, fmtTime, dayName } from "@/lib/utils";

export type ClassRow = ClassRecord & {
  course_name: string | null;
  course_category: string | null;
  teacher_name: string | null;
  studentCount: number;
};

export default function ClassesList({
  classes,
  courses,
  teachers,
}: {
  classes: ClassRow[];
  courses: CourseRecord[];
  teachers: TeacherRecord[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClassRecord | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Xóa lớp "${name}"?\nToàn bộ buổi học và điểm danh của lớp sẽ bị xóa.`)) return;
    const err = await deleteClass(id);
    if (err) toast(err, "error");
    else toast("Đã xóa lớp", "success");
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <p className="text-sm font-semibold text-gray-700">
          {classes.length} lớp học
        </p>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Thêm lớp
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={thCls}>Tên lớp</th>
              <th className={thCls}>Khóa học</th>
              <th className={thCls}>Giáo viên</th>
              <th className={thCls}>Lịch học</th>
              <th className={thCls}>SL học viên</th>
              <th className={thCls}>Trạng thái</th>
              <th className={`${thCls} text-right`}>Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {classes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                  Không có lớp học nào.
                </td>
              </tr>
            )}
            {classes.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className={`${tdCls} font-medium`}>{c.name}</td>
                <td className={tdCls}>
                  <div>{c.course_name ?? "—"}</div>
                  {c.course_category && (
                    <span className="text-xs text-gray-400">
                      {CATEGORY_LABEL[c.course_category]}
                    </span>
                  )}
                </td>
                <td className={tdCls}>{c.teacher_name ?? "Chưa phân công"}</td>
                <td className={tdCls}>
                  {c.schedule_day && (
                    <div>
                      {dayName(c.schedule_day)}{" "}
                      {c.start_time && c.end_time
                        ? `${fmtTime(c.start_time)}-${fmtTime(c.end_time)}`
                        : ""}
                    </div>
                  )}
                  <span className="text-xs text-gray-400">
                    {c.room ? `Phòng ${c.room}` : ""}
                  </span>
                </td>
                <td className={tdCls}>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {c.studentCount}
                  </span>
                </td>
                <td className={tdCls}>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge(c.status)}`}>
                    {CLASS_STATUS[c.status]}
                  </span>
                </td>
                <td className={`${tdCls} whitespace-nowrap text-right`}>
                  <Link href={`/dashboard/lophoc/${c.id}`} className={btnGhost}>
                    Chi tiết
                  </Link>
                  <span className="mx-1 text-gray-300">|</span>
                  <button className={btnGhost} onClick={() => { setEditing(c); setFormOpen(true); }}>
                    Sửa
                  </button>
                  <span className="mx-1 text-gray-300">|</span>
                  <button className="text-sm font-medium text-red-600 hover:text-red-800" onClick={() => handleDelete(c.id, c.name)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ClassForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        cls={editing}
        courses={courses}
        teachers={teachers}
      />
    </div>
  );
}