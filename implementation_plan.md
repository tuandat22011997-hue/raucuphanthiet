# Kế Hoạch Xây Dựng Website Bán Rau Củ - RauCuPhanThiet

## Tổng Quan

Xây dựng hệ thống thương mại điện tử bán rau củ hoàn chỉnh với:
- **Frontend khách hàng**: Next.js 14 + TypeScript + TailwindCSS + Shadcn UI
- **Admin Dashboard**: tích hợp trong cùng Next.js project (route `/admin`)
- **Backend API**: NestJS + TypeScript
- **Database**: PostgreSQL (cần cài) + Prisma ORM
- **Cache**: Redis (cần cài)
- **Excel Export**: ExcelJS
- **Storage ảnh**: Cloudinary (free tier)
- **Thư mục**: `d:\raucuphanthiet\`

---

## ⚠️ Vấn Đề Cần Xử Lý (User Review Required)

> [!WARNING]
> **PostgreSQL và Redis chưa được cài đặt / chưa chạy** trên máy bạn. Docker cũng chưa có.
>
> Tôi sẽ cần cài đặt PostgreSQL và Redis trực tiếp (không qua Docker). Bạn có đồng ý để tôi chạy lệnh cài đặt không? Hoặc bạn muốn dùng SQLite (nhẹ hơn, không cần cài) thay cho PostgreSQL trong giai đoạn phát triển?

> [!IMPORTANT]
> **Lựa chọn Database cho Development:**
> - **Phương án A (Đề xuất cho dev)**: Dùng SQLite + Prisma trong development, PostgreSQL trong production. Không cần cài thêm gì.
> - **Phương án B**: Cài PostgreSQL 17 trực tiếp trên Windows (tải ~300MB installer).
> - **Phương án C**: Dùng Supabase (PostgreSQL cloud free) — chỉ cần tạo tài khoản.

> [!NOTE]
> **Cloudinary**: Cần tạo tài khoản free tại cloudinary.com để lưu ảnh sản phẩm. Tôi sẽ cần `Cloud Name`, `API Key`, `API Secret` của bạn — hoặc tôi có thể dùng local file upload trước.

---

## Câu Hỏi Mở

1. **Database**: Bạn muốn dùng SQLite (dev nhanh, không cài gì) hay PostgreSQL (cài local/cloud)?
2. **Ảnh sản phẩm**: Dùng Cloudinary (cần account) hay upload local?
3. **Domain/Port**: Chạy local trên port nào? (mặc định: Frontend 3000, Backend 4000)
4. **Tên cửa hàng**: "Rau Củ Phan Thiết" hay tên khác?

---

## Cấu Trúc Dự Án

```
d:\raucuphanthiet\
├── frontend/                    # Next.js 14 App
│   ├── src/
│   │   ├── app/
│   │   │   ├── (customer)/      # Layout khách hàng
│   │   │   │   ├── page.tsx     # Trang chủ
│   │   │   │   ├── products/    # Danh sách & chi tiết sản phẩm
│   │   │   │   ├── cart/        # Giỏ hàng
│   │   │   │   ├── checkout/    # Đặt hàng
│   │   │   │   ├── orders/      # Lịch sử đơn
│   │   │   │   └── profile/     # Tài khoản cá nhân
│   │   │   ├── (auth)/          # Đăng nhập, đăng ký
│   │   │   ├── admin/           # Admin Dashboard
│   │   │   │   ├── dashboard/
│   │   │   │   ├── products/
│   │   │   │   ├── categories/
│   │   │   │   ├── orders/
│   │   │   │   └── customers/
│   │   │   └── api/             # Next.js API Routes (proxy)
│   │   ├── components/
│   │   │   ├── ui/              # Shadcn components
│   │   │   ├── layout/          # Header, Footer, Nav
│   │   │   ├── product/         # ProductCard, ProductGrid...
│   │   │   ├── cart/            # CartItem, CartSummary...
│   │   │   ├── order/           # OrderCard, OrderStatus...
│   │   │   └── admin/           # Admin components
│   │   ├── lib/
│   │   │   ├── api.ts           # API client
│   │   │   ├── auth.ts          # Auth helpers
│   │   │   ├── utils.ts         # Utilities (removeAccents, format...)
│   │   │   └── validators.ts    # Zod schemas
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # Zustand state (cart, auth)
│   │   └── types/               # TypeScript interfaces
│   ├── public/
│   └── package.json
│
├── backend/                     # NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/            # JWT, bcrypt, login, register
│   │   │   ├── users/           # User CRUD, profile
│   │   │   ├── products/        # Product CRUD + search
│   │   │   ├── categories/      # Category CRUD
│   │   │   ├── orders/          # Order management
│   │   │   ├── cart/            # Cart logic
│   │   │   ├── addresses/       # User addresses
│   │   │   ├── upload/          # File/Cloudinary upload
│   │   │   └── excel/           # ExcelJS export
│   │   ├── common/
│   │   │   ├── guards/          # JWT, Role guards
│   │   │   ├── interceptors/    # Response transform, logging
│   │   │   ├── filters/         # Exception filters
│   │   │   ├── pipes/           # Validation pipes
│   │   │   └── decorators/      # Custom decorators
│   │   ├── config/              # Config module
│   │   ├── database/            # Prisma module
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma        # DB schema
│   │   └── seed.ts              # Seed data
│   └── package.json
│
└── docker-compose.yml           # (tùy chọn, nếu cài Docker sau)
```

---

## Kế Hoạch Thực Thi (Theo Giai Đoạn)

### Giai Đoạn 1: Backend Foundation
1. Khởi tạo NestJS project
2. Cài đặt Prisma + cấu hình database
3. Tạo database schema đầy đủ
4. Module Auth (JWT, bcrypt, register/login)
5. Module Users, Products, Categories
6. Module Orders (tạo đơn, cập nhật trạng thái)
7. Module Upload (Cloudinary)
8. Module Excel Export (ExcelJS)
9. Rate limiting, logging, error handling

### Giai Đoạn 2: Frontend Khách Hàng
1. Khởi tạo Next.js 14 + TailwindCSS + Shadcn
2. Design system & color tokens (xanh lá tươi mát)
3. Layout: Header, Footer, Mobile Nav
4. Trang chủ: Banner slider, danh mục
5. Trang sản phẩm: Grid, filter, sort, phân trang
6. Tìm kiếm realtime (debounce, không dấu, gần đúng)
7. Chi tiết sản phẩm
8. Giỏ hàng (Zustand, persist)
9. Checkout: form + chọn ngày/giờ giao
10. Lịch sử đơn + Đặt lại
11. Auth pages (login, register, forgot password)
12. Profile + địa chỉ

### Giai Đoạn 3: Admin Dashboard
1. Layout admin (sidebar, responsive)
2. Dashboard stats (đơn hôm nay, doanh thu, biểu đồ)
3. Quản lý sản phẩm (CRUD + upload ảnh)
4. Quản lý danh mục
5. Quản lý đơn hàng (filter, search, cập nhật trạng thái)
6. Xuất Excel đơn hàng
7. Quản lý khách hàng

### Giai Đoạn 4: Tối Ưu & Polish
1. SEO (meta tags, OpenGraph, sitemap)
2. Lazy loading images (next/image)
3. Debounce search optimization
4. Responsive kiểm tra tất cả breakpoints
5. Error boundaries
6. Loading skeletons
7. Toast notifications
8. PWA manifest (mobile)

---

## Database Schema Chính

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  phone     String?
  name      String
  password  String   // bcrypt hash
  role      Role     @default(CUSTOMER)
  addresses Address[]
  orders    Order[]
  createdAt DateTime @default(now())
  deletedAt DateTime? // soft delete
}

model Product {
  id          String         @id @default(cuid())
  name        String
  nameSearch  String         // tên không dấu, lowercase để tìm kiếm
  slug        String         @unique
  price       Decimal
  priceWhole  Decimal?       // giá sỉ
  unit        String         // kg, bó, quả...
  stock       Int            @default(0)
  description String?
  categoryId  String
  category    Category       @relation(fields: [categoryId], references: [id])
  images      ProductImage[]
  orderItems  OrderItem[]
  deletedAt   DateTime?
  @@index([nameSearch])
  @@index([categoryId])
}

model Order {
  id           String      @id @default(cuid())
  orderNumber  String      @unique // VD: ORD-20260527-001
  userId       String?
  user         User?       @relation(fields: [userId], references: [id])
  customerName String
  phone        String
  address      String
  note         String?
  deliveryDate DateTime?
  deliveryTime String?
  status       OrderStatus @default(PENDING)
  items        OrderItem[]
  totalAmount  Decimal
  createdAt    DateTime    @default(now())
  @@index([status])
  @@index([createdAt])
}
```

---

## API Endpoints Chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | /auth/register | Đăng ký |
| POST | /auth/login | Đăng nhập |
| GET | /products | Danh sách sản phẩm (filter, sort, page) |
| GET | /products/search?q= | Tìm kiếm realtime |
| GET | /products/:slug | Chi tiết sản phẩm |
| POST | /orders | Tạo đơn hàng |
| GET | /orders/my | Đơn hàng của tôi |
| GET | /admin/orders | Admin xem đơn |
| PATCH | /admin/orders/:id/status | Cập nhật trạng thái |
| GET | /admin/orders/:id/export | Xuất Excel 1 đơn |
| POST | /admin/orders/export-bulk | Xuất Excel nhiều đơn |

---

## Tính Năng Nổi Bật

### Tìm Kiếm Thông Minh
```typescript
// Chuyển "Cà rốt" → "ca rot" để index và so sánh
function removeAccents(str: string): string {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().trim();
}
// "ca rot", "carot", "cà" đều match "Cà rốt"
```

### Excel Export Đẹp
- Header màu xanh lá
- Border đầy đủ
- Auto column width
- Font: Arial Unicode MS (hỗ trợ tiếng Việt)
- Tên file: `NguyenVanA_27-05-2026.xlsx`

### Mobile UX ≤ 60 giây
- Sticky bottom nav trên mobile
- Quick add to cart ngay tại danh sách
- Saved address auto-fill
- One-tap reorder từ lịch sử

---

## Verification Plan

### Automated
- `npm run build` cho cả frontend và backend
- `npm run test` cho backend (unit tests key modules)
- Prisma migrate + seed chạy thành công

### Manual
- Test responsive trên Chrome DevTools (iPhone 14, Samsung S23, iPad)
- Luồng mua hàng ≤ 60 giây end-to-end
- Xuất Excel và kiểm tra file
- Admin CRUD sản phẩm, đơn hàng

Kế hoạch Cải thiện Trải nghiệm Đặt Hàng & Quản lý Địa Chỉ
Theo yêu cầu của bạn, tôi sẽ tiến hành nâng cấp luồng đặt hàng và quản lý tài khoản để mang lại trải nghiệm chuyên nghiệp hơn cho người dùng.

Mục tiêu thay đổi
Bắt buộc người dùng nhập địa chỉ ngay lúc đăng ký tài khoản.
Xây dựng trang Sổ địa chỉ (/tai-khoan/dia-chi) để người dùng quản lý địa chỉ giao hàng.
Thêm bước Xác nhận đơn hàng dưới dạng một bảng tóm tắt (Modal/Dialog) hiển thị chi tiết (sản phẩm, tổng tiền, địa chỉ, ngày giờ giao) trước khi chính thức đặt hàng.
Các thay đổi dự kiến
1. Cập nhật luồng Đăng ký (Backend + Frontend)
Backend (auth.dto.ts, auth.service.ts):
Bổ sung trường address vào RegisterDto (bắt buộc).
Khi tạo User mới, hệ thống tự động khởi tạo luôn một bản ghi trong bảng Address và đánh dấu là địa chỉ mặc định (isDefault: true).
Frontend (dang-ky/page.tsx):
Thêm trường "Địa chỉ giao hàng" (Textarea) vào form đăng ký.
Fix giao diện form để các ô input hiển thị gọn gàng hơn.
2. Xây dựng trang Sổ Địa Chỉ (Frontend)
Frontend (tai-khoan/dia-chi/page.tsx):
Tạo trang mới (hiện tại đang bị 404 như trong ảnh chụp).
Kết nối với addressesApi (đã có sẵn ở backend) để hiển thị danh sách địa chỉ của người dùng.
Tính năng: Thêm địa chỉ mới, Chỉnh sửa, Xóa, Thiết lập địa chỉ mặc định.
3. Cập nhật trang Giỏ hàng & Checkout (Frontend)
Frontend (gio-hang/page.tsx):
Tự động điền (auto-fill) thông tin "Địa chỉ giao hàng" vào form checkout từ địa chỉ mặc định của người dùng (nếu có).
Khi người dùng bấm nút "Đặt hàng", thay vì gọi API tạo đơn ngay, sẽ bật lên một Dialog (Cửa sổ xác nhận).
Dialog hiển thị tóm tắt: Danh sách món, Tổng tiền, Tên & SĐT người nhận, Địa chỉ, Ngày & Giờ giao.
Thêm nút "Xác nhận đặt hàng" bên trong Dialog để hoàn tất luồng.
User Review Required
IMPORTANT

Câu hỏi cho bạn: Ở bước đăng ký tài khoản, việc thêm trường "Địa chỉ" làm bước đăng ký dài hơn một chút. Bạn có muốn bắt buộc nhập luôn địa chỉ, hay chỉ để dưới dạng Tùy chọn (Optional) ở bước đăng ký, và sau đó bắt buộc lúc checkout? Theo kế hoạch trên, tôi sẽ thiết lập địa chỉ là Bắt buộc ở bước đăng ký như bạn đã yêu cầu.

TIP

Việc hiển thị Popup/Dialog xác nhận đơn hàng lúc thanh toán sẽ giúp hạn chế tối đa việc khách hàng đặt nhầm địa chỉ hoặc nhầm ngày giao. Tôi sẽ thiết kế nó với giao diện cực kỳ rõ ràng, trực quan.


# Kế hoạch Thêm tính năng "Tìm kiếm & Thêm nhanh" trong Giỏ hàng

Để hỗ trợ khách hàng mua sỉ/đặt hàng trước (Pre-order) một cách nhanh chóng nhất, tôi sẽ tích hợp một thanh tìm kiếm siêu tốc trực tiếp ngay bên trong trang Giỏ hàng. Người dùng không cần quay lại trang Sản phẩm mà có thể tìm và thêm hàng loạt sản phẩm ngay tại đây.

## Tính năng chi tiết

### 1. Thanh Tìm kiếm thông minh (Trang Giỏ hàng)
- Sẽ thêm một thanh tìm kiếm to, rõ ràng ngay phía trên danh sách sản phẩm trong giỏ hàng (hoặc ở ngay giữa màn hình nếu giỏ hàng đang trống).
- Khi người dùng gõ từ khóa (vd: "cà chua"), hệ thống sẽ tự động tìm kiếm ngầm và hiển thị ngay lập tức một danh sách (List) các sản phẩm kết quả thả xuống ngay bên dưới thanh tìm kiếm (giống như tính năng auto-complete).

### 2. Thêm nhanh vào giỏ (1-chạm)
- Mỗi kết quả tìm được trong danh sách xổ xuống sẽ có hình ảnh nhỏ, tên, giá bán và một nút **[+] (Thêm)**.
- Người dùng chỉ việc bấm **[+]** là sản phẩm sẽ bay thẳng vào giỏ hàng ngay lập tức.
- Nếu bấm liên tục nhiều lần vào nút **[+]**, số lượng trong giỏ hàng sẽ tự động tăng lên mà không cần tải lại trang.

### 3. Tối ưu hóa cho Mobile
- Danh sách kết quả sẽ được thiết kế gọn gàng, thân thiện với ngón tay khi chạm trên màn hình cảm ứng.
- Thanh tìm kiếm sẽ luôn hiển thị cố định hoặc ở vị trí dễ với tới để thao tác nhập liệu không bị gián đoạn bởi bàn phím ảo.

## Các File sẽ được chỉnh sửa

### [MODIFY] `frontend/src/app/gio-hang/page.tsx`
- Cập nhật import `productsApi` để thực hiện tính năng tìm kiếm trực tiếp.
- Thêm state lưu trữ từ khóa tìm kiếm (`cartSearch`).
- Sử dụng `useQuery` để gọi API lấy danh sách sản phẩm mỗi khi gõ phím.
- Thiết kế UI cho thanh tìm kiếm và Menu Dropdown chứa kết quả tìm kiếm.
- Xử lý logic Thêm vào giỏ (`handleAddToCart`) trực tiếp từ dropdown này.

## User Review Required

> [!TIP]
> Tính năng này sẽ biến Giỏ hàng thành một cỗ máy chốt đơn "siêu tốc" rất phù hợp cho dân buôn hoặc khách quen đặt trước số lượng lớn. Bạn hãy xem qua các chức năng trên đã đúng ý bạn chưa nhé. 
