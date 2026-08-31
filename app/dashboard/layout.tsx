import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { signout } from "@/app/actions";
import Sidebar from "@/components/sidebar";
import ToastHost from "@/components/toast-host";
import { btnSecondary } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUser();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h2 className="text-sm font-medium text-gray-500">
            Chào mừng,{" "}
            <span className="font-semibold text-gray-900">
              {session.profile?.full_name || session.user.email}
            </span>
          </h2>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                session.profile?.role === "admin"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {session.profile?.role === "admin" ? "Quản trị viên" : "Nhân viên"}
            </span>
            <form action={signout}>
              <button type="submit" className={btnSecondary}>
                Đăng xuất
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
      <ToastHost />
    </div>
  );
}