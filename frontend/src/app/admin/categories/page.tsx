'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { CategoryForm } from './components/CategoryForm';
import { toast } from 'sonner';
import Image from 'next/image';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Fetch categories (pass activeOnly=false to get all)
  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoriesApi.getAll(false),
  });

  // Client-side search filtering
  const allCategories = res?.data || [];
  const categories = search 
    ? allCategories.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()))
    : allCategories;

  // Delete category
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Xóa danh mục thành công');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa danh mục');
    }
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"? Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Danh mục</h1>
        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm tên danh mục..."
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
          ) : categories.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 w-20 text-center">Ảnh</th>
                    <th className="px-6 py-4">Tên danh mục</th>
                    <th className="px-6 py-4">Mô tả</th>
                    <th className="px-6 py-4 text-center">Thứ tự (Sort)</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.map((category: any) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-center">
                        <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100 mx-auto border flex items-center justify-center">
                          {category.imageUrl ? (
                            <Image 
                              src={category.imageUrl} 
                              alt={category.name} 
                              fill 
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">No img</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{category.name}</div>
                        <div className="text-xs text-gray-500">{category.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                        {category.description || '---'}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {category.sortOrder || 0}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {category.isActive ? (
                          <div className="flex items-center justify-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium w-max mx-auto">
                            <Eye size={14} /> Kích hoạt
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
                          onClick={() => handleEdit(category)}
                          title="Sửa danh mục"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(category.id, category.name)}
                          disabled={deleteMutation.isPending}
                          title="Xóa danh mục"
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
                {categories.map((category: any) => (
                  <div key={category.id} className="bg-white border rounded-lg p-4 space-y-4 shadow-sm">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border flex items-center justify-center">
                        {category.imageUrl ? (
                          <Image 
                            src={category.imageUrl} 
                            alt={category.name} 
                            fill 
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">No img</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-base truncate">{category.name}</div>
                        <div className="text-xs text-gray-500 truncate">{category.slug}</div>
                        <div className="text-xs text-gray-400 mt-1">Thứ tự: {category.sortOrder || 0}</div>
                      </div>
                    </div>
                    
                    {category.description && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                        {category.description}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div>
                        {category.isActive ? (
                          <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Eye size={12} /> Kích hoạt
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
                          onClick={() => handleEdit(category)}
                        >
                          <Edit size={14} className="mr-1" /> Sửa
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(category.id, category.name)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={14} className="mr-1" /> Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Không tìm thấy danh mục nào.
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        category={selectedCategory} 
      />
    </div>
  );
}
