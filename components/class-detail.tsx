"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/custom-events";
import {
  deleteSession,
  removeFromClass,
  setSessionStatus,
} from "@/app/actions";
import { btnPrimary, btnSecondary, btnGhost, thCls, tdCls, cardCls } from "@/lib/ui";
import {
  CLASS_STATUS,
  CATEGORY_LABEL,
  badge,
  fmtDate,
  fmtTime,
  dayName,
  durationMinutes,
} from "@/lib/utils";
import ClassForm, { type ClassRecord } from "./class-form";
import SessionForm, { type SessionRecord } from "./session-form";
import EnrollForm from "./enroll-form";
import type { CourseRecord } from "./course-form";
import type { TeacherRecord } from "./teacher-form";
import type { StudentRecord } from "./student-form";

export type ClassDetail = ClassRecord & {
  course_name: string | null;
  course_category: string | null;
  teacher_name: string | null;
};

export type SessionRow = SessionRecord & {
  present: number;
  late: number;
  absent: number;
};

export default function ClassDetailClient({
  cls,
  students,
  allStudents,
  sessions,
  courses,
  teachers,
}: {
  cls: ClassDetail;
  students: StudentRecord[];
  allStudents: { id: string; code: string; full_name: string }[];
  sessions: SessionRow[];
  courses: CourseRecord[];
  teachers: TeacherRecord[];
}) {
  const router = useRouter();
  const [classFormOpen, setClassFormOpen] = useState(false);
  const [sessionFormOpen, setSessionFormOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionRecord | null>(null);

  const enrolledIds = new Set(students.map((s) => s.id));
  const doneCount = sessions.filter((s) => s.status === "done").length;
  const cancelledCount = sessions.filter((s) => s.status === "cancelled").length;

  async function handleRemove(classId: string, studentId: string, name: string) {
    if (!window.confirm(`Đưa học viên "${name}" ra khỏi lớp?`)) return;
    const err = await removeFromClass(classId, studentId);
    if (err) toast(err, "error");
    else {
      toast("Đã xóa khỏi lớp", "success");
      router.refresh();
    }
  }

  async function handleDeleteSession(id: string, date: string) {
    if (!window.confirm(`Xóa buổi học ngày ${fmtDate(date)}?`)) return;
    const err = await deleteSession(id, cls.id);
    if (err) toast(err, "error");
    else toast("Đã xóa buổi học", "success");
  }

  async function handleStatus(id: string, status: string) {
    const err = await setSessionStatus(id, status);
    if (err) toast(err, "error");
    else router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/lophoc" className="text-sm font-medium text-blue-600 hover:underline">
          ← Trở về danh sách lớp
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{cls.name}</h1>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge(cls.status)}`}>
              {CLASS_STATUS[cls.status]}
            </span>
          </div>
          <button onClick={() => setClassFormOpen(true)} className={btnSecondary}>
            Sửa thông tin lớp
          </button>
        </div>
      </div>

      <div className={`${cardCls} grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6`}>
        <div>
          <p className="text-xs text-gray-500">Khóa học</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{cls.course_name ?? "—"}</p>
          {cls.course_category && (
            <p className="text-xs text-gray-400">{CATEGORY_LABEL[cls.course_category]}</p>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-500">Giáo viên</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{cls.teacher_name ?? "Chưa phân công"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Lịch học</p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {cls.schedule_day ? dayName(cls.schedule_day) : "—"}
          </p>
          <p className="text-xs text-gray-400">
            {cls.start_time && cls.end_time
              ? `${fmtTime(cls.start_time)} - ${fmtTime(cls.end_time)}`
              : ""}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Phòng</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{cls.room ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Ngày khai giảng</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{fmtDate(cls.start_date)}</p>
          <p className="text-xs text-gray-400">KT: {fmtDate(cls.end_date)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Buổi học</p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {doneCount} đã dạy · {sessions.length - doneCount - cancelledCount} chưa
          </p>
          <p className="text-xs text-gray-400">Tổng {sessions.length} buổi</p>
        </div>
      </div>

      {/* Học viên */}
      <div className={cardCls}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Học viên <span className="text-gray-400">({students.length})</span>
          </h2>
          <button onClick={() => setEnrollOpen(true)} className={btnPrimary}>
            Thêm học viên
          </button>
        </div>
        {students.length === 0 ? (
          <p className="text-sm text-gray-500">Lớp chưa có học viên.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={thCls}>STT</th>
                  <th className={thCls}>Mã</th>
                  <th className={thCls}>Họ và tên</th>
                  <th className={thCls}>SĐT</th>
                  <th className={`${thCls} text-right`}>Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s, i) => (
                  <tr key={s.id}>
                    <td className={tdCls}>{i + 1}</td>
                    <td className={tdCls}>{s.code}</td>
                    <td className={`${tdCls} font-medium`}>{s.full_name}</td>
                    <td className={tdCls}>{s.phone || "—"}</td>
                    <td className={`${tdCls} text-right`}>
                      <button
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                        onClick={() => handleRemove(cls.id, s.id, s.full_name)}
                      >
                        Xóa khỏi lớp
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Buổi học */}
      <div className={cardCls}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Buổi học & điểm danh <span className="text-gray-400">({sessions.length})</span>
          </h2>
          <button
            onClick={() => {
              setEditingSession(null);
              setSessionFormOpen(true);
            }}
            className={btnPrimary}
          >
            Thêm buổi học
          </button>
        </div>

        {sessions.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có buổi học nào. Hãy thêm buổi học để điểm danh.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={thCls}>Ngày</th>
                  <th className={thCls}>Giờ</th>
                  <th className={thCls}>Số giờ</th>
                  <th className={thCls}>Nội dung</th>
                  <th className={thCls}>Điểm danh</th>
                  <th className={thCls}>Trạng thái</th>
                  <th className={`${thCls} text-right`}>Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className={`${tdCls} whitespace-nowrap`}>
                      <div className="font-medium">{fmtDate(s.session_date)}</div>
                      <div className="text-xs text-gray-400">{dayName(s.session_date)}</div>
                    </td>
                    <td className={`${tdCls} whitespace-nowrap`}>
                      {fmtTime(s.start_time)} - {fmtTime(s.end_time)}
                    </td>
                    <td className={tdCls}>{(durationMinutes(s.start_time, s.end_time) / 60).toFixed(1)}h</td>
                    <td className={tdCls}>
                      {s.topic || "—"}
                      <br />
                      <span className="text-xs text-gray-400">{s.note || ""}</span>
                    </td>
                    <td className={tdCls}>
                      {s.status === "done" && (
                        <div className="flex flex-wrap gap-1 text-xs">
                          <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700">{s.present} CM</span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">{s.late} M</span>
                          <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700">{s.absent} V</span>
                        </div>
                      )}
                      {s.status !== "done" && (
                        <Link href={`/dashboard/lophoc/${cls.id}/diemdanh/${s.id}`} className={btnGhost}>
                          Điểm danh
                        </Link>
                      )}
                    </td>
                    <td className={tdCls}>
                      <select
                        value={s.status}
                        onChange={(e) => handleStatus(s.id, e.target.value)}
                        className={`rounded-full text-xs font-medium ${badge(s.status)} px-2 py-1`}
                      >
                        <option value="scheduled">Dự kiến</option>
                        <option value="done">Đã dạy</option>
                        <option value="cancelled">Nghỉ</option>
                      </select>
                    </td>
                    <td className={`${tdCls} whitespace-nowrap text-right`}>
                      <Link href={`/dashboard/lophoc/${cls.id}/diemdanh/${s.id}`} className={btnGhost}>
                        {s.status === "done" ? "Xem" : "Điểm danh"}
                      </Link>
                      <span className="mx-1 text-gray-300">|</span>
                      <button className={btnGhost} onClick={() => { setEditingSession(s); setSessionFormOpen(true); }}>
                        Sửa
                      </button>
                      <span className="mx-1 text-gray-300">|</span>
                      <button className="text-sm font-medium text-red-600 hover:text-red-800" onClick={() => handleDeleteSession(s.id, s.session_date)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ClassForm
        open={classFormOpen}
        onClose={() => setClassFormOpen(false)}
        cls={{ ...cls, course_id: cls.course_id, teacher_id: cls.teacher_id }}
        courses={courses}
        teachers={teachers}
      />
      <SessionForm
        open={sessionFormOpen}
        onClose={() => setSessionFormOpen(false)}
        classId={cls.id}
        session={editingSession}
      />
      <EnrollForm
        open={enrollOpen}
        onClose={() => setEnrollOpen(false)}
        classId={cls.id}
        students={allStudents}
        enrolledIds={enrolledIds}
      />
    </div>
  );
}