'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserCircle, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCustomersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Fetch customers
  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: () => {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      return usersApi.getCustomers(params);
    },
  });

  const customers = res?.data?.data || [];
  const meta = res?.data?.meta || { totalPages: 1 };

  // Delete customer
  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success('Xóa khách hàng thành công');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa khách hàng');
    }
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Danh sách Khách hàng</h1>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm tên, email, hoặc số điện thoại..."
              className="pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset page on search
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : customers.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">Khách hàng</th>
                      <th className="px-6 py-4">Liên hệ</th>
                      <th className="px-6 py-4 text-center">Ngày đăng ký</th>
                      <th className="px-6 py-4 text-center">Tổng đơn</th>
                      <th className="px-6 py-4 text-right">Tổng chi tiêu</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customers.map((customer: any) => (
                      <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold uppercase">
                              {customer.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{customer.name || 'Người dùng'}</div>
                              {!customer.isActive && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Khóa</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">{customer.phone || 'Chưa cập nhật'}</div>
                          <div className="text-xs text-gray-500">{customer.email}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600">
                          {formatDate(customer.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 font-medium text-gray-900">
                            <ShoppingBag size={14} className="text-gray-400" />
                            {customer.totalOrders || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-green-600">
                          {formatCurrency(customer.totalSpent || 0)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" 
                            title="Xóa khách hàng"
                            onClick={() => handleDelete(customer.id, customer.name)}
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
                {customers.map((customer: any) => (
                  <div key={customer.id} className="bg-white border rounded-lg p-4 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold uppercase flex-shrink-0">
                        {customer.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-base truncate flex items-center gap-2">
                          {customer.name || 'Người dùng'}
                          {!customer.isActive && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Khóa</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5 truncate">{customer.phone || 'Chưa cập nhật SĐT'}</div>
                        <div className="text-xs text-gray-400 mt-0.5 truncate">{customer.email}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded-md">
                      <div>
                        <div className="text-gray-500 text-xs flex items-center gap-1">
                          <ShoppingBag size={12} /> Tổng đơn
                        </div>
                        <div className="font-bold text-gray-900 mt-0.5">{customer.totalOrders || 0}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Tổng chi tiêu</div>
                        <div className="font-bold text-green-600 mt-0.5">{formatCurrency(customer.totalSpent || 0)}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-xs text-gray-500">
                        Ngày tạo: {formatDate(customer.createdAt)}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50" 
                        onClick={() => handleDelete(customer.id, customer.name)}
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
            <div className="text-center py-12 text-gray-500 flex flex-col items-center">
              <UserCircle size={48} className="text-gray-300 mb-4" />
              <p>Không tìm thấy khách hàng nào.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
