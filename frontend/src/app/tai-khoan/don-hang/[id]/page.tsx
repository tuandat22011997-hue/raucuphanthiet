'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { formatCurrency, formatDateTime, ORDER_STATUS_MAP, ORDER_STATUS_COLOR, getImageUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, ArrowLeft, FileDown, MapPin, Phone, Calendar, Clock, StickyNote } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data: res, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getById(orderId),
  });

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
        <p className="text-gray-500 mb-6">Đơn hàng này không tồn tại hoặc bạn không có quyền xem.</p>
        <button onClick={() => router.push('/tai-khoan/don-hang')} className="text-green-600 hover:underline">
          &larr; Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  const order = res?.data;

  const handleExport = async () => {
    try {
      const response = await ordersApi.exportSingle(orderId);
      const url = window.URL.createObjectURL(new Blob([response.data as any]));
      const link = document.createElement('a');
      link.href = url;
      
      let filename = `DonHang_${order?.orderNumber || orderId}.xlsx`;
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
    } catch (err) {
      toast.error('Có lỗi xảy ra khi xuất file');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
        <div className="flex items-center gap-4">
          <Link href="/tai-khoan/don-hang" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
            {order && <p className="text-sm text-gray-500 mt-1">Mã: {order.orderNumber}</p>}
          </div>
        </div>
        
        {order && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileDown size={16} />
            Xuất Excel
          </button>
        )}
      </div>

      {isLoading || !order ? (
        <div className="animate-pulse space-y-6">
          <div className="h-24 bg-gray-50 rounded-xl"></div>
          <div className="h-48 bg-gray-50 rounded-xl"></div>
          <div className="h-64 bg-gray-50 rounded-xl"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Trạng thái đơn hàng */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Ngày đặt: {formatDateTime(order.createdAt)}</p>
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-900">Trạng thái:</span>
                <Badge variant="outline" className={ORDER_STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-800'}>
                  {ORDER_STATUS_MAP[order.status] || order.status}
                </Badge>
              </div>
            </div>
            <div className="text-right w-full sm:w-auto">
              <p className="text-sm text-gray-500 mb-1">Tổng thanh toán</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(order.totalAmount)}</p>
            </div>
          </div>

          {/* Thông tin giao hàng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-green-600" /> Thông tin người nhận
              </h3>
              <div className="space-y-3 text-sm">
                <p><span className="text-gray-500 w-24 inline-block">Họ tên:</span> <span className="font-medium">{order.customerName}</span></p>
                <p><span className="text-gray-500 w-24 inline-block">Điện thoại:</span> <span className="font-medium">{order.phone}</span></p>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-22 shrink-0">Địa chỉ:</span> 
                  <span>{order.address}</span>
                </div>
              </div>
            </div>

            <div className="border rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-green-600" /> Thời gian giao hàng
              </h3>
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2"><Calendar size={16} className="text-gray-400" /> <span className="text-gray-500 w-20">Ngày giao:</span> <span className="font-medium">{order.deliveryDate || 'Nhanh nhất có thể'}</span></p>
                <p className="flex items-center gap-2"><Clock size={16} className="text-gray-400" /> <span className="text-gray-500 w-20">Giờ giao:</span> <span className="font-medium">{order.deliveryTime || 'Trong giờ hành chính'}</span></p>
                {order.note && (
                  <div className="flex gap-2 mt-2 pt-2 border-t text-orange-700 bg-orange-50 p-2 rounded">
                    <StickyNote size={16} className="shrink-0 mt-0.5" />
                    <span>Ghi chú: {order.note}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="border rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b font-bold text-gray-900">
              Sản phẩm đã đặt ({order.items.length})
            </div>
            <div className="p-5 space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg object-cover flex items-center justify-center text-gray-400 shrink-0">
                      {item.product?.images?.[0]?.url ? (
                        <img src={getImageUrl(item.product.images[0].url)} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <ShoppingBag size={24} />
                      )}
                    </div>
                    <div>
                      <Link href={`/san-pham/${item.product?.slug}`} className="font-medium text-gray-900 hover:text-green-600 text-base">
                        {item.product?.name || 'Sản phẩm đã xóa'}
                      </Link>
                      <div className="text-gray-500 mt-1">
                        {formatCurrency(item.price)} <span className="text-xs px-1">x</span> {item.quantity} {item.product?.unit}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-gray-900 ml-20 sm:ml-0">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Tổng kết tiền */}
            <div className="bg-gray-50 p-5 border-t">
              <div className="flex justify-end">
                <div className="w-full sm:w-64 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(order.totalAmount + order.discountAmount)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá ({order.couponCode}):</span>
                      <span>-{formatCurrency(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span>Miễn phí</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-gray-900 pt-3 border-t">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
