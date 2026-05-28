import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { generateExcelFileName, formatCurrency, formatDate } from '../../common/utils/helpers.util';

const STATUS_MAP: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  PREPARING: 'Đang chuẩn bị',
  DELIVERING: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

@Injectable()
export class ExcelService {
  /**
   * Xuất Excel cho 1 đơn hàng
   * Format file: TenKhachHang_DD-MM-YYYY.xlsx
   */
  async exportSingleOrder(order: any): Promise<{ buffer: Buffer; filename: string }> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Rau Củ Phan Thiết';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Đơn hàng', {
      pageSetup: { paperSize: 9, orientation: 'portrait' },
    });

    this.buildOrderSheet(sheet, order);

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = generateExcelFileName(order.customerName, new Date(order.createdAt));

    return { buffer: Buffer.from(buffer), filename };
  }

  /**
   * Xuất Excel nhiều đơn hàng (mỗi đơn 1 sheet)
   */
  async exportMultipleOrders(orders: any[]): Promise<{ buffer: Buffer; filename: string }> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Rau Củ Phan Thiết';
    workbook.created = new Date();

    for (const order of orders) {
      const sheetName = `${order.orderNumber}`.slice(0, 31); // Excel giới hạn 31 ký tự
      const sheet = workbook.addWorksheet(sheetName);
      this.buildOrderSheet(sheet, order);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `DanhSachDonHang_${formatDate(new Date()).replace(/\//g, '-')}.xlsx`;

    return { buffer: Buffer.from(buffer), filename };
  }

  /** Xây dựng nội dung sheet cho 1 đơn hàng */
  private buildOrderSheet(sheet: ExcelJS.Worksheet, order: any) {
    // ============ STYLES ============
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 14, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }, // Xanh lá
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      },
    };

    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 18, color: { argb: 'FF16A34A' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
    };

    const infoLabelStyle: Partial<ExcelJS.Style> = {
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

    const infoValueStyle: Partial<ExcelJS.Style> = {
      font: { size: 12 },
      border: {
        top: { style: 'thin', color: { argb: 'FFD1FAE5' } },
        bottom: { style: 'thin', color: { argb: 'FFD1FAE5' } },
        left: { style: 'thin', color: { argb: 'FFD1FAE5' } },
        right: { style: 'thin', color: { argb: 'FFD1FAE5' } },
      },
      alignment: { vertical: 'middle' },
    };

    const cellBorder: Partial<ExcelJS.Style> = {
      font: { size: 12 },
      border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      },
      alignment: { vertical: 'middle', wrapText: true },
    };

    const totalStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 13, color: { argb: 'FF15803D' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } },
      alignment: { horizontal: 'right', vertical: 'middle' },
      border: {
        top: { style: 'medium', color: { argb: 'FF16A34A' } },
        bottom: { style: 'medium', color: { argb: 'FF16A34A' } },
        left: { style: 'thin' }, right: { style: 'thin' },
      },
    };

    // ============ CỘT ============
    sheet.columns = [
      { key: 'stt',      width: 6 },
      { key: 'name',     width: 35 },
      { key: 'unit',     width: 10 },
      { key: 'qty',      width: 12 },
      { key: 'note',     width: 27 },
    ];

    // ============ TIÊU ĐỀ ============
    sheet.mergeCells('A1:E1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = '🥬 RAU CỦ PHAN THIẾT - ĐƠN HÀNG';
    titleCell.style = titleStyle;
    sheet.getRow(1).height = 40;

    // ============ THÔNG TIN KHÁCH HÀNG ============
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
      ['Ngày đặt - giao:', `${formatDate(new Date(order.createdAt))} - ${order.deliveryDate ? formatDate(order.deliveryDate) + ' | ' + (order.deliveryTime || '') : '—'}`],
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

    // ============ BẢNG SẢN PHẨM ============
    rowIdx++;
    const headerRow = sheet.getRow(rowIdx);
    headerRow.values = ['STT', 'Sản phẩm', 'Đơn vị', 'Số lượng', 'Ghi chú'];
    headerRow.height = 30;
    ['A', 'B', 'C', 'D', 'E'].forEach((col) => {
      sheet.getCell(`${col}${rowIdx}`).style = headerStyle;
    });
    rowIdx++;

    // Dòng sản phẩm
    order.items.forEach((item: any, index: number) => {
      const row = sheet.getRow(rowIdx);
      row.values = [
        index + 1,
        item.product?.name || '—',
        item.product?.unit || '—',
        item.quantity,
        item.note || '',
      ];
      row.height = 28;

      // Style từng cell
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
        if (col === 'A') cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      rowIdx++;
    });

    sheet.getRow(rowIdx).height = 25;

    // ============ FOOTER ============
    rowIdx += 2;
    sheet.mergeCells(`A${rowIdx}:E${rowIdx}`);
    sheet.getCell(`A${rowIdx}`).value = 'Cảm ơn quý khách đã tin tưởng Rau Củ Phan Thiết! 🙏';
    sheet.getCell(`A${rowIdx}`).style = {
      font: { italic: true, color: { argb: 'FF6B7280' }, size: 10 },
      alignment: { horizontal: 'center' },
    };
  }
}
