"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/actions";
import { inputCls, labelCls, btnPrimary } from "@/lib/ui";

export default function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label className={labelCls}>Mật khẩu mới (tối thiểu 6 ký tự)</label>
        <input name="password" type="password" required autoComplete="new-password" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Xác nhận mật khẩu</label>
        <input name="confirm_password" type="password" required autoComplete="new-password" className={inputCls} />
      </div>

      {state && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state}
        </div>
      )}

      <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
        {pending ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
      </button>
    </form>
  );
}