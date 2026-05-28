'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: any; // If null, it's create mode
}

export function CategoryForm({ open, onOpenChange, category }: CategoryFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!category;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      sortOrder: '0',
      isActive: true,
    },
  });

  // Reset form when opened
  useEffect(() => {
    if (open) {
      if (category) {
        reset({
          name: category.name,
          description: category.description || '',
          imageUrl: category.imageUrl || '',
          sortOrder: category.sortOrder?.toString() || '0',
          isActive: category.isActive !== false, // default true if undefined
        });
      } else {
        reset({
          name: '',
          description: '',
          imageUrl: '',
          sortOrder: '0',
          isActive: true,
        });
      }
    }
  }, [open, category, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => 
      isEditing ? categoriesApi.update(category.id, data) : categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success(isEditing ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra');
    }
  });

  const onSubmit = (data: any) => {
    const payload: any = {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      sortOrder: parseInt(data.sortOrder) || 0,
      isActive: data.isActive,
    };

    saveMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Tên danh mục *</Label>
            <Input {...register('name', { required: true })} placeholder="VD: Rau ăn lá" />
            {errors.name && <span className="text-sm text-red-500">Vui lòng nhập tên danh mục</span>}
          </div>

          <div className="space-y-2">
            <Label>Hình ảnh (URL)</Label>
            <Input {...register('imageUrl')} placeholder="https://example.com/image.jpg" />
          </div>

          <div className="space-y-2">
            <Label>Thứ tự sắp xếp (Số lớn xếp sau)</Label>
            <Input type="number" {...register('sortOrder')} placeholder="0" />
          </div>

          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea {...register('description')} rows={3} placeholder="Mô tả danh mục..." />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isActive')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-sm font-medium">Trạng thái kích hoạt (Hiển thị)</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-green-600 hover:bg-green-700">
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Lưu thay đổi' : 'Thêm danh mục'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
