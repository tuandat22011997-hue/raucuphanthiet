'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { formatCurrency, formatDateTime, ORDER_STATUS_MAP, ORDER_STATUS_COLOR } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, FileDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Fetch orders
  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-orders', page, search, statusFilter, dateFrom, dateTo],
    queryFn: () => {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      return ordersApi.getAll(params);
    },
  });

  const orders = res?.data?.data || [];
  const meta = res?.data?.meta || { totalPages: 1 };

  // Delete order
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ordersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Xóa đơn hàng thành công');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa đơn hàng');
    }
  });

  const handleDelete = (id: string, code: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng "${code}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi khi cập nhật trạng thái');
    }
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleExport = async (orderId: string, orderNumber: string) => {
    try {
      const response = await ordersApi.exportSingle(orderId);
      const url = window.URL.createObjectURL(new Blob([response.data as any]));
      const link = document.createElement('a');
      link.href = url;
      let filename = `DonHang_${orderNumber}.xlsx`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
        if (utf8Match) {
          filename = decodeURIComponent(utf8Match[1]);
        } else {
          const match = contentDisposition.match(/filename="?([^"]+)"?/i);
          if (match) filename = match[1];
        }
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Xuất file thành công');
    } catch (error) {
      toast.error('Lỗi khi xuất file Excel');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm mã đơn, tên, SĐT..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'ALL')}>
                <SelectTrigger>
                  <span className="flex-1 text-left truncate">
                    {statusFilter === 'ALL' ? 'Tất cả trạng thái' : (ORDER_STATUS_MAP[statusFilter] || statusFilter)}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  {Object.entries(ORDER_STATUS_MAP).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <Input 
                type="date" 
                value={dateFrom} 
                onChange={(e) => setDateFrom(e.target.value)} 
                title="Từ ngày"
                className="w-full md:w-36"
              />
              <Input 
                type="date" 
                value={dateTo} 
                onChange={(e) => setDateTo(e.target.value)} 
                title="Đến ngày"
                className="w-full md:w-36"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 h-16 rounded-lg"></div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block relative overflow-x-auto rounded-lg border">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4">Mã đơn</th>
                      <th className="px-6 py-4">Khách hàng / SĐT</th>
                      <th className="px-6 py-4">Tổng tiền</th>
                      <th className="px-6 py-4 text-center">Trạng thái</th>
                      <th className="px-6 py-4">Ngày tạo</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: any) => (
                      <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{order.customerName}</div>
                          <div className="text-gray-500">{order.phone}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-green-600">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4">
                          <Select 
                            value={order.status} 
                            onValueChange={(val) => handleStatusChange(order.id, val)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <SelectTrigger className={`h-8 text-xs font-medium w-[140px] mx-auto ${ORDER_STATUS_COLOR[order.status] || 'bg-gray-100'}`}>
                              <span className="flex-1 text-center truncate">
                                {ORDER_STATUS_MAP[order.status] || order.status}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ORDER_STATUS_MAP).map(([key, value]) => (
                                <SelectItem key={key} value={key} className="text-xs">{value}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-6 py-4">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button variant="outline" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" asChild title="Xem chi tiết">
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye size={16} />
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                            title="Xuất Excel"
                            onClick={() => handleExport(order.id, order.orderNumber)}
                          >
                            <FileDown size={16} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" 
                            title="Xóa đơn hàng"
                            onClick={() => handleDelete(order.id, order.orderNumber)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-white border rounded-lg p-4 space-y-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-900">{order.orderNumber}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{formatDateTime(order.createdAt)}</div>
                      </div>
                      <div className="font-bold text-green-600 text-lg">
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      <div className="font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-gray-600 mt-1 flex items-center gap-2">
                        📞 {order.phone}
                      </div>
                    </div>
                    
                    <div>
                      <Select 
                        value={order.status} 
                        onValueChange={(val) => handleStatusChange(order.id, val)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className={`h-9 text-xs font-medium w-full ${ORDER_STATUS_COLOR[order.status] || 'bg-gray-100'}`}>
                          <span className="flex-1 text-center truncate">
                            {ORDER_STATUS_MAP[order.status] || order.status}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ORDER_STATUS_MAP).map(([key, value]) => (
                            <SelectItem key={key} value={key} className="text-xs">{value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50" asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye size={14} className="mr-1" /> Xem
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                        onClick={() => handleExport(order.id, order.orderNumber)}
                      >
                        <FileDown size={14} className="mr-1" /> Excel
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50" 
                        onClick={() => handleDelete(order.id, order.orderNumber)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={14} className="mr-1" /> Xóa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Phân trang */}
              {meta.totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Trước
                  </Button>
                  <div className="flex items-center px-4 text-sm text-gray-500 font-medium">
                    Trang {page} / {meta.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Không tìm thấy đơn hàng nào.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
