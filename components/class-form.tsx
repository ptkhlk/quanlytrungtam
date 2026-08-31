"use client";

import { useActionState } from "react";
import Modal, { FormError } from "@/components/ui/modal";
import { saveClass } from "@/app/actions";
import { inputCls, labelCls, btnSecondary, btnPrimary, fieldCls } from "@/lib/ui";
import type { CourseRecord } from "./course-form";
import type { TeacherRecord } from "./teacher-form";

export type ClassRecord = {
  id: string;
  name: string;
  course_id: string | null;
  teacher_id: string | null;
  start_date: string | null;
  end_date: string | null;
  schedule_day: string | null;
  start_time: string | null;
  end_time: string | null;
  room: string | null;
  status: string;
};

export default function ClassForm({
  open,
  onClose,
  cls,
  courses,
  teachers,
}: {
  open: boolean;
  onClose: () => void;
  cls?: ClassRecord | null;
  courses: CourseRecord[];
  teachers: TeacherRecord[];
}) {
  const [state, formAction, pending] = useActionState(saveClass, null);

  return (
    <Modal open={open} onClose={onClose} title={cls ? "Sửa lớp học" : "Thêm lớp học"} wide>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="id" value={cls?.id ?? ""} />
        <FormError message={state} />
        <div className={fieldCls}>
          <div>
            <label className={labelCls}>Tên lớp *</label>
            <input name="name" required defaultValue={cls?.name ?? ""} className={inputCls} placeholder="Tiếng Anh A1 - Lớp 01" />
          </div>
          <div>
            <label className={labelCls}>Khóa học</label>
            <select name="course_id" defaultValue={cls?.course_id ?? ""} className={inputCls}>
              <option value="">— Chọn khóa học —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Giáo viên</label>
            <select name="teacher_id" defaultValue={cls?.teacher_id ?? ""} className={inputCls}>
              <option value="">— Chọn giáo viên —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Ngày khai giảng</label>
            <input name="start_date" type="date" defaultValue={cls?.start_date ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Ngày kết thúc</label>
            <input name="end_date" type="date" defaultValue={cls?.end_date ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Ngày học trong tuần</label>
            <select name="schedule_day" defaultValue={cls?.schedule_day ?? ""} className={inputCls}>
              <option value="">— Chọn ngày —</option>
              <option value="thu2">Thứ 2</option>
              <option value="thu3">Thứ 3</option>
              <option value="thu4">Thứ 4</option>
              <option value="thu5">Thứ 5</option>
              <option value="thu6">Thứ 6</option>
              <option value="thu7">Thứ 7</option>
              <option value="chunhat">Chủ nhật</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Giờ bắt đầu</label>
            <input name="start_time" type="time" defaultValue={cls?.start_time ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Giờ kết thúc</label>
            <input name="end_time" type="time" defaultValue={cls?.end_time ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Phòng học</label>
            <input name="room" defaultValue={cls?.room ?? ""} className={inputCls} placeholder="P201" />
          </div>
          <div>
            <label className={labelCls}>Trạng thái</label>
            <select name="status" defaultValue={cls?.status ?? "active"} className={inputCls}>
              <option value="active">Đang học</option>
              <option value="completed">Hoàn thành</option>
              <option value="paused">Tạm hoãn</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Hủy
          </button>
          <button type="submit" disabled={pending} className={btnPrimary}>
            {pending ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </Modal>
  );
}