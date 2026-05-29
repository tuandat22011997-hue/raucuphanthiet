'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, Leaf, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { categoriesApi, productsApi, settingsApi } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
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
      <section className="relative overflow-hidden bg-green-50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(22,163,74,0.06),transparent_38%)]" />
        <div className="container relative z-10 mx-auto px-4 py-14 md:py-18 lg:py-24">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.86fr)] lg:gap-10 xl:gap-14">
            <div className="max-w-xl xl:max-w-2xl">
              <h1 className="mb-5 max-w-[11ch] text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-gray-900 md:text-5xl lg:text-[4.25rem]">
                {s.hero_title_1 || 'Rau Củ Tươi Sạch'} <br />
                <span className="text-green-600">{s.hero_title_2 || 'Từ Nông Trại Đến Bàn Ăn'}</span>
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-600 md:text-[1.15rem]">
                {s.hero_description ||
                  'Cung cấp thực phẩm an toàn, chất lượng cao với dịch vụ giao hàng nhanh chóng tại Phan Thiết. Tươi ngon mỗi ngày!'}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  className="rounded-full bg-green-600 px-8 py-6 text-lg shadow-[0_18px_34px_rgba(22,163,74,0.24)] hover:bg-green-700"
                  asChild
                >
                  <Link href="/san-pham">Mua Ngay</Link>
                </Button>
                <div className="text-sm font-medium text-green-700/80 md:text-base">
                  Tươi mới mỗi ngày, giao nhanh tại Phan Thiết
                </div>
              </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-[520px] items-center justify-center lg:justify-end">
              <div className="relative aspect-square w-[84%] max-w-[460px] min-w-[260px]">
                <svg
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute inset-0 h-full w-full text-green-200/78 drop-shadow-[0_20px_42px_rgba(34,197,94,0.14)]"
                >
                  <path
                    fill="currentColor"
                    d="M45.7,-76.1C58.9,-69.3,69.1,-55.4,78.2,-41.2C87.3,-27,95.3,-12.4,94.2,1.6C93.1,15.7,82.9,29.3,73.4,42.5C63.8,55.8,54.9,68.7,42.4,75.9C29.9,83.1,13.8,84.6,0.3,84.2C-13.3,83.7,-26.6,81.3,-39.1,74.5C-51.6,67.8,-63.3,56.7,-72.1,43.6C-80.9,30.6,-86.8,15.6,-86.6,0.8C-86.3,-14,-80,-28.4,-71.4,-40.8C-62.8,-53.2,-51.9,-63.7,-39.3,-71.1C-26.7,-78.5,-12.4,-82.9,2.4,-86.7C17.2,-90.6,32.5,-83,45.7,-76.1Z"
                    transform="translate(100 100)"
                  />
                </svg>
                <div className="absolute inset-x-12 bottom-8 h-8 rounded-full bg-green-950/12 blur-2xl" />
                <div className="absolute inset-[12%] translate-y-1 scale-[1.08]">
                  <Image
                    src="/images/hero-basket.png"
                    alt="Giỏ rau củ tươi"
                    fill
                    priority
                    sizes="(max-width: 768px) 78vw, (max-width: 1280px) 42vw, 520px"
                    className="object-contain drop-shadow-[0_26px_42px_rgba(17,24,39,0.24)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex items-start gap-4 rounded-2xl border border-green-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <Leaf size={24} />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold">{s.feature1_title || '100% Tươi Sạch'}</h3>
              <p className="text-gray-600">
                {s.feature1_desc ||
                  'Rau củ được thu hoạch mỗi ngày, đảm bảo độ tươi ngon nhất khi đến tay bạn.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-green-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold">{s.feature2_title || 'An Toàn Sức Khỏe'}</h3>
              <p className="text-gray-600">
                {s.feature2_desc ||
                  'Không sử dụng thuốc trừ sâu hóa học, tuân thủ các tiêu chuẩn canh tác an toàn.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-green-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                {s.feature3_title || 'Giao Hàng Tận Nơi'}
              </h3>
              <p className="text-gray-600">
                {s.feature3_desc ||
                  'Giao hàng tận nơi nhanh chóng và an toàn tại khu vực Phan Thiết.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900">Danh Mục Sản Phẩm</h2>
            <p className="text-gray-600">Khám phá các mặt hàng tươi ngon của chúng tôi</p>
          </div>
          <Button variant="ghost" className="hidden text-green-600 hover:text-green-700 sm:flex" asChild>
            <Link href="/san-pham">
              Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.slice(0, 6).map((cat: any) => (
            <Link
              key={cat.id}
              href={`/san-pham?category=${cat.slug}`}
              className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:border-green-500 hover:shadow-md"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 transition-transform group-hover:scale-110">
                <span className="text-3xl">🥬</span>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-green-600">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900">Sản Phẩm Nổi Bật</h2>
            <p className="text-gray-600">Rau củ quả tươi ngon được khách hàng yêu thích nhất</p>
          </div>
          <Button variant="ghost" className="hidden text-green-600 hover:text-green-700 sm:flex" asChild>
            <Link href="/san-pham">
              Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {featuredProducts.map((product: any) => (
            <div
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg"
            >
              <Link
                href={`/san-pham/${product.slug}`}
                className="relative flex aspect-square items-center justify-center overflow-hidden bg-gray-50"
              >
                <img
                  src={getImageUrl(product.images?.[0]?.url)}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder-product.jpg';
                  }}
                />
              </Link>

              <div className="flex flex-1 flex-col p-4">
                <Link href={`/san-pham/${product.slug}`}>
                  <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-gray-900 hover:text-green-600">
                    {product.name}
                  </h3>
                </Link>
                <div className="mb-3 text-sm text-gray-500">{product.category?.name}</div>

                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Đơn vị: {product.unit}</span>
                  </div>
                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-full bg-green-600 hover:bg-green-700"
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

      <section className="container mx-auto mt-8 px-4">
        <div className="relative overflow-hidden rounded-3xl bg-green-600 p-8 text-center text-white md:p-12">
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              {s.cta_title || 'Bạn cần rau sạch cho bữa ăn hôm nay?'}
            </h2>
            <p className="mb-8 text-lg text-green-100">
              {s.cta_description || 'Đặt hàng ngay hôm nay, chúng tôi sẽ giao hàng tận nơi cho bạn!'}
            </p>
            <Button
              size="lg"
              className="rounded-full bg-white px-8 py-6 text-lg text-green-700 hover:bg-green-50"
              asChild
            >
              <Link href="/san-pham">Đi Đặt Hàng Ngay</Link>
            </Button>
          </div>
          <div className="absolute -left-1/2 -top-1/2 h-64 w-64 rounded-full bg-green-500 opacity-70 blur-3xl mix-blend-multiply" />
          <div className="absolute -bottom-1/2 -right-1/2 h-64 w-64 rounded-full bg-green-700 opacity-70 blur-3xl mix-blend-multiply" />
        </div>
      </section>
    </div>
  );
}
