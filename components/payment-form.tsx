"use client";

import { useActionState } from "react";
import Modal, { FormError } from "@/components/ui/modal";
import { recordPayment } from "@/app/actions";
import { inputCls, labelCls, btnSecondary, btnPrimary, fieldCls } from "@/lib/ui";

export default function PaymentForm({
  open,
  onClose,
  invoice,
  remaining,
}: {
  open: boolean;
  onClose: () => void;
  invoice: { id: string; student_id: string; remaining: number };
  remaining: number;
}) {
  const [state, formAction, pending] = useActionState(recordPayment, null);

  return (
    <Modal open={open} onClose={onClose} title="Ghi nhận thanh toán">
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="invoice_id" value={invoice.id} />
        <input type="hidden" name="student_id" value={invoice.student_id} />
        <FormError message={state} />
        <div className={fieldCls}>
          <div className="sm:col-span-2">
            <label className={labelCls}>Số tiền đóng (VNĐ) *</label>
            <input name="amount" type="number" min={1} step="10000" required className={inputCls} placeholder={`Còn thiếu: ${remaining.toLocaleString("vi-VN")}`} />
          </div>
          <div>
            <label className={labelCls}>Ngày đóng</label>
            <input name="payment_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Phương thức</label>
            <select name="method" defaultValue="cash" className={inputCls}>
              <option value="cash">Tiền mặt</option>
              <option value="transfer">Chuyển khoản</option>
              <option value="card">Thẻ</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Ghi chú</label>
            <input name="note" className={inputCls} />
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