# Hướng Dẫn Triển Khai Dự Án Lên VPS

Tài liệu này áp dụng cho trạng thái hiện tại của dự án `Rau Củ Phan Thiết`.

- Frontend: `Next.js`
- Backend: `NestJS`
- Database: `PostgreSQL`
- File upload: lưu local trong `backend/uploads`

Mô hình triển khai:

- `frontend` chạy cổng `3000`
- `backend` chạy cổng `4000`
- `nginx` reverse proxy domain thật về 2 service này
- `pm2` giữ tiến trình luôn hoạt động

## 1. Chuẩn Bị

Bạn cần có:

1. VPS Ubuntu `22.04 LTS` hoặc `24.04 LTS`
2. Domain trỏ về IP VPS
3. Code đã đẩy lên GitHub/GitLab để `git clone`

Cấu hình VPS khuyến nghị:

- `2 GB RAM` trở lên
- `1-2 vCPU`
- `30 GB SSD` trở lên

Lý do:

- `Next.js` lúc build khá tốn RAM
- backend dùng `PostgreSQL` và lưu ảnh upload local

## 2. DNS Domain

Trỏ domain về VPS bằng các bản ghi:

- `A` record `@` -> `IP_VPS`
- `A` record `www` -> `IP_VPS`
- `A` record `api` -> `IP_VPS`

Ví dụ:

- `raucuphanthiet.com` -> frontend
- `api.raucuphanthiet.com` -> backend

## 3. Cài Môi Trường Trên VPS

SSH vào VPS:

```bash
ssh root@IP_VPS
```

Cập nhật hệ thống:

```bash
apt update && apt upgrade -y
```

Cài các gói cơ bản:

```bash
apt install -y curl git unzip nginx certbot python3-certbot-nginx
```

Cài Node.js 20:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Kiểm tra:

```bash
node -v
npm -v
```

Cài PM2:

```bash
npm install -g pm2
```

## 4. Cài PostgreSQL

Cài PostgreSQL:

```bash
apt install -y postgresql postgresql-contrib
```

Đăng nhập PostgreSQL:

```bash
sudo -u postgres psql
```

Tạo database và user production:

```sql
CREATE DATABASE raucuphanthiet;
CREATE USER raucu_user WITH PASSWORD 'doi_mat_khau_manh';
GRANT ALL PRIVILEGES ON DATABASE raucuphanthiet TO raucu_user;
\q
```

## 5. Tải Code Về VPS

Ví dụ đặt code tại:

```bash
mkdir -p /var/www
cd /var/www
git clone <REPO_URL> raucuphanthiet
cd raucuphanthiet
```

Cấu trúc repo hiện tại:

- `frontend/`
- `backend/`

## 6. Cấu Hình Backend

Tạo file `backend/.env` production:

```env
DATABASE_URL="postgresql://raucu_user:doi_mat_khau_manh@localhost:5432/raucuphanthiet?schema=public"
JWT_SECRET="doi-secret-manh"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="doi-refresh-secret-manh"
JWT_REFRESH_EXPIRES_IN="30d"
PORT=4000
NODE_ENV=production
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
FRONTEND_URL=https://raucuphanthiet.com
```

Cài package và build backend:

```bash
cd /var/www/raucuphanthiet/backend
npm install
npx prisma generate
npm run db:push
npm run build
```

Nếu cần seed dữ liệu mẫu:

```bash
npm run db:seed
```

Chạy backend bằng PM2:

```bash
pm2 start npm --name raucu-backend -- run start:prod
```

Lưu ý:

- script production hiện đúng là `node dist/src/main.js`
- ảnh upload sẽ lưu tại `backend/uploads`

## 7. Cấu Hình Frontend

Tạo file `frontend/.env.local` production:

```env
NEXT_PUBLIC_API_URL=https://api.raucuphanthiet.com/api/v1
NEXT_PUBLIC_UPLOADS_URL=https://api.raucuphanthiet.com
NEXT_PUBLIC_SITE_NAME=Rau Củ Phan Thiết
NEXT_PUBLIC_SITE_PHONE=0901234567
```

Build frontend:

```bash
cd /var/www/raucuphanthiet/frontend
npm install
npm run build
```

Chạy frontend bằng PM2:

```bash
pm2 start npm --name raucu-frontend -- start
```

## 8. Tự Khởi Động Sau Khi Reboot

Lưu process PM2:

```bash
pm2 save
pm2 startup
```

PM2 sẽ in ra một lệnh. Copy và chạy đúng lệnh đó.

## 9. Cấu Hình Nginx

Tạo file nginx cho frontend:

```bash
nano /etc/nginx/sites-available/raucuphanthiet.com
```

Nội dung:

```nginx
server {
    server_name raucuphanthiet.com www.raucuphanthiet.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Tạo file nginx cho API:

```bash
nano /etc/nginx/sites-available/api.raucuphanthiet.com
```

Nội dung:

```nginx
server {
    server_name api.raucuphanthiet.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Kích hoạt cấu hình:

```bash
ln -s /etc/nginx/sites-available/raucuphanthiet.com /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/api.raucuphanthiet.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 10. Cài SSL

Chạy Certbot:

```bash
certbot --nginx -d raucuphanthiet.com -d www.raucuphanthiet.com
certbot --nginx -d api.raucuphanthiet.com
```

Kiểm tra tự gia hạn:

```bash
certbot renew --dry-run
```

## 11. Kiểm Tra Sau Deploy

Kiểm tra PM2:

```bash
pm2 list
pm2 logs raucu-backend
pm2 logs raucu-frontend
```

Kiểm tra API:

```bash
curl http://127.0.0.1:4000/api/v1/categories?activeOnly=true
```

Kiểm tra Nginx:

```bash
systemctl status nginx
```

Kiểm tra web:

- `https://raucuphanthiet.com`
- `https://api.raucuphanthiet.com/api/v1/categories?activeOnly=true`

## 12. Cập Nhật Code Sau Này

Khi cần deploy bản mới:

```bash
cd /var/www/raucuphanthiet
git pull

cd backend
npm install
npx prisma generate
npm run build
pm2 restart raucu-backend

cd ../frontend
npm install
npm run build
pm2 restart raucu-frontend
```

Nếu schema database thay đổi:

```bash
cd /var/www/raucuphanthiet/backend
npm run db:push
pm2 restart raucu-backend
```

## 13. Ghi Chú Quan Trọng

- Dự án hiện không còn dùng SQLite
- ảnh upload là file local, nên phải backup thư mục `backend/uploads`
- database phải backup riêng bằng PostgreSQL
- nếu đổi domain production, nhớ sửa lại:
  - `backend/.env` -> `FRONTEND_URL`
  - `frontend/.env.local` -> `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_UPLOADS_URL`

## 14. Backup Khuyến Nghị

Backup database:

```bash
pg_dump -U raucu_user -h localhost raucuphanthiet > /root/backup-raucu.sql
```

Backup uploads:

```bash
tar -czf /root/uploads-backup.tar.gz /var/www/raucuphanthiet/backend/uploads
```

## 15. Trạng Thái Hiện Tại Của Repo

Các lệnh quan trọng đang đúng với repo này:

Backend:

```bash
npm run build
npm run db:push
npm run db:seed
npm run start:prod
```

Frontend:

```bash
npm run build
npm start
```

Nếu cần, có thể viết tiếp một bản `deploy từng lệnh một` dành riêng cho:

1. VPS mới hoàn toàn
2. deploy từ GitHub
3. cấu hình theo domain thật của bạn
