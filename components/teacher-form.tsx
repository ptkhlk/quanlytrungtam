"use client";

import { useActionState } from "react";
import Modal, { FormError } from "@/components/ui/modal";
import { saveTeacher } from "@/app/actions";
import { inputCls, labelCls, btnSecondary, btnPrimary, fieldCls } from "@/lib/ui";

export type TeacherRecord = {
  id: string;
  code: string;
  full_name: string;
  gender: string;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  hourly_rate: number | null;
  subject: string | null;
  status: string;
  note: string | null;
};

export default function TeacherForm({
  open,
  onClose,
  teacher,
}: {
  open: boolean;
  onClose: () => void;
  teacher?: TeacherRecord | null;
}) {
  const [state, formAction, pending] = useActionState(saveTeacher, null);

  return (
    <Modal open={open} onClose={onClose} title={teacher ? "Sửa giáo viên" : "Thêm giáo viên"} wide>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="id" value={teacher?.id ?? ""} />
        <FormError message={state} />
        <div className={fieldCls}>
          <div>
            <label className={labelCls}>Mã giáo viên *</label>
            <input name="code" required defaultValue={teacher?.code ?? ""} className={inputCls} placeholder="GV001" />
          </div>
          <div>
            <label className={labelCls}>Họ và tên *</label>
            <input name="full_name" required defaultValue={teacher?.full_name ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Giới tính</label>
            <select name="gender" defaultValue={teacher?.gender ?? "nam"} className={inputCls}>
              <option value="nam">Nam</option>
              <option value="nu">Nữ</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Ngày sinh</label>
            <input name="birth_date" type="date" defaultValue={teacher?.birth_date ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Số điện thoại</label>
            <input name="phone" defaultValue={teacher?.phone ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input name="email" type="email" defaultValue={teacher?.email ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Bộ môn</label>
            <input name="subject" defaultValue={teacher?.subject ?? ""} className={inputCls} placeholder="Tiếng Anh / Tin học..." />
          </div>
          <div>
            <label className={labelCls}>Lương/giờ (VNĐ)</label>
            <input name="hourly_rate" type="number" min={0} step="10000" defaultValue={teacher?.hourly_rate ?? ""} className={inputCls} placeholder="250000" />
          </div>
          <div>
            <label className={labelCls}>Trạng thái</label>
            <select name="status" defaultValue={teacher?.status ?? "active"} className={inputCls}>
              <option value="active">Đang dạy</option>
              <option value="stopped">Tạm nghỉ</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Địa chỉ</label>
            <input name="address" defaultValue={teacher?.address ?? ""} className={inputCls} />
          </div>
          <div className="sm:col-span-3">
            <label className={labelCls}>Ghi chú</label>
            <input name="note" defaultValue={teacher?.note ?? ""} className={inputCls} />
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