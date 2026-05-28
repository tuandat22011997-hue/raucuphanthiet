"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeVietnameseTones = removeVietnameseTones;
exports.createSlug = createSlug;
exports.generateOrderNumber = generateOrderNumber;
exports.formatCurrency = formatCurrency;
exports.formatDate = formatDate;
exports.generateExcelFileName = generateExcelFileName;
exports.normalizeSearchQuery = normalizeSearchQuery;
const slugify_1 = __importDefault(require("slugify"));
function removeVietnameseTones(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .toLowerCase()
        .trim();
}
function createSlug(text, suffix) {
    const base = (0, slugify_1.default)(text, {
        locale: 'vi',
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
    });
    return suffix ? `${base}-${suffix}` : base;
}
function generateOrderNumber() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 9000 + 1000);
    return `ORD-${dateStr}-${random}`;
}
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}
function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}
function generateExcelFileName(customerName, date = new Date()) {
    const cleanName = removeVietnameseTones(customerName)
        .replace(/[^a-z0-9]/gi, '')
        .toUpperCase();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${cleanName}_${day}${month}${year}.xlsx`;
}
function normalizeSearchQuery(query) {
    return removeVietnameseTones(query)
        .replace(/\s+/g, ' ')
        .trim();
}
//# sourceMappingURL=helpers.util.js.map