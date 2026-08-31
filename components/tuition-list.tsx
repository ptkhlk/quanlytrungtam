"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/custom-events";
import { deleteInvoice } from "@/app/actions";
import { btnGhost, btnPrimary, thCls, tdCls } from "@/lib/ui";
import InvoiceForm, { type InvoiceRecord } from "./invoice-form";
import PaymentForm from "./payment-form";
import { INVOICE_STATUS, badge, fmtDate, vnd } from "@/lib/utils";

export type InvoiceRow = {
  id: string;
  student_id: string;
  class_id: string | null;
  description: string | null;
  amount: number | null;
  due_date: string | null;
  status: string;
  student_code: string | null;
  student_name: string | null;
  class_name: string | null;
  payments: number[];
};

type ComputedRow = InvoiceRow & { paid: number; remaining: number; status: string };

export default function TuitionList({
  invoices,
  students,
  classes,
}: {
  invoices: InvoiceRow[];
  students: { id: string; code: string; full_name: string }[];
  classes: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);
  const [editing, setEditing] = useState<InvoiceRecord | null>(null);
  const [paying, setPaying] = useState<ComputedRow | null>(null);

  const rows = useMemo(
    () =>
      invoices.map((inv) => {
        const paid = (inv.payments ?? []).reduce((s, p) => s + Number(p), 0);
        const remaining = Math.max(0, Number(inv.amount) - paid);
        const status =
          inv.status === "void"
            ? "void"
            : paid >= Number(inv.amount)
              ? "paid"
              : paid > 0
                ? "partial"
                : "unpaid";
        return { ...inv, paid, remaining, status };
      }),
    [invoices]
  );

  const totalAmount = rows
    .filter((r) => r.status !== "void")
    .reduce((s, r) => s + Number(r.amount), 0);
  const totalPaid = rows
    .filter((r) => r.status !== "void")
    .reduce((s, r) => s + r.paid, 0);
  const totalRemaining = rows
    .filter((r) => r.status !== "void")
    .reduce((s, r) => s + r.remaining, 0);

  const counts = {
    unpaid: rows.filter((r) => r.status === "unpaid").length,
    partial: rows.filter((r) => r.status === "partial").length,
    paid: rows.filter((r) => r.status === "paid").length,
  };

  const filtered = rows.filter((r) => filter === "all" || r.status === filter);

  async function handleDelete(id: string) {
    if (!window.confirm("Xóa hóa đơn này? Các khoản thanh toán liên quan sẽ giữ nguyên.")) return;
    const err = await deleteInvoice(id);
    if (err) toast(err, "error");
    else {
      toast("Đã xóa hóa đơn", "success");
      router.refresh();
    }
  }

  const FILTERS = [
    ["all", "Tất cả"],
    ["unpaid", `Chưa đóng (${counts.unpaid})`],
    ["partial", `Thiếu (${counts.partial})`],
    ["paid", `Đã đóng (${counts.paid})`],
  ] as const;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs text-red-500">Tổng phải đóng</p>
          <p className="mt-1 text-lg font-bold text-red-700">{vnd(totalAmount)}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs text-green-500">Đã nhận</p>
          <p className="mt-1 text-lg font-bold text-green-700">{vnd(totalPaid)}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs text-amber-500">Còn thiếu</p>
          <p className="mt-1 text-lg font-bold text-amber-700">{vnd(totalRemaining)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
          <div className="flex gap-1">
            {FILTERS.map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  filter === val
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setInvoiceFormOpen(true);
            }}
            className={btnPrimary}
          >
            Tạo hóa đơn
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={thCls}>Học viên</th>
                <th className={thCls}>Lớp</th>
                <th className={thCls}>Diễn giải</th>
                <th className={thCls}>Phải đóng</th>
                <th className={thCls}>Đã đóng</th>
                <th className={thCls}>Còn lại</th>
                <th className={thCls}>Hạn</th>
                <th className={thCls}>Trạng thái</th>
                <th className={`${thCls} text-right`}>Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                    Không có hóa đơn nào.
                  </td>
                </tr>
              )}
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className={tdCls}>
                    <div className="font-medium">{inv.student_name ?? "—"}</div>
                    <div className="text-xs text-gray-400">{inv.student_code ?? ""}</div>
                  </td>
                  <td className={tdCls}>
                    {inv.class_name ? (
                      <Link href={`/dashboard/lophoc/${inv.class_id}`} className="text-blue-600 hover:underline">
                        {inv.class_name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={tdCls}>{inv.description ?? "Học phí"}</td>
                  <td className={`${tdCls} font-semibold`}>{vnd(inv.amount)}</td>
                  <td className={tdCls} title={inv.status === "void" ? "" : `Chi tiết các khoản đã đóng`}>
                    {inv.paid > 0 ? (
                      <span className="font-medium text-green-600">{vnd(inv.paid)}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={`${tdCls} font-semibold ${inv.remaining > 0 ? "text-red-600" : "text-gray-400"}`}>
                    {inv.remaining > 0 ? vnd(inv.remaining) : "0 ₫"}
                  </td>
                  <td className={tdCls}>{fmtDate(inv.due_date)}</td>
                  <td className={tdCls}>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge(inv.status)}`}>
                      {INVOICE_STATUS[inv.status]}
                    </span>
                    {inv.payments && inv.payments.length > 1 && (
                      <span className="ml-1 text-xs text-gray-400">({inv.payments.length} lần)</span>
                    )}
                  </td>
                  <td className={`${tdCls} whitespace-nowrap text-right`}>
                    {inv.status !== "void" && inv.remaining > 0 && (
                      <>
                        <button className={btnGhost} onClick={() => setPaying(inv)}>
                          Thanh toán
                        </button>
                        <span className="mx-1 text-gray-300">|</span>
                      </>
                    )}
                    <button
                      className={btnGhost}
                      onClick={() => {
                        setEditing({
                          id: inv.id,
                          student_id: inv.student_id,
                          class_id: inv.class_id,
                          description: inv.description,
                          amount: inv.amount,
                          due_date: inv.due_date,
                          status: inv.status,
                        });
                        setInvoiceFormOpen(true);
                      }}
                    >
                      Sửa
                    </button>
                    <span className="mx-1 text-gray-300">|</span>
                    <button className="text-sm font-medium text-red-600 hover:text-red-800" onClick={() => handleDelete(inv.id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InvoiceForm
        open={invoiceFormOpen}
        onClose={() => setInvoiceFormOpen(false)}
        invoice={editing}
        students={students}
        classes={classes}
      />

      {paying && (
        <PaymentForm
          open={!!paying}
          onClose={() => setPaying(null)}
          invoice={{ id: paying.id, student_id: paying.student_id, remaining: paying.remaining }}
          remaining={paying.remaining}
        />
      )}
    </div>
  );
}