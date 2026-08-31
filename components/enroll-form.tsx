"use client";

import { useActionState } from "react";
import Modal, { FormError } from "@/components/ui/modal";
import { enrollStudent } from "@/app/actions";
import { inputCls, labelCls, btnSecondary, btnPrimary } from "@/lib/ui";

export default function EnrollForm({
  open,
  onClose,
  classId,
  students,
  enrolledIds,
}: {
  open: boolean;
  onClose: () => void;
  classId: string;
  students: { id: string; code: string; full_name: string }[];
  enrolledIds: Set<string>;
}) {
  const [state, formAction, pending] = useActionState(
    async (_: string | null, formData: FormData) => {
      const sid = String(formData.get("student_id") ?? "");
      if (!sid) return "Vui lòng chọn học viên.";
      const err = await enrollStudent(classId, sid);
      if (err) return err;
      onClose();
      return null;
    },
    null
  );

  const available = students.filter((s) => !enrolledIds.has(s.id));

  return (
    <Modal open={open} onClose={onClose} title="Thêm học viên vào lớp">
      <form action={formAction} className="space-y-3">
        <FormError message={state} />
        {available.length === 0 ? (
          <p className="text-sm text-gray-500">Tất cả học viên đã nằm trong lớp này.</p>
        ) : (
          <div>
            <label className={labelCls}>Chọn học viên</label>
            <select name="student_id" className={inputCls}>
              {available.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.full_name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Hủy
          </button>
          {available.length > 0 && (
            <button type="submit" disabled={pending} className={btnPrimary}>
              {pending ? "Đang thêm..." : "Thêm"}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}