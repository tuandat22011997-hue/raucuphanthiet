'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ChevronRight, FileDown, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { ordersApi } from '@/lib/api';
import { formatCurrency, formatDateTime, ORDER_STATUS_MAP, ORDER_STATUS_COLOR } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cartStore';

export default function OrdersPage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const { data: res, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.getMyOrders(1, 50),
  });

  const orders = res?.data?.data || [];

  const handleReorder = (order: any) => {
    const reorderableItems = (order.items || []).filter(
      (item: any) => item.product?.id && item.product?.slug,
    );

    if (reorderableItems.length === 0) {
      toast.error('Không còn sản phẩm hợp lệ để đặt lại');
      return;
    }

    reorderableItems.forEach((item: any) => {
      addItem({
        productId: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.product.images?.[0]?.url,
        unit: item.product.unit || 'kg',
        stock: item.product.stock || 0,
      });
    });

    toast.success('Đã thêm sản phẩm từ đơn cũ vào giỏ hàng');
    router.push('/gio-hang');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b">Đơn hàng của tôi</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-50 h-32 rounded-xl border border-gray-100" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm md:text-base">{order.orderNumber}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{formatDateTime(order.createdAt)}</div>
                  </div>
                  <Badge variant="outline" className={`whitespace-nowrap text-[10px] md:text-xs ${ORDER_STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {ORDER_STATUS_MAP[order.status] || order.status}
                  </Badge>
                </div>

                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs md:text-sm text-gray-500">
                    {order.items?.length || 0} sản phẩm
                  </div>
                  <div className="text-sm md:text-base font-bold text-green-600">
                    {formatCurrency(order.totalAmount)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-1">
                  <button
                    onClick={() => handleReorder(order)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 shadow-sm hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all"
                  >
                    <RotateCcw size={14} />
                    Đặt lại
                  </button>

                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        const response = await ordersApi.exportSingle(order.id);
                        const url = window.URL.createObjectURL(new Blob([response.data as any]));
                        const link = document.createElement('a');
                        link.href = url;

                        let filename = `ĐơnHàng_${order.orderNumber}.xlsx`;
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
                        toast.success('Xuất file Excel thành công');
                      } catch {
                        toast.error('Có lỗi xảy ra khi xuất file');
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-lg text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FileDown size={14} />
                    Xuất
                  </button>

                  <Link
                    href={`/tai-khoan/don-hang/${order.id}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-green-50 text-green-700 rounded-lg text-xs md:text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    Chi tiết
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-gray-500 mb-6">Bạn chưa đặt mua sản phẩm nào từ cửa hàng.</p>
          <Link href="/san-pham" className="text-green-600 font-medium hover:underline">
            Bắt đầu mua sắm ngay
          </Link>
        </div>
      )}
    </div>
  );
}
