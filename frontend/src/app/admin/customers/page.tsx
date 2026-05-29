'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Search, ShoppingBag, Trash2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

import { usersApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function AdminCustomersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    isActive: true,
  });

  type UpdateCustomerPayload = {
    name: string;
    email: string;
    phone: string;
    password?: string;
    isActive: boolean;
  };

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

  useEffect(() => {
    if (!selectedCustomer) return;
    setFormData({
      name: selectedCustomer.name || '',
      email: selectedCustomer.email || '',
      phone: selectedCustomer.phone || '',
      password: '',
      isActive: selectedCustomer.isActive,
    });
  }, [selectedCustomer]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success('Xóa khách hàng thành công');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa khách hàng');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: UpdateCustomerPayload }) =>
      usersApi.updateCustomer(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success('Cập nhật khách hàng thành công');
      setSelectedCustomer(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật khách hàng');
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    updateMutation.mutate({
      id: selectedCustomer.id,
      payload: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        ...(formData.password.trim() ? { password: formData.password } : {}),
        isActive: formData.isActive,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Danh sách khách hàng</h1>
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
                setPage(1);
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-gray-500">Đang tải dữ liệu...</div>
          ) : customers.length > 0 ? (
            <>
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
                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">
                                  Khóa
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">{customer.phone || 'Chưa cập nhật'}</div>
                          <div className="text-xs text-gray-500">{customer.email}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600">{formatDate(customer.createdAt)}</td>
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
                          <div className="inline-flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Sửa khách hàng"
                              onClick={() => handleEdit(customer)}
                            >
                              <Edit size={16} />
                            </Button>
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">
                              Khóa
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5 truncate">
                          {customer.phone || 'Chưa cập nhật SĐT'}
                        </div>
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
                        <div className="font-bold text-green-600 mt-0.5">
                          {formatCurrency(customer.totalSpent || 0)}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-xs text-gray-500">Ngày tạo: {formatDate(customer.createdAt)}</div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit size={14} className="mr-1" /> Sửa
                        </Button>
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
                  </div>
                ))}
              </div>

              {meta.totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
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
                    onClick={() => setPage((p) => p + 1)}
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

      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa khách hàng</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Họ và tên</Label>
              <Input
                id="customer-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-phone">Số điện thoại</Label>
              <Input
                id="customer-phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-password">Mật khẩu mới</Label>
              <Input
                id="customer-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Để trống nếu không đổi"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
              />
              <span className="text-sm font-medium">Cho phép đăng nhập</span>
            </label>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setSelectedCustomer(null)}>
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
