import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "@/components/forgot-password-form";

export const metadata: Metadata = { title: "Quên mật khẩu - Quản lý Trung tâm" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Quên mật khẩu</h1>
          <p className="mt-1 text-sm text-gray-500">
            Nhập email tài khoản, chúng tôi sẽ gửi link đặt lại mật khẩu
          </p>
        </div>

        <ForgotPasswordForm />

        <p className="pt-2 text-center text-sm text-gray-500">
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}