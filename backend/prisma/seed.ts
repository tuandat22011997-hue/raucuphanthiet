/**
 * Seed script cho Prisma v7 với better-sqlite3 trực tiếp
 * Bỏ qua adapter - dùng better-sqlite3 thẳng
 */

import Database from 'better-sqlite3';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = path.resolve(process.cwd(), 'prisma', 'dev.db');
const db = new Database(DB_PATH);

// Enable WAL mode cho performance
db.pragma('journal_mode = WAL');

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .toLowerCase().trim();
}

function createSlug(text: string): string {
  return removeVietnameseTones(text)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function now(): string {
  return new Date().toISOString();
}

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...');
  console.log(`📁 Database: ${DB_PATH}`);

  // ============ 1. TẠO ADMIN ============
  const adminId = uuidv4();
  const adminEmail = 'admin@raucuphanthiet.vn';
  const adminPassword = await bcrypt.hash('admin123456', 12);

  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!existingAdmin) {
    db.prepare(`
      INSERT INTO users (id, email, name, password, phone, role, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(adminId, adminEmail, 'Quản Trị Viên', adminPassword, '0901234567', 'ADMIN', now(), now());
    console.log(`✅ Admin tạo: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Admin đã tồn tại: ${adminEmail}`);
  }

  // ============ 2. TẠO KHÁCH HÀNG ============
  const customerId = uuidv4();
  const customerEmail = 'customer@example.com';
  const customerPassword = await bcrypt.hash('customer123', 12);

  const existingCustomer = db.prepare('SELECT id FROM users WHERE email = ?').get(customerEmail);
  if (!existingCustomer) {
    db.prepare(`
      INSERT INTO users (id, email, name, password, phone, role, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(customerId, customerEmail, 'Nguyễn Văn A', customerPassword, '0912345678', 'CUSTOMER', now(), now());
    console.log(`✅ Khách hàng: ${customerEmail}`);
  } else {
    console.log(`ℹ️  Khách hàng đã tồn tại`);
  }

  // ============ 3. TẠO DANH MỤC ============
  const categories = [
    { name: 'Rau lá xanh', description: 'Rau cải, rau muống, rau lang...', sortOrder: 1 },
    { name: 'Củ quả', description: 'Cà rốt, khoai tây, củ cải...', sortOrder: 2 },
    { name: 'Trái cây', description: 'Dưa hấu, xoài, ổi, chuối...', sortOrder: 3 },
    { name: 'Rau thơm gia vị', description: 'Hành, tỏi, ớt, sả, gừng...', sortOrder: 4 },
    { name: 'Nấm các loại', description: 'Nấm rơm, nấm kim châm, nấm đông cô...', sortOrder: 5 },
    { name: 'Rau mầm & Hữu cơ', description: 'Giá đỗ, rau mầm, rau hữu cơ...', sortOrder: 6 },
  ];

  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const slug = createSlug(cat.name);
    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
    if (!existing) {
      const catId = uuidv4();
      db.prepare(`
        INSERT INTO categories (id, name, slug, description, sortOrder, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?)
      `).run(catId, cat.name, slug, cat.description, cat.sortOrder, now(), now());
      catMap[cat.name] = catId;
      console.log(`✅ Danh mục: ${cat.name}`);
    } else {
      catMap[cat.name] = (existing as any).id;
      console.log(`ℹ️  Danh mục đã tồn tại: ${cat.name}`);
    }
  }

  // ============ 4. TẠO SẢN PHẨM ============
  const products = [
    // Rau lá xanh
    { name: 'Cải bắp trắng', price: 12000, priceWhole: 10000, unit: 'kg', stock: 50, categoryName: 'Rau lá xanh', isFeatured: 1, description: 'Cải bắp trắng tươi sạch, giàu vitamin C và chất xơ.' },
    { name: 'Cải xanh', price: 15000, priceWhole: 12000, unit: 'bó', stock: 30, categoryName: 'Rau lá xanh', description: 'Cải xanh tươi, giàu canxi và vitamin.' },
    { name: 'Rau muống', price: 10000, priceWhole: 8000, unit: 'bó', stock: 40, categoryName: 'Rau lá xanh', isFeatured: 1, description: 'Rau muống tươi xanh, giàu chất sắt và vitamin K.' },
    { name: 'Cải thảo', price: 18000, priceWhole: 15000, unit: 'kg', stock: 25, categoryName: 'Rau lá xanh', description: 'Cải thảo tươi, dùng cho lẩu, canh, kim chi.' },
    { name: 'Xà lách', price: 20000, priceWhole: 16000, unit: 'bó', stock: 20, categoryName: 'Rau lá xanh', description: 'Xà lách sạch, giòn ngọt, phù hợp làm salad.' },
    { name: 'Rau lang', price: 12000, priceWhole: 10000, unit: 'bó', stock: 35, categoryName: 'Rau lá xanh', description: 'Rau lang non mềm, nhiều chất xơ và vitamin.' },
    // Củ quả
    { name: 'Cà rốt', price: 20000, priceWhole: 16000, unit: 'kg', stock: 60, categoryName: 'Củ quả', isFeatured: 1, description: 'Cà rốt tươi ngọt, giàu beta-carotene tốt cho mắt.' },
    { name: 'Khoai tây', price: 25000, priceWhole: 20000, unit: 'kg', stock: 80, categoryName: 'Củ quả', description: 'Khoai tây sạch, thích hợp xào, luộc, chiên.' },
    { name: 'Củ cải trắng', price: 15000, priceWhole: 12000, unit: 'kg', stock: 40, categoryName: 'Củ quả', isFeatured: 1, description: 'Củ cải trắng tươi, dùng nấu canh, kho, muối dưa.' },
    { name: 'Cà tím', price: 22000, priceWhole: 18000, unit: 'kg', stock: 30, categoryName: 'Củ quả', description: 'Cà tím tươi, dùng nướng, xào, hấp.' },
    { name: 'Bí đao', price: 12000, priceWhole: 10000, unit: 'kg', stock: 50, categoryName: 'Củ quả', description: 'Bí đao tươi, mát bổ, tốt cho thận.' },
    { name: 'Khổ qua', price: 18000, priceWhole: 15000, unit: 'kg', stock: 25, categoryName: 'Củ quả', description: 'Mướp đắng tươi, thanh nhiệt giải độc.' },
    // Rau thơm gia vị
    { name: 'Hành lá', price: 8000, priceWhole: 6000, unit: 'bó', stock: 100, categoryName: 'Rau thơm gia vị', isFeatured: 1, description: 'Hành lá xanh tươi, thơm ngon.' },
    { name: 'Tỏi tươi', price: 35000, priceWhole: 30000, unit: 'kg', stock: 30, categoryName: 'Rau thơm gia vị', description: 'Tỏi tươi thơm, kháng khuẩn tự nhiên.' },
    { name: 'Ớt đỏ', price: 30000, priceWhole: 25000, unit: 'kg', stock: 20, categoryName: 'Rau thơm gia vị', description: 'Ớt đỏ tươi, cay thơm.' },
    { name: 'Gừng tươi', price: 40000, priceWhole: 35000, unit: 'kg', stock: 15, categoryName: 'Rau thơm gia vị', description: 'Gừng tươi thơm, ấm bụng, tăng đề kháng.' },
    { name: 'Sả tươi', price: 15000, priceWhole: 12000, unit: 'bó', stock: 40, categoryName: 'Rau thơm gia vị', description: 'Sả tươi thơm, dùng nấu canh, lẩu.' },
    // Nấm
    { name: 'Nấm rơm', price: 55000, priceWhole: 45000, unit: 'kg', stock: 15, categoryName: 'Nấm các loại', isFeatured: 1, description: 'Nấm rơm tươi giòn ngon, giàu đạm thực vật.' },
    { name: 'Nấm kim châm', price: 25000, priceWhole: 20000, unit: 'gói', stock: 30, categoryName: 'Nấm các loại', description: 'Nấm kim châm tươi, giòn, nhiều dinh dưỡng.' },
    { name: 'Nấm đông cô tươi', price: 80000, priceWhole: 70000, unit: 'kg', stock: 10, categoryName: 'Nấm các loại', description: 'Nấm đông cô tươi thơm, tốt cho miễn dịch.' },
    // Trái cây
    { name: 'Chuối già hương', price: 30000, priceWhole: 25000, unit: 'nải', stock: 20, categoryName: 'Trái cây', description: 'Chuối già hương ngọt thơm, chín vàng tự nhiên.' },
    { name: 'Ổi lê xanh', price: 35000, priceWhole: 30000, unit: 'kg', stock: 15, categoryName: 'Trái cây', description: 'Ổi lê xanh giòn ngọt, nhiều vitamin C.' },
    // Rau mầm
    { name: 'Giá đỗ xanh', price: 12000, priceWhole: 10000, unit: 'túi', stock: 50, categoryName: 'Rau mầm & Hữu cơ', isFeatured: 1, description: 'Giá đỗ xanh trắng giòn sạch, 300g/túi.' },
    { name: 'Rau mầm hướng dương', price: 35000, priceWhole: 30000, unit: 'hộp', stock: 10, categoryName: 'Rau mầm & Hữu cơ', description: 'Rau mầm hướng dương hữu cơ, giàu dinh dưỡng.' },
  ];

  const productIds: string[] = [];
  for (const prod of products) {
    const slug = createSlug(prod.name);
    const nameSearch = removeVietnameseTones(prod.name);
    const categoryId = catMap[prod.categoryName];

    const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(slug);
    if (!existing) {
      const productId = uuidv4();
      db.prepare(`
        INSERT INTO products (id, name, nameSearch, slug, description, price, priceWhole, unit, stock, categoryId, isActive, isFeatured, sortOrder, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 0, ?, ?)
      `).run(productId, prod.name, nameSearch, slug, prod.description || '', prod.price, prod.priceWhole || null, prod.unit, prod.stock, categoryId, (prod as any).isFeatured || 0, now(), now());

      // Thêm ảnh placeholder
      db.prepare(`
        INSERT INTO product_images (id, url, sortOrder, createdAt, productId)
        VALUES (?, ?, 0, ?, ?)
      `).run(uuidv4(), `/images/products/${slug}.jpg`, now(), productId);

      productIds.push(productId);
      console.log(`✅ Sản phẩm: ${prod.name}`);
    } else {
      productIds.push((existing as any).id);
      console.log(`ℹ️  Sản phẩm đã tồn tại: ${prod.name}`);
    }
  }

  // ============ 5. TẠO ĐƠN HÀNG MẪU ============
  const orderNumber = `ORD-20260527-${Math.floor(Math.random() * 9000 + 1000)}`;
  const orderId = uuidv4();
  const finalCustomerId = (db.prepare('SELECT id FROM users WHERE email = ?').get(customerEmail) as any)?.id;

  db.prepare(`
    INSERT INTO orders (id, orderNumber, customerName, phone, address, note, deliveryDate, deliveryTime, status, totalAmount, discountAmount, userId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
  `).run(
    orderId, orderNumber, 'Nguyễn Thị Hoa', '0987654321',
    '123 Đường Trần Phú, Phan Thiết, Bình Thuận',
    'Giao buổi sáng trước 10h', '2026-05-28', '08:00-10:00',
    'PENDING', 85000, finalCustomerId, now(), now()
  );

  // Thêm items cho đơn
  for (let i = 0; i < Math.min(3, productIds.length); i++) {
    const product = db.prepare('SELECT price FROM products WHERE id = ?').get(productIds[i]) as any;
    db.prepare(`
      INSERT INTO order_items (id, quantity, price, orderId, productId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), i + 1, product?.price || 15000, orderId, productIds[i], now());
  }
  console.log(`✅ Đơn hàng mẫu: ${orderNumber}`);

  db.close();

  console.log('\n🎉 Seed hoàn tất!');
  console.log('📧 Admin: admin@raucuphanthiet.vn / admin123456');
  console.log('📧 Customer: customer@example.com / customer123');
}

main().catch(console.error);
