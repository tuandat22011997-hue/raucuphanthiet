"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function removeVietnameseTones(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .toLowerCase()
        .trim();
}
function createSlug(text) {
    return removeVietnameseTones(text)
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}
async function main() {
    console.log('Seeding PostgreSQL data...');
    const adminPassword = await bcrypt.hash('admin123456', 12);
    const customerPassword = await bcrypt.hash('customer123', 12);
    await prisma.user.upsert({
        where: { email: 'admin@raucuphanthiet.vn' },
        update: {},
        create: {
            email: 'admin@raucuphanthiet.vn',
            name: 'Quan Tri Vien',
            password: adminPassword,
            phone: '0901234567',
            role: 'ADMIN',
            isActive: true,
        },
    });
    const customer = await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: {},
        create: {
            email: 'customer@example.com',
            name: 'Nguyen Van A',
            password: customerPassword,
            phone: '0912345678',
            role: 'CUSTOMER',
            isActive: true,
        },
    });
    const categories = [
        { name: 'Rau la xanh', description: 'Rau cai, rau muong, rau lang...', sortOrder: 1 },
        { name: 'Cu qua', description: 'Ca rot, khoai tay, cu cai...', sortOrder: 2 },
        { name: 'Trai cay', description: 'Dua hau, xoai, oi, chuoi...', sortOrder: 3 },
        { name: 'Rau thom gia vi', description: 'Hanh, toi, ot, sa, gung...', sortOrder: 4 },
        { name: 'Nam cac loai', description: 'Nam rom, nam kim cham, nam dong co...', sortOrder: 5 },
        { name: 'Rau mam va huu co', description: 'Gia do, rau mam, rau huu co...', sortOrder: 6 },
    ];
    const categoryMap = new Map();
    for (const category of categories) {
        const record = await prisma.category.upsert({
            where: { slug: createSlug(category.name) },
            update: {},
            create: {
                name: category.name,
                slug: createSlug(category.name),
                description: category.description,
                sortOrder: category.sortOrder,
                isActive: true,
            },
        });
        categoryMap.set(category.name, record.id);
    }
    const products = [
        { name: 'Cai bap trang', price: 12000, priceWhole: 10000, unit: 'kg', stock: 50, categoryName: 'Rau la xanh', isFeatured: true, description: 'Rau tuoi sach, giau chat xo.' },
        { name: 'Rau muong', price: 10000, priceWhole: 8000, unit: 'bo', stock: 40, categoryName: 'Rau la xanh', isFeatured: true, description: 'Rau xanh tuoi ngon.' },
        { name: 'Ca rot', price: 20000, priceWhole: 16000, unit: 'kg', stock: 60, categoryName: 'Cu qua', isFeatured: true, description: 'Ca rot tuoi ngot.' },
        { name: 'Khoai tay', price: 25000, priceWhole: 20000, unit: 'kg', stock: 80, categoryName: 'Cu qua', description: 'Khoai tay sach.' },
        { name: 'Hanh la', price: 8000, priceWhole: 6000, unit: 'bo', stock: 100, categoryName: 'Rau thom gia vi', isFeatured: true, description: 'Hanh la tuoi xanh.' },
        { name: 'Nam rom', price: 55000, priceWhole: 45000, unit: 'kg', stock: 15, categoryName: 'Nam cac loai', isFeatured: true, description: 'Nam rom tuoi gion ngon.' },
        { name: 'Chuoi gia huong', price: 30000, priceWhole: 25000, unit: 'nai', stock: 20, categoryName: 'Trai cay', description: 'Chuoi chin tu nhien.' },
        { name: 'Gia do xanh', price: 12000, priceWhole: 10000, unit: 'tui', stock: 50, categoryName: 'Rau mam va huu co', isFeatured: true, description: 'Gia do sach 300g/tui.' },
    ];
    const productRecords = [];
    for (const product of products) {
        const slug = createSlug(product.name);
        const record = await prisma.product.upsert({
            where: { slug },
            update: {},
            create: {
                name: product.name,
                nameSearch: removeVietnameseTones(product.name),
                slug,
                description: product.description,
                price: product.price,
                priceWhole: product.priceWhole,
                unit: product.unit,
                stock: product.stock,
                isActive: true,
                isFeatured: product.isFeatured ?? false,
                sortOrder: 0,
                categoryId: categoryMap.get(product.categoryName),
                images: {
                    create: [
                        {
                            url: '/images/placeholder-product.jpg',
                            sortOrder: 0,
                        },
                    ],
                },
            },
            include: { images: true },
        });
        productRecords.push({ id: record.id, price: record.price });
    }
    const existingOrder = await prisma.order.findFirst({
        where: { orderNumber: 'ORD-DEMO-0001' },
    });
    if (!existingOrder) {
        await prisma.order.create({
            data: {
                orderNumber: 'ORD-DEMO-0001',
                customerName: 'Nguyen Thi Hoa',
                phone: '0987654321',
                address: '123 Tran Phu, Phan Thiet, Binh Thuan',
                note: 'Giao buoi sang truoc 10h',
                deliveryDate: '2026-05-28',
                deliveryTime: '08:00-10:00',
                status: 'PENDING',
                totalAmount: 85000,
                discountAmount: 0,
                userId: customer.id,
                items: {
                    create: productRecords.slice(0, 3).map((product, index) => ({
                        quantity: index + 1,
                        price: product.price,
                        productId: product.id,
                    })),
                },
            },
        });
    }
    console.log('Seed completed.');
    console.log('Admin: admin@raucuphanthiet.vn / admin123456');
    console.log('Customer: customer@example.com / customer123');
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map