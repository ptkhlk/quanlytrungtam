import type { Metadata } from "next";
import SignupForm from "@/components/signup-form";

export const metadata: Metadata = { title: "Đăng ký - Quản lý Trung tâm" };

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Đăng ký tài khoản</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tài khoản đầu tiên sẽ trở thành quản trị viên
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}