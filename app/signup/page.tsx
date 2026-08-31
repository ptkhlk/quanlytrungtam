import type { Metadata } from "next";
import Link from "next/link";
import SignupForm from "@/components/signup-form";
import { isRegistrationClosed } from "@/lib/auth";

export const metadata: Metadata = { title: "Đăng ký - Quản lý Trung tâm" };

export default async function SignupPage() {
  const closed = await isRegistrationClosed();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Đăng ký tài khoản</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tài khoản đầu tiên sẽ trở thành quản trị viên
          </p>
        </div>

        {closed ? (
          <>
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700">
              <p>Đăng ký đã đóng. Vui lòng liên hệ quản trị viên nếu cần tài khoản.</p>
            </div>
            <div className="pt-4 text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Đăng nhập
              </Link>
            </div>
          </>
        ) : (
          <SignupForm />
        )}
      </div>
    </div>
  );
}