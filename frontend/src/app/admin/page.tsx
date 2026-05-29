'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { formatCurrency, ORDER_STATUS_MAP, ORDER_STATUS_COLOR } from '@/lib/utils';
import { ShoppingCart, DollarSign, Package, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboardPage() {
  const { data: statsRes, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => ordersApi.getDashboardStats(),
    retry: 1,
  });

  const stats = statsRes?.data || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    recentOrders: []
  };

  const statCards = [
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Tổng đơn hàng',
      value: (stats.totalOrders || 0).toString(),
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Đơn chờ xử lý',
      value: (stats.pendingOrders || 0).toString(),
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Tổng khách hàng',
      value: (stats.totalCustomers || 0).toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  if (isLoading) {
    return <div className="animate-pulse flex gap-4">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Không tải được dữ liệu dashboard. Hãy kiểm tra backend local đang chạy và bạn đã đăng nhập bằng tài khoản admin.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${card.bgColor} ${card.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders?.length > 0 ? (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 rounded-tl-lg">Mã ĐH</th>
                    <th className="px-6 py-3">Khách hàng</th>
                    <th className="px-6 py-3">Tổng tiền</th>
                    <th className="px-6 py-3">Trạng thái</th>
                    <th className="px-6 py-3 rounded-tr-lg">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order: any) => (
                    <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4">{order.customerName}</td>
                      <td className="px-6 py-4 font-medium text-green-600">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-800'}`}>
                          {ORDER_STATUS_MAP[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Chưa có đơn hàng nào</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
