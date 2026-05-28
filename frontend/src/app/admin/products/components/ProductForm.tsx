'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, categoriesApi } from '@/lib/api';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any; // If null, it's create mode
}

export function ProductForm({ open, onOpenChange, product }: ProductFormProps) {
  const queryClient = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const isEditing = !!product;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      priceWhole: '',
      unit: 'kg',
      stock: '100',
      categoryId: '',
      isActive: true,
      isFeatured: false,
    },
  });

  const categoryId = watch('categoryId');
  const isActive = watch('isActive');
  const isFeatured = watch('isFeatured');

  // Load categories
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoriesApi.getAll(),
  });
  const categories = categoriesData?.data || [];

  // Reset form when opened
  useEffect(() => {
    if (open) {
      if (product) {
        reset({
          name: product.name,
          description: product.description || '',
          price: product.price.toString(),
          priceWhole: product.priceWhole ? product.priceWhole.toString() : '',
          unit: product.unit,
          stock: product.stock.toString(),
          categoryId: product.categoryId,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
        });
        setPreviewUrls(product.images?.map((img: any) => img.url) || []);
      } else {
        reset({
          name: '',
          description: '',
          price: '',
          priceWhole: '',
          unit: 'kg',
          stock: '100',
          categoryId: '',
          isActive: true,
          isFeatured: false,
        });
        setPreviewUrls([]);
      }
      setImages([]);
    }
  }, [open, product, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);
      
      const newUrls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    // Note: this only works for newly uploaded images for simplicity in this version.
    // To handle removing existing images, the API needs a way to delete specific images.
    setImages(images.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => 
      isEditing ? productsApi.update(product.id, data) : productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(isEditing ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra');
    }
  });

  const onSubmit = (data: any) => {
    if (!data.categoryId) {
      toast.error('Vui lòng chọn danh mục');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    if (data.priceWhole) formData.append('priceWhole', data.priceWhole);
    formData.append('unit', data.unit);
    formData.append('stock', data.stock || '999999');
    formData.append('categoryId', data.categoryId);
    formData.append('isActive', data.isActive.toString());
    formData.append('isFeatured', data.isFeatured.toString());

    images.forEach((file) => {
      formData.append('images', file);
    });

    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tên sản phẩm *</Label>
              <Input {...register('name', { required: true })} placeholder="VD: Cà chua Đà Lạt" />
              {errors.name && <span className="text-sm text-red-500">Vui lòng nhập tên sản phẩm</span>}
            </div>
            
            <div className="space-y-2">
              <Label>Danh mục *</Label>
              <Select value={categoryId} onValueChange={(val) => setValue('categoryId', val ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Giá bán (VNĐ) *</Label>
              <Input type="number" {...register('price', { required: true })} placeholder="VD: 50000" />
            </div>

            <div className="space-y-2">
              <Label>Giá sỉ (VNĐ) - Tùy chọn</Label>
              <Input type="number" {...register('priceWhole')} placeholder="VD: 45000" />
            </div>

            <div className="space-y-2">
              <Label>Đơn vị tính *</Label>
              <Input {...register('unit', { required: true })} placeholder="VD: kg, bó, túi" />
            </div>

            <div className="hidden">
              <Input type="hidden" {...register('stock')} defaultValue={999999} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea {...register('description')} rows={4} placeholder="Nhập mô tả sản phẩm..." />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isActive')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-sm font-medium">Đang bán (Hiển thị)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-sm font-medium">Sản phẩm nổi bật</span>
            </label>
          </div>

          <div className="space-y-2">
            <Label>Hình ảnh</Label>
            <div className="flex flex-wrap gap-4 mt-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                  <Image src={url} alt="Preview" fill className="object-cover" unoptimized={url.startsWith('blob:')} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-50 cursor-pointer">
                <Upload size={24} className="text-gray-400" />
                <span className="text-xs text-gray-500 mt-2">Tải ảnh lên</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-green-600 hover:bg-green-700">
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
