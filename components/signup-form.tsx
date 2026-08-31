"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/actions";
import { inputCls, labelCls, btnPrimary } from "@/lib/ui";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, null);
  const isVerify = state?.includes("kiểm tra email");

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label className={labelCls}>Họ và tên</label>
        <input name="full_name" required className={inputCls} placeholder="Tên người quản lý" />
      </div>
      <div>
        <label className={labelCls}>Email</label>
        <input name="email" type="email" required autoComplete="email" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Mật khẩu (tối thiểu 6 ký tự)</label>
        <input name="password" type="password" required autoComplete="new-password" className={inputCls} />
      </div>

      {state && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            isVerify
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state}
        </div>
      )}

      <button type="submit" disabled={pending || !!isVerify} className={`${btnPrimary} w-full`}>
        {pending ? "Đang đăng ký..." : "Đăng ký"}
      </button>

      <p className="pt-2 text-center text-sm text-gray-500">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}