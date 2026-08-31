# 🏫 Quản lý Trung tâm Ngoại ngữ - Tin học

Ứng dụng web **100% miễn phí** giúp quản lý một trung tâm dạy thêm ngoại ngữ & tin học:

- 👨‍🎓 **Quản lý học viên** — thêm/sửa/xóa, tìm kiếm, trạng thái học
- 👨‍🏫 **Quản lý giáo viên** — thông tin, bộ môn, mức lương theo giờ
- 📚 **Khóa học & Lớp học** — khóa ngoại ngữ / tin học, lịch học, phòng học, phân công giáo viên, đăng ký học viên
- ✅ **Điểm danh theo buổi** — có mặt / đi muộn / vắng cho từng buổi học
- 💰 **Quản lý học phí** — hóa đơn, ghi nhận thanh toán, tổng còn thiếu
- 🧮 **Tính lương giáo viên** — tự động cộng số buổi giờ đã dạy trong tháng × lương/giờ

## 🧰 Công nghệ (đều miễn phí)

| Thành phần | Công nghệ | Chi phí |
|---|---|---|
| Frontend + Server | [Next.js](https://nextjs.org) (App Router) | Miễn phí |
| Backend + Database + Auth | [Supabase](https://supabase.com) (PostgreSQL) | Gói Free: 500MB DB, 50k user | 
| Lưu code | [GitHub](https://github.com) | Miễn phí |
| Hosting | [Vercel](https://vercel.com) | Gói Hobby miễn phí |

## 🚀 Bắt đầu

> Yêu cầu: Node.js 18.18+ và tài khoản GitHub / Supabase / Vercel.

### 1. Chạy tại máy (local)

```bash
npm install
cp .env.example .env.local   # sau đó điền 2 biến Supabase
npm run dev
```

Mở `http://localhost:3000`.

### 2. Tạo Supabase miễn phí

1. Vào [database.new](https://database.new) → đăng ký → **Create a new project** (miễn phí).
2. Mở **SQL Editor** → dán toàn bộ nội dung `supabase/schema.sql` → **Run**.
   *(Muốn có dữ liệu mẫu thì chạy tiếp `supabase/seed.sql`.)*
3. Vào **Project Settings → API**: copy `Project URL` và `anon public key`.
4. Dán vào `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

5. (Khuyến nghị) Vào **Authentication → URL Configuration**, thêm vào *Redirect URLs*:
   - `http://localhost:3000/auth/callback`
   - `https://<ten-app>.vercel.app/auth/callback` (sau khi deploy)

> Tài khoản đăng ký **đầu tiên** sẽ tự động trở thành **Quản trị viên**, các tài khoản sau là Nhân viên.

### 3. Đẩy lên GitHub (miễn phí)

```bash
git init
git add .
git commit -m "Quản lý trung tâm ngoại ngữ tin học"
git branch -M main
git remote add origin https://github.com/<ban>/<repo>.git
git push -u origin main
```

> ⚠️ Không bao giờ đẩy file `.env.local` lên (đã có trong `.gitignore`).

### 4. Deploy lên Vercel (miễn phí)

1. Vào [vercel.com/new](https://vercel.com/new) → import repo GitHub vừa tạo.
2. Framework mặc định **Next.js** — không cần chỉnh gì.
3. Trong **Environment Variables**, thêm 2 biến giống `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Bấm **Deploy**. Xong! 🎉

## 🧮 Cách tính lương giáo viên

Vào **Lương giáo viên**, chọn tháng (và giáo viên nếu muốn):

```
Lương tháng = (Tổng số giờ các buổi có trạng thái "Đã dạy") × Lương theo giờ
```

Số giờ mỗi buổi = `giờ kết thúc − giờ bắt đầu` (tự tính). Vì vậy:

- Tạo **Lớp học** → phân **giáo viên**, thêm **học viên**.
- Trong lớp, tạo **Buổi học** → bấm **Điểm danh** → lưu điểm danh → buổi đó tự chuyển trạng thái **Đã dạy** và được tính công.
- Buổi bị nghỉ đổi trạng thái **Nghỉ** để không tính lương.

## 📁 Cấu trúc dự án

```
app/                  # Ứng dụng (App Router)
  dashboard/          # Trang sau khi đăng nhập
    hocvien/          #   Học viên
    giaovien/         #   Giáo viên
    khoahoc/          #   Khóa học
    lophoc/           #   Lớp học + buổi học + điểm danh
    hocphi/           #   Học phí
    luong/            #   Lương giáo viên
  login/  signup/     # Đăng nhập / đăng ký
  auth/callback/      # Xác nhận email từ Supabase
  actions.ts          # Server Actions (thao tác dữ liệu)
components/           # UI + form (client components)
lib/                  # Supabase client, tiện ích
proxy.ts              # Bảo vệ route + làm mới phiên (Next.js 16)
supabase/
  schema.sql          # Bảng dữ liệu + RLS (chạy ở Supabase)
  seed.sql            # Dữ liệu mẫu (tùy chọn)
```

## ❓ Câu hỏi thường gặp

- **Không muốn xác nhận email khi đăng ký?** · Supabase → *Authentication → Providers → Email* → tắt **Confirm email**. Đăng ký sẽ vào thẳng.
- **RLS (Row Level Security)?** Mọi tài khoản đã đăng nhập đều được đọc/ghi dữ liệu — phù hợp trung tâm 1 chi nhánh. Nếu cần phân quyền chặt hơn, chỉnh policy trong `schema.sql`.
- **Gửi mail để làm bảng lương in?** Dùng *Lương giáo viên* → bấm **In / PDF** ở trình duyệt.