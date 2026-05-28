'use client';

import { Suspense, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi, categoriesApi } from '@/lib/api';
import { getImageUrl, formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const defaultCategory = searchParams.get('category') || '';
  const defaultSearch = searchParams.get('q') || '';

  const [category, setCategory] = useState(defaultCategory);
  const [search, setSearch] = useState(defaultSearch);
  const [searchInput, setSearchInput] = useState(defaultSearch);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearch(q);
      setSearchInput(q);
    }
  }, [searchParams]);

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(true),
  });

  const { data: productsRes, isLoading } = useQuery({
    queryKey: ['products', category, search, sort],
    queryFn: () => productsApi.getAll({ 
      categorySlug: category || undefined,
      search: search || undefined,
      sortBy: sort,
      limit: 20
    }),
  });

  const categories = categoriesRes?.data || [];
  const products = productsRes?.data?.data || [];
  const addItem = useCartStore((state) => state.addItem);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-green-50 rounded-2xl p-8 mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Sản Phẩm Tươi Sạch</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Lựa chọn từ hàng trăm loại rau củ quả tươi ngon, được thu hoạch trực tiếp từ nông trại và kiểm định chất lượng mỗi ngày.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24 bg-white border rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-green-600" />
              Danh mục
            </h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setCategory('')}
                className={`text-left px-3 py-2 rounded-md transition-colors ${
                  category === '' 
                    ? 'bg-green-100 text-green-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Tất cả sản phẩm
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.slug)}
                  className={`text-left px-3 py-2 rounded-md transition-colors ${
                    category === cat.slug 
                      ? 'bg-green-100 text-green-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <form onSubmit={handleSearch} className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-10 rounded-full"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Label className="whitespace-nowrap text-gray-600">Sắp xếp:</Label>
              <Select value={sort} onValueChange={(value) => setSort(value ?? 'newest')}>
                <SelectTrigger className="w-[180px] rounded-full">
                  <SelectValue placeholder="Mới nhất" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="priceAsc">Giá: Thấp đến Cao</SelectItem>
                  <SelectItem value="priceDesc">Giá: Cao đến Thấp</SelectItem>
                  <SelectItem value="nameAsc">Tên: A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-2xl aspect-[3/4]"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((product: any) => (
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
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm nào</h3>
              <p className="text-gray-500">Vui lòng thử lại với từ khóa hoặc danh mục khác.</p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => {
                  setCategory('');
                  setSearch('');
                  setSearchInput('');
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageContent />
    </Suspense>
  );
}
