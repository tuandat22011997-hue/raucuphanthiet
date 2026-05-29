'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { productsApi } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);

  const { data: res, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getBySlug(slug),
  });

  const product = res?.data;
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      quantity,
      imageUrl: product.images?.[0]?.url,
      unit: product.unit,
      stock: product.stock,
    });

    toast.success(`Đã thêm ${quantity} ${product.unit} ${product.name} vào giỏ hàng`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 aspect-square bg-gray-100 rounded-2xl" />
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-6 bg-gray-100 rounded w-1/4" />
            <div className="h-24 bg-gray-100 rounded w-full" />
            <div className="h-12 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h1>
        <p className="text-gray-600 mb-8">Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
        <Button asChild>
          <Link href="/san-pham">Quay lại danh sách sản phẩm</Link>
        </Button>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [{ url: null }];

  return (
    <div className="bg-gray-50/50 min-h-screen pb-12">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-green-600">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <Link href="/san-pham" className="hover:text-green-600">
              Sản phẩm
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/san-pham?category=${product.category?.slug}`}
              className="hover:text-green-600"
            >
              {product.category?.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border">
                <img
                  src={getImageUrl(images[mainImage].url)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder-product.jpg';
                  }}
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {images.map((img: any, idx: number) => (
                    <button
                      key={img.id || idx}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 ${
                        mainImage === idx ? 'border-green-500' : 'border-transparent'
                      }`}
                      onClick={() => setMainImage(idx)}
                    >
                      <img
                        src={getImageUrl(img.url)}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full lg:w-1/2 flex flex-col">
              {product.isFeatured && (
                <Badge className="bg-orange-500 hover:bg-orange-600 w-fit mb-4">
                  Sản phẩm nổi bật
                </Badge>
              )}

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>

              <div className="text-gray-500 mb-6 pb-6 border-b flex items-center gap-4">
                <span>
                  Danh mục:{' '}
                  <Link
                    href={`/san-pham?category=${product.category?.slug}`}
                    className="text-green-600 hover:underline"
                  >
                    {product.category?.name}
                  </Link>
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  Tình trạng:{' '}
                  <span className="text-green-600 font-medium">Sẵn sàng giao hàng</span>
                </span>
              </div>

              <div className="mb-6 flex items-end gap-3">
                <div className="text-xl font-bold text-gray-700">Đơn vị: {product.unit}</div>
              </div>

              {product.description && (
                <div className="prose prose-sm text-gray-600 mb-8">
                  <p>{product.description}</p>
                </div>
              )}

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center border bg-white rounded-full h-12">
                    <button
                      className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-green-600 disabled:opacity-50"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus size={18} />
                    </button>
                    <div className="w-12 text-center font-semibold">{quantity}</div>
                    <button
                      className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-green-600 disabled:opacity-50"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <Button
                    className="flex-1 min-w-0 h-12 rounded-full bg-green-600 hover:bg-green-700 text-sm sm:text-base gap-2 px-4 sm:px-6"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart size={20} />
                    Thêm vào giỏ hàng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
