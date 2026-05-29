'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { productsApi, categoriesApi, settingsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { getImageUrl, formatCurrency } from '@/lib/utils';
import { ShoppingCart, Leaf, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

export default function HomePage() {
  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(true),
  });

  const { data: featuredProductsRes } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.getAll({ featured: true, limit: 8 }),
  });

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsApi.getAll(),
  });

  const s = (settings as any) || {};
  const categories = categoriesRes?.data || [];
  const featuredProducts = featuredProductsRes?.data?.data || [];
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      quantity: 1,
      imageUrl: product.images?.[0]?.url,
      unit: product.unit,
      stock: product.stock,
    });
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative bg-green-50 overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              {s.hero_title_1 || 'Rau Củ Tươi Sạch'} <br />
              <span className="text-green-600">{s.hero_title_2 || 'Từ Nông Trại Đến Bàn Ăn'}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              {s.hero_description || 'Cung cấp thực phẩm an toàn, chất lượng cao với dịch vụ giao hàng nhanh chóng tại Phan Thiết. Tươi ngon mỗi ngày!'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6 rounded-full" asChild>
                <Link href="/san-pham">Mua Ngay</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none hidden md:block">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-green-600">
            <path fill="currentColor" d="M45.7,-76.1C58.9,-69.3,69.1,-55.4,78.2,-41.2C87.3,-27,95.3,-12.4,94.2,1.6C93.1,15.7,82.9,29.3,73.4,42.5C63.8,55.8,54.9,68.7,42.4,75.9C29.9,83.1,13.8,84.6,0.3,84.2C-13.3,83.7,-26.6,81.3,-39.1,74.5C-51.6,67.8,-63.3,56.7,-72.1,43.6C-80.9,30.6,-86.8,15.6,-86.6,0.8C-86.3,-14,-80,-28.4,-71.4,-40.8C-62.8,-53.2,-51.9,-63.7,-39.3,-71.1C-26.7,-78.5,-12.4,-82.9,2.4,-86.7C17.2,-90.6,32.5,-83,45.7,-76.1Z" transform="translate(100 100)" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Leaf size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">{s.feature1_title || '100% Tươi Sạch'}</h3>
              <p className="text-gray-600">{s.feature1_desc || 'Rau củ được thu hoạch mỗi ngày, đảm bảo độ tươi ngon nhất khi đến tay bạn.'}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">{s.feature2_title || 'An Toàn Sức Khỏe'}</h3>
              <p className="text-gray-600">{s.feature2_desc || 'Không sử dụng thuốc trừ sâu hóa học, tuân thủ tiêu chuẩn VietGAP.'}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{s.feature3_title || 'Giao Hàng Tận Nơi'}</h3>
              <p className="text-gray-600">{s.feature3_desc || 'Giao hàng tận nơi nhanh chóng và an toàn tại khu vực Phan Thiết.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Danh Mục Sản Phẩm</h2>
            <p className="text-gray-600">Khám phá các mặt hàng tươi ngon của chúng tôi</p>
          </div>
          <Button variant="ghost" className="text-green-600 hover:text-green-700 hidden sm:flex" asChild>
            <Link href="/san-pham">Xem tất cả <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat: any) => (
            <Link 
              key={cat.id} 
              href={`/san-pham?category=${cat.slug}`}
              className="group flex flex-col items-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-green-500 hover:shadow-md transition-all text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🥬</span>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-green-600">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sản Phẩm Nổi Bật</h2>
            <p className="text-gray-600">Rau củ quả tươi ngon được khách hàng yêu thích nhất</p>
          </div>
          <Button variant="ghost" className="text-green-600 hover:text-green-700 hidden sm:flex" asChild>
            <Link href="/san-pham">Xem tất cả <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product: any) => (
            <div key={product.id} className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden">
              <Link href={`/san-pham/${product.slug}`} className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
                <img 
                  src={getImageUrl(product.images?.[0]?.url)} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder-product.jpg';
                  }}
                />
              </Link>
              
              <div className="p-4 flex flex-col flex-1">
                <Link href={`/san-pham/${product.slug}`}>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1 hover:text-green-600 line-clamp-2">{product.name}</h3>
                </Link>
                <div className="text-sm text-gray-500 mb-3">{product.category?.name}</div>
                
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <span className="text-sm text-gray-500 font-medium">Đơn vị: {product.unit}</span>
                  </div>
                  <Button 
                    size="icon" 
                    className="rounded-full h-10 w-10 bg-green-600 hover:bg-green-700"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container mx-auto px-4 mt-8">
        <div className="bg-green-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{s.cta_title || 'Bạn cần rau sạch cho bữa ăn hôm nay?'}</h2>
            <p className="text-green-100 text-lg mb-8">{s.cta_description || 'Đặt hàng ngay hôm nay, chúng tôi sẽ giao hàng tận nơi cho bạn!'}</p>
            <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 text-lg px-8 py-6 rounded-full" asChild>
              <Link href="/san-pham">Đi Đặt Hàng Ngay</Link>
            </Button>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-700 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/2 translate-y-1/2"></div>
        </div>
      </section>
    </div>
  );
}
