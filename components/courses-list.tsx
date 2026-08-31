"use client";

import { useState } from "react";
import { toast } from "@/lib/custom-events";
import { deleteCourse } from "@/app/actions";
import { btnGhost } from "@/lib/ui";
import CourseForm, { type CourseRecord } from "./course-form";
import { CATEGORY_LABEL, vnd } from "@/lib/utils";

export default function CoursesList({
  courses,
}: {
  courses: (CourseRecord & { classCount: number })[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CourseRecord | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Xóa khóa học "${name}"?\nCác lớp thuộc khóa này sẽ mất liên kết.`)) return;
    const err = await deleteCourse(id);
    if (err) toast(err, "error");
    else toast("Đã xóa khóa học", "success");
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <button
        onClick={openAdd}
        className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white text-gray-400 transition hover:border-blue-400 hover:text-blue-600"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-sm font-medium">Thêm khóa học</span>
      </button>

      {courses.map((c) => (
        <div key={c.id} className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">{c.name}</h3>
              <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {CATEGORY_LABEL[c.category]}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                Học phí: <span className="font-semibold text-gray-900">{vnd(c.tuition_fee)}</span>
              </p>
              <p>
                Số giờ: <span className="text-gray-900">{c.duration_hours ?? "—"}h</span>
              </p>
              <p>
                Lớp mở: <span className="text-gray-900">{c.classCount}</span>
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center border-t border-gray-100 pt-3">
            <button className={btnGhost} onClick={() => { setEditing(c); setFormOpen(true); }}>
              Sửa
            </button>
            <span className="mx-1 text-gray-300">|</span>
            <button className="text-sm font-medium text-red-600 hover:text-red-800" onClick={() => handleDelete(c.id, c.name)}>
              Xóa
            </button>
          </div>
        </div>
      ))}

      <CourseForm open={formOpen} onClose={() => setFormOpen(false)} course={editing} />
    </div>
  );
}