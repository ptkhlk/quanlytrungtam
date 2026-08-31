"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions";
import { inputCls, labelCls, btnPrimary } from "@/lib/ui";

export default function LoginForm({ next, closed }: { next: string; closed: boolean }) {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className={labelCls}>Email</label>
        <input name="email" type="email" required autoComplete="email" className={inputCls} placeholder="ban@giamdoc.com" />
      </div>
      <div>
        <label className={labelCls}>Mật khẩu</label>
        <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
      </div>

      <div className="text-right">
        <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
          Quên mật khẩu?
        </Link>
      </div>

      {state && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state}
        </div>
      )}

      <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      {!closed && (
        <p className="pt-2 text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link href="/signup" className="font-medium text-blue-600 hover:underline">
            Đăng ký
          </Link>
        </p>
      )}
    </form>
  );
}