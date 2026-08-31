"use client";

import { useActionState } from "react";
import Modal, { FormError } from "@/components/ui/modal";
import { saveInvoice } from "@/app/actions";
import { inputCls, labelCls, btnSecondary, btnPrimary, fieldCls } from "@/lib/ui";

export type InvoiceRecord = {
  id: string;
  student_id: string;
  class_id: string | null;
  description: string | null;
  amount: number | null;
  due_date: string | null;
  status: string;
};

export default function InvoiceForm({
  open,
  onClose,
  invoice,
  students,
  classes,
}: {
  open: boolean;
  onClose: () => void;
  invoice?: InvoiceRecord | null;
  students: { id: string; code: string; full_name: string }[];
  classes: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(saveInvoice, null);

  return (
    <Modal open={open} onClose={onClose} title={invoice ? "Sửa hóa đơn" : "Tạo hóa đơn học phí"}>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="id" value={invoice?.id ?? ""} />
        <FormError message={state} />
        <div className={fieldCls}>
          <div className="sm:col-span-2">
            <label className={labelCls}>Học viên *</label>
            <select name="student_id" required defaultValue={invoice?.student_id ?? ""} className={inputCls}>
              <option value="">— Chọn học viên —</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Diễn giải</label>
            <input name="description" defaultValue={invoice?.description ?? "Học phí"} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Lớp</label>
            <select name="class_id" defaultValue={invoice?.class_id ?? ""} className={inputCls}>
              <option value="">—</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Số tiền phải đóng (VNĐ) *</label>
            <input name="amount" type="number" min={0} step="10000" required defaultValue={invoice?.amount ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Hạn đóng</label>
            <input name="due_date" type="date" defaultValue={invoice?.due_date ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Trạng thái</label>
            <select name="status" defaultValue={invoice?.status ?? "unpaid"} className={inputCls}>
              <option value="unpaid">Chưa đóng</option>
              <option value="partial">Đóng một phần</option>
              <option value="paid">Đã đóng</option>
              <option value="void">Đã hủy</option>
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