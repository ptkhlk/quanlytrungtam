import type { Metadata } from "next";
import LoginForm from "@/components/login-form";

export const metadata: Metadata = { title: "Đăng nhập - Quản lý Trung tâm" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Trung tâm Ngoại ngữ - Tin học</h1>
          <p className="mt-1 text-sm text-gray-500">Đăng nhập để quản lý trung tâm</p>
        </div>

        {error === "confirm" && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Phiên xác nhận không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.
          </div>
        )}

        <LoginForm next={next ?? "/dashboard"} />
      </div>
    </div>
  );
}