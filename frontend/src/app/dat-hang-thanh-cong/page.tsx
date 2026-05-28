'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 text-center max-w-2xl">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-short">
        <CheckCircle2 size={48} />
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Đặt hàng thành công!</h1>
      
      <div className="bg-white border rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
        <p className="text-gray-600 text-lg mb-4">
          Cảm ơn bạn đã mua sắm tại Rau Củ Phan Thiết. Chúng tôi đã nhận được đơn đặt hàng của bạn và đang tiến hành chuẩn bị.
        </p>
        
        {orderNumber && (
          <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-4 inline-block mx-auto">
            <span className="text-gray-600 mr-2">Mã đơn hàng:</span>
            <span className="font-bold text-green-700 text-xl">{orderNumber}</span>
          </div>
        )}
        
        <p className="text-sm text-gray-500 mt-4">
          Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng (COD). Chúng tôi sẽ liên hệ với bạn trước khi giao hàng.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="bg-green-600 hover:bg-green-700 rounded-full h-12 px-8" asChild>
          <Link href="/san-pham">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Tiếp tục mua sắm
          </Link>
        </Button>
        
        {orderNumber && (
          <Button size="lg" variant="outline" className="rounded-full h-12 px-8" asChild>
            <Link href="/tai-khoan/don-hang">
              Xem đơn hàng <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
