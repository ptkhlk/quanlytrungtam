"use client";

import { useActionState } from "react";
import Modal, { FormError } from "@/components/ui/modal";
import { saveCourse } from "@/app/actions";
import { inputCls, labelCls, btnSecondary, btnPrimary, fieldCls } from "@/lib/ui";

export type CourseRecord = {
  id: string;
  name: string;
  category: string;
  duration_hours: number | null;
  tuition_fee: number | null;
  note: string | null;
};

export default function CourseForm({
  open,
  onClose,
  course,
}: {
  open: boolean;
  onClose: () => void;
  course?: CourseRecord | null;
}) {
  const [state, formAction, pending] = useActionState(saveCourse, null);

  return (
    <Modal open={open} onClose={onClose} title={course ? "Sửa khóa học" : "Thêm khóa học"}>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="id" value={course?.id ?? ""} />
        <FormError message={state} />
        <div className={fieldCls}>
          <div className="sm:col-span-2">
            <label className={labelCls}>Tên khóa học *</label>
            <input name="name" required defaultValue={course?.name ?? ""} className={inputCls} placeholder="Tiếng Anh giao tiếp A1" />
          </div>
          <div>
            <label className={labelCls}>Danh mục</label>
            <select name="category" defaultValue={course?.category ?? "ngoai_ngu"} className={inputCls}>
              <option value="ngoai_ngu">Ngoại ngữ</option>
              <option value="tin_hoc">Tin học</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Số giờ học</label>
            <input name="duration_hours" type="number" min={0} defaultValue={course?.duration_hours ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Học phí (VNĐ)</label>
            <input name="tuition_fee" type="number" min={0} step="10000" defaultValue={course?.tuition_fee ?? ""} className={inputCls} placeholder="2500000" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Ghi chú</label>
            <input name="note" defaultValue={course?.note ?? ""} className={inputCls} />
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