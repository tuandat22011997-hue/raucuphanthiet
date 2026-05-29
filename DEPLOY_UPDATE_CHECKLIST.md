# Deploy Update Checklist

Checklist này dùng cho dự án hiện tại:

- Frontend: `Next.js`
- Backend: `NestJS`
- Database: `PostgreSQL`
- Uploads: `backend/uploads`
- Domain chính: `https://raucuphanthiet.store`
- API dự kiến: `https://api.raucuphanthiet.store`

## 1. Trước Khi Push Git

Xác nhận các thay đổi của bạn thuộc nhóm an toàn:

- sửa giao diện
- sửa text, màu sắc, bố cục
- sửa logic frontend nhưng không đổi API
- sửa chức năng backend nhưng không đổi biến môi trường production

Dừng lại và kiểm tra kỹ nếu bạn có đụng đến:

- `frontend/.env.local`
- `backend/.env`
- `DATABASE_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_UPLOADS_URL`
- `FRONTEND_URL`
- schema Prisma
- thư mục `backend/uploads`
- domain hoặc subdomain

## 2. Kiểm Tra Local Trước Khi Push

Backend:

```bash
cd backend
npm install
npm run build
```

Frontend:

```bash
cd frontend
npm install
npm run build
```

Chỉ push khi cả `backend` và `frontend` đều build pass.

## 3. Nếu Có Đổi Database Schema

Nếu bạn có sửa:

- `backend/prisma/schema.prisma`
- model Prisma
- field bảng dữ liệu

Thì phải nhớ server cần chạy thêm:

```bash
cd backend
npx prisma generate
npm run db:push
```

Nếu không có thay đổi schema thì không cần bước này.

## 4. Push Lên Git

Push lên branch production đã thống nhất, ví dụ:

- `main`

Tránh deploy trực tiếp từ branch test hoặc code đang làm dở.

## 5. Quy Trình Update Trên Server

```bash
cd /var/www/raucuphanthiet
git pull

cd backend
npm ci
npx prisma generate
npm run build
pm2 restart raucu-backend

cd ../frontend
npm ci
npm run build
pm2 restart raucu-frontend
```

Nếu có đổi schema database:

```bash
cd /var/www/raucuphanthiet/backend
npm run db:push
pm2 restart raucu-backend
```

## 6. Kiểm Tra Sau Khi Update

Kiểm tra backend:

```bash
pm2 logs raucu-backend
```

Kiểm tra frontend:

```bash
pm2 logs raucu-frontend
```

Kiểm tra API:

```bash
curl http://127.0.0.1:4000/api/v1/categories?activeOnly=true
```

Kiểm tra trên trình duyệt:

- trang chủ
- trang sản phẩm
- đăng nhập
- admin
- thêm giỏ hàng
- tạo đơn hàng

## 7. Những Thứ Không Được Mất

Ba thứ này phải giữ riêng trên server, không phụ thuộc vào Git:

- `backend/.env`
- database PostgreSQL
- `backend/uploads`

Nếu deploy xong mà mất một trong ba thứ này thì web sẽ lỗi hoặc mất dữ liệu.

## 8. Những Thay Đổi Dễ Gây Hỏng Dự Án

Các thay đổi dưới đây không nên tự push nếu chưa kiểm tra kỹ với kỹ thuật viên:

- đổi domain
- đổi subdomain API
- đổi `NEXT_PUBLIC_API_URL`
- đổi `NEXT_PUBLIC_UPLOADS_URL`
- đổi `FRONTEND_URL`
- đổi cổng chạy frontend/backend
- đổi cấu trúc endpoint API
- đổi cách lưu uploads

## 9. Nguyên Tắc An Toàn

- chỉ deploy từ 1 branch ổn định
- không sửa tay code production trên server
- không commit file `.env` production vào Git
- không commit dữ liệu thật hoặc ảnh upload vào Git
- luôn build local trước khi push

## 10. Khi Nào Cần Nhờ Kỹ Thuật Viên

Nên nhờ kỹ thuật viên nếu bạn cần:

- đổi domain sang tên miền khác
- đổi server
- đổi cách deploy
- thêm SSL
- sửa Nginx
- sửa PM2
- chuyển database
- thay đổi cấu hình production trong `.env`
