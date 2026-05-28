'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { ProductForm } from './components/ProductForm';
import { toast } from 'sonner';
import Image from 'next/image';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Fetch products
  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => {
      const params: any = { page, limit: 10, activeOnly: false };
      if (search) params.search = search;
      return productsApi.getAll(params);
    },
  });

  const products = res?.data?.data || [];
  const meta = res?.data?.meta || { totalPages: 1 };

  // Delete product
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Xóa sản phẩm thành công');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa sản phẩm');
    }
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm tên sản phẩm..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : products.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 w-20 text-center">Ảnh</th>
                      <th className="px-6 py-4">Tên sản phẩm</th>
                      <th className="px-6 py-4">Danh mục</th>
                      <th className="px-6 py-4">Giá bán</th>
                      <th className="px-6 py-4 text-center">Trạng thái</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product: any) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-center">
                          <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100 mx-auto border">
                            {product.images && product.images.length > 0 ? (
                              <Image 
                                src={product.images[0].url} 
                                alt={product.name} 
                                fill 
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          {product.isFeatured && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-sm">
                              NỔI BẬT
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {product.category?.name || '---'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-green-600">{formatCurrency(product.price)} / {product.unit}</div>
                          {product.priceWhole > 0 && (
                            <div className="text-xs text-gray-500 mt-1">Sỉ: {formatCurrency(product.priceWhole)} / {product.unit}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {product.isActive ? (
                            <div className="flex items-center justify-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium w-max mx-auto">
                              <Eye size={14} /> Hiển thị
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium w-max mx-auto">
                              <EyeOff size={14} /> Đang ẩn
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleEdit(product)}
                            title="Sửa sản phẩm"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deleteMutation.isPending}
                            title="Xóa sản phẩm"
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
                {products.map((product: any) => (
                  <div key={product.id} className="bg-white border rounded-lg p-4 space-y-4 shadow-sm">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border">
                        {product.images && product.images.length > 0 ? (
                          <Image 
                            src={product.images[0].url} 
                            alt={product.name} 
                            fill 
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-base truncate">{product.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{product.category?.name || 'Chưa phân loại'}</div>
                        {product.isFeatured && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-sm">
                            NỔI BẬT
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded-md">
                      <div>
                        <div className="text-gray-500 text-xs">Giá bán lẻ</div>
                        <div className="font-bold text-green-600">{formatCurrency(product.price)}/{product.unit}</div>
                      </div>
                      {product.priceWhole > 0 && (
                        <div>
                          <div className="text-gray-500 text-xs">Giá bán sỉ</div>
                          <div className="font-bold text-green-700">{formatCurrency(product.priceWhole)}/{product.unit}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div>
                        {product.isActive ? (
                          <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Eye size={12} /> Hiển thị
                          </span>
                        ) : (
                          <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <EyeOff size={12} /> Đang ẩn
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit size={14} className="mr-1" /> Sửa
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={14} className="mr-1" /> Xóa
                        </Button>
                      </div>
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
            <div className="text-center py-12 text-gray-500">
              Không tìm thấy sản phẩm nào.
            </div>
          )}
        </CardContent>
      </Card>

      <ProductForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        product={selectedProduct} 
      />
    </div>
  );
}
