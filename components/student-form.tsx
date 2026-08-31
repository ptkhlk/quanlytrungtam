"use client";

import { useActionState } from "react";
import Modal, { FormError } from "@/components/ui/modal";
import { saveStudent } from "@/app/actions";
import { inputCls, labelCls, btnSecondary, btnPrimary, fieldCls } from "@/lib/ui";

export type StudentRecord = {
  id: string;
  code: string;
  full_name: string;
  gender: string;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  parent_phone: string | null;
  address: string | null;
  status: string;
  note: string | null;
};

export default function StudentForm({
  open,
  onClose,
  student,
}: {
  open: boolean;
  onClose: () => void;
  student?: StudentRecord | null;
}) {
  const [state, formAction, pending] = useActionState(saveStudent, null);

  return (
    <Modal open={open} onClose={onClose} title={student ? "Sửa học viên" : "Thêm học viên"} wide>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="id" value={student?.id ?? ""} />
        <FormError message={state} />
        <div className={fieldCls}>
          <div>
            <label className={labelCls}>Mã học viên *</label>
            <input name="code" required defaultValue={student?.code ?? ""} className={inputCls} placeholder="HV001" />
          </div>
          <div>
            <label className={labelCls}>Họ và tên *</label>
            <input name="full_name" required defaultValue={student?.full_name ?? ""} className={inputCls} placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label className={labelCls}>Giới tính</label>
            <select name="gender" defaultValue={student?.gender ?? "nam"} className={inputCls}>
              <option value="nam">Nam</option>
              <option value="nu">Nữ</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Ngày sinh</label>
            <input name="birth_date" type="date" defaultValue={student?.birth_date ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Số điện thoại</label>
            <input name="phone" defaultValue={student?.phone ?? ""} className={inputCls} placeholder="09xxxxxxxx" />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input name="email" type="email" defaultValue={student?.email ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>ĐT phụ huynh</label>
            <input name="parent_phone" defaultValue={student?.parent_phone ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Trạng thái</label>
            <select name="status" defaultValue={student?.status ?? "active"} className={inputCls}>
              <option value="active">Đang học</option>
              <option value="new">Học viên mới</option>
              <option value="stopped">Nghỉ học</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Địa chỉ</label>
            <input name="address" defaultValue={student?.address ?? ""} className={inputCls} />
          </div>
          <div className="sm:col-span-3">
            <label className={labelCls}>Ghi chú</label>
            <input name="note" defaultValue={student?.note ?? ""} className={inputCls} />
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