# Hướng dẫn Chuẩn bị & Triển khai Dự án lên VPS

Để đưa dự án **Rau Củ Phan Thiết** (Frontend: Next.js, Backend: NestJS, Database: SQLite/PostgreSQL) lên môi trường chạy thật (Production) một cách chuyên nghiệp và ổn định, dưới đây là danh sách những thứ bạn cần chuẩn bị và lộ trình thực hiện.

---

## PHẦN 1: BẠN CẦN CHUẨN BỊ NHỮNG GÌ?

> [!IMPORTANT]
> Đây là các tài nguyên bạn cần tự trang bị trước khi chúng ta bắt tay vào cài đặt.

### 1. Thuê máy chủ ảo (VPS)
- **Hệ điều hành khuyên dùng:** `Ubuntu 22.04 LTS` hoặc `Ubuntu 24.04 LTS` (Bảo mật tốt, cộng đồng hỗ trợ lớn nhất).
- **Cấu hình tối thiểu:** **2GB RAM**, 1-2 Core CPU, 30GB SSD. (Do Next.js khi `build` và chạy tốn khá nhiều RAM, nếu VPS 1GB RAM rất dễ bị sập).
- **Nhà cung cấp gợi ý:** 
  - Trong nước (tải nhanh): Vietnix, AZDigi, TinoHost.
  - Quốc tế (ổn định, rẻ): DigitalOcean, Vultr, Linode.
- **Kết quả cần có:** Bạn sẽ nhận được 1 địa chỉ `IP public` (vd: `103.150.23.11`), tài khoản `root` và `mật khẩu` để đăng nhập.

### 2. Tên miền (Domain)
- Một tên miền cho website (vd: `raucuphanthiet.com` hoặc `raucu.vn`).
- Sau khi mua xong, bạn cần cấu hình DNS trỏ 2 bản ghi sau về **địa chỉ IP của VPS**:
  - Bản ghi `A` - Tên: `@` - Giá trị: `[IP của VPS]`
  - Bản ghi `A` - Tên: `www` - Giá trị: `[IP của VPS]`
  - *(Tùy chọn cho API)* Bản ghi `A` - Tên: `api` - Giá trị: `[IP của VPS]` (Để API chạy qua `api.raucuphanthiet.com`).

### 3. Đưa mã nguồn (Code) lên Internet
Để dễ dàng đưa code từ máy tính lên VPS, bạn cần tải mã nguồn lên một nền tảng lưu trữ.
- Tạo một kho lưu trữ **Private (Riêng tư)** trên [GitHub](https://github.com/) hoặc [GitLab](https://gitlab.com/).
- Cài đặt Git và Push toàn bộ thư mục `frontend` và `backend` lên kho lưu trữ đó.
- *(Cách thủ công nhưng kém an toàn: Bạn có thể nén file `.zip` và dùng FileZilla đẩy trực tiếp lên VPS).*

---

## PHẦN 2: LỘ TRÌNH TÔI SẼ HỖ TRỢ BẠN CÀI ĐẶT

Khi bạn đã có đủ 3 thứ trên (VPS, Tên miền, GitHub Repo), tôi sẽ hướng dẫn bạn gõ các lệnh trên VPS để thiết lập theo mô hình chuẩn **Node.js + PM2 + Nginx**:

### Bước 1: Cài đặt môi trường trên VPS
- Cài đặt `Node.js` (phiên bản 20.x).
- Cài đặt `PM2` (Công cụ quản lý giúp tự động chạy lại code nếu bị sập hoặc khởi động lại máy).
- Cài đặt `Nginx` (Phần mềm đóng vai trò cổng gác, điều hướng tên miền vào đúng code và cài chứng chỉ SSL bảo mật).

### Bước 2: Tải code và cấu hình Backend (NestJS)
- Dùng lệnh `git clone` để tải code từ GitHub về VPS.
- Sửa lại file `.env` cho Production (đổi `JWT_SECRET`, đổi đường dẫn Frontend...).
- Vì hiện tại bạn dùng SQLite (chạy rất tốt cho quy mô nhỏ), chúng ta sẽ giữ nguyên cơ sở dữ liệu lưu dưới dạng file.
- Chạy lệnh `npm install`, sau đó `npx prisma db push`, và `npm run build`.
- Dùng PM2 để chạy Backend chạy ngầm ở cổng `4000`.

### Bước 3: Cấu hình Frontend (Next.js)
- Cập nhật file `.env` của Frontend để API trỏ về tên miền thật (vd: `NEXT_PUBLIC_API_URL=https://api.raucuphanthiet.com/api/v1`).
- Chạy lệnh `npm install` và `npm run build`.
- Dùng PM2 để chạy Frontend ở cổng `3000`.

### Bước 4: Thiết lập Tên miền và Bảo mật SSL (HTTPS)
- Cấu hình **Nginx** để:
  - Khi khách vào `raucuphanthiet.com` -> Nginx chuyển yêu cầu tới cổng `3000` (Frontend).
  - Khi khách gọi `api.raucuphanthiet.com` (hoặc `raucuphanthiet.com/api`) -> Nginx chuyển yêu cầu tới cổng `4000` (Backend).
- Cài đặt `Certbot` (Let's Encrypt) để tự động tạo và gia hạn chứng chỉ **SSL miễn phí**, biến HTTP thành HTTPS an toàn.

---

## 🔥 BẠN CẦN LÀM GÌ TIẾP THEO?

> [!TIP]
> Nếu bạn chưa quen dùng Git/GitHub, hãy tạo tài khoản GitHub trước. Sau đó tôi sẽ hướng dẫn bạn từng dòng lệnh để đẩy code từ máy tính (VSCode) của bạn lên GitHub.

**Hãy cho tôi biết tiến độ hiện tại của bạn:**
1. Bạn đã thuê được VPS và Tên miền chưa? (Nếu có hãy cho tôi biết Hệ điều hành đang chạy, tuyệt đối không gửi mật khẩu tại đây).
2. Code của bạn đã nằm trên GitHub chưa?
3. Bạn muốn tiếp tục dùng **SQLite** (dễ bảo trì, đủ dùng) hay muốn chuyển sang **PostgreSQL** (chuyên nghiệp hơn, chịu tải lớn hơn) cho môi trường thực tế?
