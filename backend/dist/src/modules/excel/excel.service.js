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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.ExcelService = void 0;
const common_1 = require("@nestjs/common");
const ExcelJS = __importStar(require("exceljs"));
const helpers_util_1 = require("../../common/utils/helpers.util");
const STATUS_MAP = {
    PENDING: 'Chờ xác nhận',
    PREPARING: 'Đang chuẩn bị',
    DELIVERING: 'Đang giao',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
};
let ExcelService = class ExcelService {
    async exportSingleOrder(order) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Rau Củ Phan Thiết';
        workbook.created = new Date();
        const sheet = workbook.addWorksheet('Đơn hàng', {
            pageSetup: { paperSize: 9, orientation: 'portrait' },
        });
        this.buildOrderSheet(sheet, order);
        const buffer = await workbook.xlsx.writeBuffer();
        const filename = (0, helpers_util_1.generateExcelFileName)(order.customerName, new Date(order.createdAt));
        return { buffer: Buffer.from(buffer), filename };
    }
    async exportMultipleOrders(orders) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Rau Củ Phan Thiết';
        workbook.created = new Date();
        for (const order of orders) {
            const sheetName = `${order.orderNumber}`.slice(0, 31);
            const sheet = workbook.addWorksheet(sheetName);
            this.buildOrderSheet(sheet, order);
        }
        const buffer = await workbook.xlsx.writeBuffer();
        const filename = `DanhSachDonHang_${(0, helpers_util_1.formatDate)(new Date()).replace(/\//g, '-')}.xlsx`;
        return { buffer: Buffer.from(buffer), filename };
    }
    buildOrderSheet(sheet, order) {
        const headerStyle = {
            font: { bold: true, size: 14, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } },
            alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
            border: {
                top: { style: 'thin' }, bottom: { style: 'thin' },
                left: { style: 'thin' }, right: { style: 'thin' },
            },
        };
        const titleStyle = {
            font: { bold: true, size: 18, color: { argb: 'FF16A34A' } },
            alignment: { horizontal: 'center', vertical: 'middle' },
        };
        const infoLabelStyle = {
            font: { bold: true, size: 12 },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } },
            border: {
                top: { style: 'thin', color: { argb: 'FFD1FAE5' } },
                bottom: { style: 'thin', color: { argb: 'FFD1FAE5' } },
                left: { style: 'thin', color: { argb: 'FFD1FAE5' } },
                right: { style: 'thin', color: { argb: 'FFD1FAE5' } },
            },
            alignment: { vertical: 'middle' },
        };
        const infoValueStyle = {
            font: { size: 12 },
            border: {
                top: { style: 'thin', color: { argb: 'FFD1FAE5' } },
                bottom: { style: 'thin', color: { argb: 'FFD1FAE5' } },
                left: { style: 'thin', color: { argb: 'FFD1FAE5' } },
                right: { style: 'thin', color: { argb: 'FFD1FAE5' } },
            },
            alignment: { vertical: 'middle' },
        };
        const cellBorder = {
            font: { size: 12 },
            border: {
                top: { style: 'thin' }, bottom: { style: 'thin' },
                left: { style: 'thin' }, right: { style: 'thin' },
            },
            alignment: { vertical: 'middle', wrapText: true },
        };
        const totalStyle = {
            font: { bold: true, size: 13, color: { argb: 'FF15803D' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } },
            alignment: { horizontal: 'right', vertical: 'middle' },
            border: {
                top: { style: 'medium', color: { argb: 'FF16A34A' } },
                bottom: { style: 'medium', color: { argb: 'FF16A34A' } },
                left: { style: 'thin' }, right: { style: 'thin' },
            },
        };
        sheet.columns = [
            { key: 'stt', width: 6 },
            { key: 'name', width: 35 },
            { key: 'unit', width: 10 },
            { key: 'qty', width: 12 },
            { key: 'note', width: 27 },
        ];
        sheet.mergeCells('A1:E1');
        const titleCell = sheet.getCell('A1');
        titleCell.value = '🥬 RAU CỦ PHAN THIẾT - ĐƠN HÀNG';
        titleCell.style = titleStyle;
        sheet.getRow(1).height = 40;
        let rowIdx = 2;
        sheet.mergeCells(`A${rowIdx}:E${rowIdx}`);
        const custTitle = sheet.getCell(`A${rowIdx}`);
        custTitle.value = 'THÔNG TIN KHÁCH HÀNG & ĐƠN HÀNG';
        custTitle.style = {
            font: { bold: true, size: 13, color: { argb: 'FF15803D' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBBF7D0' } },
            alignment: { horizontal: 'left', vertical: 'middle' },
        };
        sheet.getRow(rowIdx).height = 30;
        rowIdx++;
        const customerInfo = [
            ['Họ và tên:', order.customerName],
            ['Số điện thoại:', order.phone],
            ['Địa chỉ giao:', order.address],
            ['Ghi chú đơn:', order.note || '—'],
            ['Ngày đặt - giao:', `${(0, helpers_util_1.formatDate)(new Date(order.createdAt))} - ${order.deliveryDate ? (0, helpers_util_1.formatDate)(order.deliveryDate) + ' | ' + (order.deliveryTime || '') : '—'}`],
        ];
        for (const [label, value] of customerInfo) {
            sheet.mergeCells(`A${rowIdx}:B${rowIdx}`);
            sheet.mergeCells(`C${rowIdx}:E${rowIdx}`);
            const labelCell = sheet.getCell(`A${rowIdx}`);
            const valueCell = sheet.getCell(`C${rowIdx}`);
            labelCell.value = label;
            labelCell.style = infoLabelStyle;
            valueCell.value = value;
            valueCell.style = infoValueStyle;
            sheet.getRow(rowIdx).height = 25;
            rowIdx++;
        }
        rowIdx++;
        const headerRow = sheet.getRow(rowIdx);
        headerRow.values = ['STT', 'Sản phẩm', 'Đơn vị', 'Số lượng', 'Ghi chú'];
        headerRow.height = 30;
        ['A', 'B', 'C', 'D', 'E'].forEach((col) => {
            sheet.getCell(`${col}${rowIdx}`).style = headerStyle;
        });
        rowIdx++;
        order.items.forEach((item, index) => {
            const row = sheet.getRow(rowIdx);
            row.values = [
                index + 1,
                item.product?.name || '—',
                item.product?.unit || '—',
                item.quantity,
                item.note || '',
            ];
            row.height = 28;
            const rowCells = ['A', 'B', 'C', 'D', 'E'];
            rowCells.forEach((col) => {
                const cell = sheet.getCell(`${col}${rowIdx}`);
                cell.style = {
                    ...cellBorder,
                    fill: {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: index % 2 === 0 ? 'FFFFFFFF' : 'FFF9FAFB' },
                    },
                };
                if (col === 'D') {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    cell.numFmt = '0';
                }
                if (col === 'A')
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
            });
            rowIdx++;
        });
        sheet.getRow(rowIdx).height = 25;
        rowIdx += 2;
        sheet.mergeCells(`A${rowIdx}:E${rowIdx}`);
        sheet.getCell(`A${rowIdx}`).value = 'Cảm ơn quý khách đã tin tưởng Rau Củ Phan Thiết! 🙏';
        sheet.getCell(`A${rowIdx}`).style = {
            font: { italic: true, color: { argb: 'FF6B7280' }, size: 10 },
            alignment: { horizontal: 'center' },
        };
    }
};
exports.ExcelService = ExcelService;
exports.ExcelService = ExcelService = __decorate([
    (0, common_1.Injectable)()
], ExcelService);
//# sourceMappingURL=excel.service.js.map