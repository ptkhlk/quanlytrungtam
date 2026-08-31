import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import UpdatePasswordForm from "@/components/update-password-form";

export const metadata: Metadata = { title: "Đặt lại mật khẩu - Quản lý Trung tâm" };

export default async function UpdatePasswordPage() {
  const auth = await getUser();
  if (!auth) redirect("/login?error=recovery");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Đặt lại mật khẩu</h1>
          <p className="mt-1 text-sm text-gray-500">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <UpdatePasswordForm />
      </div>
    </div>
  );
}