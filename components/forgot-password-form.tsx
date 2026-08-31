"use client";

import { useActionState } from "react";
import { forgotPassword } from "@/app/actions";
import { inputCls, labelCls, btnPrimary } from "@/lib/ui";

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPassword, null);
  const isSuccess = state?.includes("đã gửi link");

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label className={labelCls}>Email</label>
        <input name="email" type="email" required autoComplete="email" className={inputCls} />
      </div>

      {state && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            isSuccess
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state}
        </div>
      )}

      <button type="submit" disabled={pending || !!isSuccess} className={`${btnPrimary} w-full`}>
        {pending ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
      </button>
    </form>
  );
}