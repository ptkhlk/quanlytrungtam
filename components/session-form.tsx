"use client";

import { useActionState } from "react";
import Modal, { FormError } from "@/components/ui/modal";
import { saveSession } from "@/app/actions";
import { inputCls, labelCls, btnSecondary, btnPrimary, fieldCls } from "@/lib/ui";

export type SessionRecord = {
  id: string;
  class_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  topic: string | null;
  status: string;
  note: string | null;
};

export default function SessionForm({
  open,
  onClose,
  classId,
  session,
}: {
  open: boolean;
  onClose: () => void;
  classId: string;
  session?: SessionRecord | null;
}) {
  const [state, formAction, pending] = useActionState(saveSession, null);

  return (
    <Modal open={open} onClose={onClose} title={session ? "Sửa buổi học" : "Thêm buổi học"}>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="id" value={session?.id ?? ""} />
        <input type="hidden" name="class_id" value={classId} />
        <FormError message={state} />
        <div className={fieldCls}>
          <div>
            <label className={labelCls}>Ngày học *</label>
            <input name="session_date" type="date" required defaultValue={session?.session_date ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Giờ bắt đầu</label>
            <input name="start_time" type="time" defaultValue={session?.start_time ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Giờ kết thúc</label>
            <input name="end_time" type="time" defaultValue={session?.end_time ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Trạng thái</label>
            <select name="status" defaultValue={session?.status ?? "scheduled"} className={inputCls}>
              <option value="scheduled">Dự kiến</option>
              <option value="done">Đã dạy</option>
              <option value="cancelled">Nghỉ</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Nội dung bài học</label>
            <input name="topic" defaultValue={session?.topic ?? ""} className={inputCls} placeholder="Unit 1: Greetings" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Ghi chú</label>
            <input name="note" defaultValue={session?.note ?? ""} className={inputCls} />
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