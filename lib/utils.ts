export const GENDER_LABEL: Record<string, string> = {
  nam: "Nam",
  nu: "Nữ",
};

export const STUDENT_STATUS: Record<string, string> = {
  active: "Đang học",
  new: "Học viên mới",
  stopped: "Nghỉ học",
};

export const TEACHER_STATUS: Record<string, string> = {
  active: "Đang dạy",
  stopped: "Tạm nghỉ",
};

export const CLASS_STATUS: Record<string, string> = {
  active: "Đang học",
  completed: "Hoàn thành",
  paused: "Tạm hoãn",
};

export const SESSION_STATUS: Record<string, string> = {
  scheduled: "Dự kiến",
  done: "Đã dạy",
  cancelled: "Nghỉ",
};

export const ATTENDANCE_STATUS: Record<string, string> = {
  present: "Có mặt",
  late: "Đi muộn",
  absent: "Vắng",
};

export const INVOICE_STATUS: Record<string, string> = {
  unpaid: "Chưa đóng",
  partial: "Đóng một phần",
  paid: "Đã đóng",
  void: "Đã hủy",
};

export const CATEGORY_LABEL: Record<string, string> = {
  ngoai_ngu: "Ngoại ngữ",
  tin_hoc: "Tin học",
};

export const PAYMENT_METHOD: Record<string, string> = {
  cash: "Tiền mặt",
  transfer: "Chuyển khoản",
  card: "Thẻ",
};

export const vnd = (n: number | string | null | undefined) => {
  const num = Number(n ?? 0);
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(num) + " ₫";
};

export const fmtDate = (d: string | null | undefined) => {
  if (!d) return "—";
  const date = new Date(`${d}T00:00:00`);
  if (isNaN(date.getTime())) return d;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const fmtDateTime = (d: string | null | undefined) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const fmtTime = (t: string | null | undefined) => {
  if (!t) return "—";
  const [h, m] = t.split(":").slice(0, 2);
  return `${h}:${m}`;
};

export const dayOfWeek = (d: string | null | undefined) => {
  if (!d) return "";
  const date = new Date(`${d}T00:00:00`);
  if (isNaN(date.getTime())) return d;
  return new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(date);
};

export const dayName = (key: string) => {
  const map: Record<string, string> = {
    thu2: "Thứ 2",
    thu3: "Thứ 3",
    thu4: "Thứ 4",
    thu5: "Thứ 5",
    thu6: "Thứ 6",
    thu7: "Thứ 7",
    chunhat: "Chủ nhật",
  };
  return map[key] ?? key;
};

export const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export const nowMonthKey = () => monthKey(new Date());

export const durationMinutes = (start: string, end: string) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins;
};

export const badge = (status: string) => {
  const map: Record<string, string> = {
    // session
    done: "bg-green-100 text-green-700",
    scheduled: "bg-blue-100 text-blue-700",
    cancelled: "bg-gray-200 text-gray-600",
    // attendance
    present: "bg-green-100 text-green-700",
    late: "bg-amber-100 text-amber-700",
    absent: "bg-red-100 text-red-700",
    // invoice
    paid: "bg-green-100 text-green-700",
    partial: "bg-amber-100 text-amber-700",
    unpaid: "bg-red-100 text-red-700",
    void: "bg-gray-200 text-gray-500",
    // student / class / teacher
    active: "bg-green-100 text-green-700",
    new: "bg-blue-100 text-blue-700",
    stopped: "bg-gray-200 text-gray-600",
    completed: "bg-indigo-100 text-indigo-700",
    paused: "bg-amber-100 text-amber-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
};