"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

async function requireClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

const num = (v: FormDataEntryValue | null) => {
  if (v === null || String(v).trim() === "") return null;
  const n = Number(String(v));
  return isNaN(n) ? null : n;
};

const str = (v: FormDataEntryValue | null) =>
  v === null ? null : String(v).trim() || null;

type State = string | null;

/* ================= AUTH ================= */

export async function login(_: State, formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return "Email hoặc mật khẩu không đúng.";

  const next = String(formData.get("next") ?? "/dashboard");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
}

export async function signup(_: State, formData: FormData) {
  const supabase = await createClient();
  const fullName = (formData.get("full_name") as string) ?? "";
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName.trim()) return "Vui lòng nhập họ và tên.";
  if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";

  const { data: hasProfile, error: rpcError } = await supabase.rpc(
    "has_any_profile"
  );
  if (rpcError) return "Không thể đăng ký lúc này. Vui lòng thử lại sau.";
  if (hasProfile !== false)
    return "Đăng ký đã đóng. Chỉ tài khoản quản trị viên đầu tiên được đăng ký.";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName.trim() } },
  });

  if (error) return error.message;
  if (data.session) redirect("/dashboard");
  return "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.";
}

export async function forgotPassword(_: State, formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return "Vui lòng nhập email.";

  const h = await headers();
  const origin =
    h.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
      "/auth/update-password"
    )}`,
  });

  if (error) return error.message;
  return "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.";
}

export async function updatePassword(_: State, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.";

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");
  if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
  if (password !== confirm) return "Mật khẩu xác nhận không khớp.";

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return error.message;
  redirect("/dashboard");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/* ================= STUDENTS ================= */

export async function saveStudent(_: State, formData: FormData) {
  const { supabase } = await requireClient();
  const id = str(formData.get("id"));
  if (!str(formData.get("code")) || !str(formData.get("full_name")))
    return "Vui lòng nhập mã và họ tên học viên.";

  const payload = {
    code: str(formData.get("code")),
    full_name: str(formData.get("full_name")),
    gender: str(formData.get("gender")) ?? "nam",
    birth_date: str(formData.get("birth_date")),
    phone: str(formData.get("phone")),
    email: str(formData.get("email")),
    parent_phone: str(formData.get("parent_phone")),
    address: str(formData.get("address")),
    status: str(formData.get("status")) ?? "active",
    note: str(formData.get("note")),
  };

  const { error } = id
    ? await supabase.from("students").update(payload).eq("id", id)
    : await supabase.from("students").insert(payload);

  if (error) return `Lỗi: ${error.message}`;
  revalidatePath("/dashboard/hocvien");
  redirect("/dashboard/hocvien");
}

export async function deleteStudent(id: string) {
  const { supabase } = await requireClient();
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) return `Lỗi: ${error.message}`;
  revalidatePath("/dashboard/hocvien");
  redirect("/dashboard/hocvien");
}

/* ================= TEACHERS ================= */

export async function saveTeacher(_: State, formData: FormData) {
  const { supabase } = await requireClient();
  const id = str(formData.get("id"));
  if (!str(formData.get("code")) || !str(formData.get("full_name")))
    return "Vui lòng nhập mã và họ tên giáo viên.";

  const payload = {
    code: str(formData.get("code")),
    full_name: str(formData.get("full_name")),
    gender: str(formData.get("gender")) ?? "nam",
    birth_date: str(formData.get("birth_date")),
    phone: str(formData.get("phone")),
    email: str(formData.get("email")),
    address: str(formData.get("address")),
    hourly_rate: num(formData.get("hourly_rate")),
    subject: str(formData.get("subject")),
    status: str(formData.get("status")) ?? "active",
    note: str(formData.get("note")),
  };

  const { error } = id
    ? await supabase.from("teachers").update(payload).eq("id", id)
    : await supabase.from("teachers").insert(payload);

  if (error) return `Lỗi: ${error.message}`;
  revalidatePath("/dashboard/giaovien");
  redirect("/dashboard/giaovien");
}

export async function deleteTeacher(id: string) {
  const { supabase } = await requireClient();
  const { error } = await supabase.from("teachers").delete().eq("id", id);
  if (error) return `Lỗi: ${error.message}`;
  revalidatePath("/dashboard/giaovien");
  redirect("/dashboard/giaovien");
}

/* ================= COURSES ================= */

export async function saveCourse(_: State, formData: FormData) {
  const { supabase } = await requireClient();
  const id = str(formData.get("id"));
  if (!str(formData.get("name"))) return "Vui lòng nhập tên khóa học.";

  const payload = {
    name: str(formData.get("name")),
    category: str(formData.get("category")) ?? "ngoai_ngu",
    duration_hours: num(formData.get("duration_hours")),
    tuition_fee: num(formData.get("tuition_fee")),
    note: str(formData.get("note")),
  };

  const { error } = id
    ? await supabase.from("courses").update(payload).eq("id", id)
    : await supabase.from("courses").insert(payload);

  if (error) return `Lỗi: ${error.message}`;
  revalidatePath("/dashboard/khoahoc");
  redirect("/dashboard/khoahoc");
}

export async function deleteCourse(id: string) {
  const { supabase } = await requireClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) return `Lỗi: ${error.message}`;
  revalidatePath("/dashboard/khoahoc");
  redirect("/dashboard/khoahoc");
}

/* ================= CLASSES ================= */

export async function saveClass(_: State, formData: FormData) {
  const { supabase } = await requireClient();
  const id = str(formData.get("id"));
  if (!str(formData.get("name"))) return "Vui lòng nhập tên lớp.";

  const payload = {
    name: str(formData.get("name")),
    course_id: str(formData.get("course_id")),
    teacher_id: str(formData.get("teacher_id")),
    start_date: str(formData.get("start_date")),
    end_date: str(formData.get("end_date")),
    schedule_day: str(formData.get("schedule_day")),
    start_time: str(formData.get("start_time")),
    end_time: str(formData.get("end_time")),
    room: str(formData.get("room")),
    status: str(formData.get("status")) ?? "active",
  };

  const { error } = id
    ? await supabase.from("classes").update(payload).eq("id", id)
    : await supabase.from("classes").insert(payload);

  if (error) return `Lỗi: ${error.message}`;
  revalidatePath("/dashboard/lophoc");
  redirect("/dashboard/lophoc");
}

export async function deleteClass(id: string) {
  const { supabase } = await requireClient();
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) return `Lỗi: ${error.message}`;
  revalidatePath("/dashboard/lophoc");
  redirect("/dashboard/lophoc");
}

export async function enrollStudent(classId: string, studentId: string) {
  const { supabase } = await requireClient();
  const { error } = await supabase
    .from("class_students")
    .insert({ class_id: classId, student_id: studentId });
  if (!error) {
    await maybeCreateTuition(supabase, classId, studentId);
  }
  revalidatePath(`/dashboard/lophoc/${classId}`);
  return error ? `Lỗi: ${error.message}` : null;
}

async function maybeCreateTuition(
  supabase: Awaited<ReturnType<typeof requireClient>>["supabase"],
  classId: string,
  studentId: string
) {
  const { data: cl } = await supabase
    .from("classes")
    .select("course_id, name")
    .eq("id", classId)
    .single();
  if (!cl?.course_id) return;

  const { data: course } = await supabase
    .from("courses")
    .select("name, tuition_fee")
    .eq("id", cl.course_id);
  const courseRec = course?.[0];
  if (!courseRec || Number(courseRec.tuition_fee) <= 0) return;

  const { count: dup } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("class_id", classId)
    .not("status", "eq", "void");
  if (dup) return;

  await supabase.from("invoices").insert({
    student_id: studentId,
    class_id: classId,
    description: `Học phí khóa ${courseRec.name}`,
    amount: courseRec.tuition_fee,
    status: "unpaid",
  });
}

export async function removeFromClass(classId: string, studentId: string) {
  const { supabase } = await requireClient();
  const { error } = await supabase
    .from("class_students")
    .delete()
    .eq("class_id", classId)
    .eq("student_id", studentId);
  revalidatePath(`/dashboard/lophoc/${classId}`);
  return error ? `Lỗi: ${error.message}` : null;
}

/* ================= SESSIONS ================= */

export async function saveSession(_: State, formData: FormData) {
  const { supabase } = await requireClient();
  const id = str(formData.get("id"));
  const classId = str(formData.get("class_id"));
  if (!classId || !str(formData.get("session_date")))
    return "Vui lòng nhập lớp và ngày dạy.";

  const payload = {
    class_id: classId,
    session_date: str(formData.get("session_date")),
    start_time: str(formData.get("start_time")) ?? "00:00",
    end_time: str(formData.get("end_time")) ?? "00:00",
    topic: str(formData.get("topic")),
    status: str(formData.get("status")) ?? "scheduled",
    note: str(formData.get("note")),
  };

  const { error } = id
    ? await supabase.from("sessions").update(payload).eq("id", id)
    : await supabase.from("sessions").insert(payload);

  if (error) return `Lỗi: ${error.message}`;
  revalidatePath(`/dashboard/lophoc/${classId}`);
  redirect(`/dashboard/lophoc/${classId}`);
}

export async function deleteSession(id: string, classId: string) {
  const { supabase } = await requireClient();
  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) return `Lỗi: ${error.message}`;
  revalidatePath(`/dashboard/lophoc/${classId}`);
  redirect(`/dashboard/lophoc/${classId}`);
}

export async function setSessionStatus(id: string, status: string) {
  const { supabase } = await requireClient();
  const { data: s } = await supabase
    .from("sessions")
    .select("class_id")
    .eq("id", id)
    .single();
  const { error } = await supabase.from("sessions").update({ status }).eq("id", id);
  if (s) revalidatePath(`/dashboard/lophoc/${s.class_id}`);
  return error ? `Lỗi: ${error.message}` : null;
}

/* ================= ATTENDANCE ================= */

export async function saveAttendance(
  sessionId: string,
  classId: string,
  entries: { student_id: string; status: string }[]
) {
  const { supabase } = await requireClient();
  const rows = entries.map((e) => ({
    session_id: sessionId,
    student_id: e.student_id,
    status: e.status,
  }));

  const { error } = await supabase.from("attendance").upsert(rows, {
    onConflict: "session_id,student_id",
  });
  if (!error) {
    await supabase.from("sessions").update({ status: "done" }).eq("id", sessionId);
  }
  revalidatePath(`/dashboard/lophoc/${classId}`);
  revalidatePath(`/dashboard/lophoc/${classId}/diemdanh/${sessionId}`);
  return error ? `Lỗi: ${error.message}` : null;
}

/* ================= TUITION ================= */

export async function saveInvoice(_: State, formData: FormData) {
  const { supabase } = await requireClient();
  const id = str(formData.get("id"));
  const studentId = str(formData.get("student_id"));
  if (!studentId) return "Vui lòng chọn học viên.";

  const payload = {
    student_id: studentId,
    class_id: str(formData.get("class_id")),
    description: str(formData.get("description")) ?? "Học phí",
    amount: num(formData.get("amount")) ?? 0,
    due_date: str(formData.get("due_date")),
    status: str(formData.get("status")) ?? "unpaid",
  };

  const { error } = id
    ? await supabase.from("invoices").update(payload).eq("id", id)
    : await supabase.from("invoices").insert(payload);

  if (error) return `Lỗi: ${error.message}`;
  revalidatePath("/dashboard/hocphi");
  redirect("/dashboard/hocphi");
}

export async function deleteInvoice(id: string) {
  const { supabase } = await requireClient();
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  revalidatePath("/dashboard/hocphi");
  return error ? `Lỗi: ${error.message}` : null;
}

export async function recordPayment(_: State, formData: FormData) {
  const { supabase } = await requireClient();
  const invoiceId = str(formData.get("invoice_id"));
  const studentId = str(formData.get("student_id"));
  const amount = num(formData.get("amount"));
  if (!invoiceId || !studentId) return "Thiếu thông tin hóa đơn.";
  if (amount === null || amount <= 0) return "Số tiền phải lớn hơn 0.";

  const { error } = await supabase.from("payments").insert({
    invoice_id: invoiceId,
    student_id: studentId,
    amount,
    payment_date: str(formData.get("payment_date")) ?? new Date().toISOString().slice(0, 10),
    method: str(formData.get("method")) ?? "cash",
    note: str(formData.get("note")),
  });

  if (error) return `Lỗi: ${error.message}`;
  revalidatePath("/dashboard/hocphi");
  redirect("/dashboard/hocphi");
}

export async function deletePayment(id: string) {
  const { supabase } = await requireClient();
  const { error } = await supabase.from("payments").delete().eq("id", id);
  revalidatePath("/dashboard/hocphi");
  return error ? `Lỗi: ${error.message}` : null;
}