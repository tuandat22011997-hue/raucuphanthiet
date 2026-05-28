/**
 * Utility functions dùng chung trong toàn bộ backend
 */

import slugify from 'slugify';

/**
 * Chuyển chuỗi tiếng Việt có dấu → không dấu, lowercase
 * Dùng để tạo cột nameSearch cho tìm kiếm nhanh
 *
 * Ví dụ: "Cà rốt" → "ca rot"
 */
export function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tổ hợp
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

/**
 * Tạo slug từ tên sản phẩm/danh mục
 * Ví dụ: "Cà rốt hữu cơ" → "ca-rot-huu-co"
 */
export function createSlug(text: string, suffix?: string): string {
  const base = slugify(text, {
    locale: 'vi',
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
  return suffix ? `${base}-${suffix}` : base;
}

/**
 * Tạo mã đơn hàng theo format: ORD-YYYYMMDD-XXXX
 * Ví dụ: ORD-20260527-0001
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 9000 + 1000); // 1000-9999
  return `ORD-${dateStr}-${random}`;
}

/**
 * Format giá tiền Việt Nam
 * Ví dụ: 25000 → "25.000 ₫"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format ngày theo kiểu Việt Nam
 * Ví dụ: 2026-05-27 → "27/05/2026"
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Tạo tên file Excel theo format: TenKhachHang_DD-MM-YYYY.xlsx
 * Ví dụ: NguyenVanA_27-05-2026.xlsx
 */
export function generateExcelFileName(customerName: string, date: Date = new Date()): string {
  // TENKHACHANG (không dấu, viết hoa, không khoảng trắng)
  const cleanName = removeVietnameseTones(customerName)
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase();

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${cleanName}_${day}${month}${year}.xlsx`;
}

/**
 * Chuẩn hóa query tìm kiếm để so sánh không phân biệt dấu
 * Xử lý cả trường hợp gõ "carot", "ca rot", "cà rốt"
 */
export function normalizeSearchQuery(query: string): string {
  return removeVietnameseTones(query)
    .replace(/\s+/g, ' ') // Chuẩn hóa khoảng trắng
    .trim();
}
