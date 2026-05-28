'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function AddressPage() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    label: 'Nhà riêng',
  });

  const { data: res, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.getAll(),
  });

  const addresses = res?.data || [];

  const addMutation = useMutation({
    mutationFn: (data: any) => addressesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setIsAdding(false);
      setFormData({ fullName: '', phone: '', address: '', label: 'Nhà riêng' });
      toast.success('Thêm địa chỉ thành công');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi khi thêm địa chỉ');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Đã xóa địa chỉ');
    },
  });

  const setAsDefaultMutation = useMutation({
    mutationFn: (address: any) => addressesApi.update(address.id, { ...address, isDefault: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Đã thiết lập địa chỉ mặc định');
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate({ ...formData, isDefault: addresses.length === 0 });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900">Sổ địa chỉ</h1>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" /> Thêm địa chỉ mới
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-6 rounded-xl border border-green-100 mb-8">
          <h2 className="font-semibold text-lg mb-4">Thêm địa chỉ giao hàng</h2>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Họ và tên người nhận</Label>
                <Input required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="Nguyễn Văn A" />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="0901234567" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Địa chỉ chi tiết</Label>
              <Textarea required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Số nhà, đường, phường/xã, quận/huyện..." />
            </div>

            <div className="space-y-2">
              <Label>Loại địa chỉ</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="label" value="Nhà riêng" checked={formData.label === 'Nhà riêng'} onChange={(e) => setFormData({...formData, label: e.target.value})} />
                  <span>Nhà riêng</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="label" value="Công ty" checked={formData.label === 'Công ty'} onChange={(e) => setFormData({...formData, label: e.target.value})} />
                  <span>Công ty</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Hủy</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={addMutation.isPending}>
                Lưu địa chỉ
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-50 h-32 rounded-xl border border-gray-100"></div>
          ))}
        </div>
      ) : addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((addr: any) => (
            <div key={addr.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex gap-4">
                <div className="mt-1 text-green-600">
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-900">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Mặc định</span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{addr.label}</span>
                  </div>
                  <div className="text-gray-600 text-sm mb-1">SĐT: {addr.phone}</div>
                  <div className="text-gray-600 text-sm">{addr.address}</div>
                </div>
              </div>
              <div className="flex sm:flex-col justify-end items-end gap-2">
                {!addr.isDefault && (
                  <button onClick={() => setAsDefaultMutation.mutate(addr)} className="text-sm text-green-600 hover:underline">
                    Đặt làm mặc định
                  </button>
                )}
                <button onClick={() => {
                  if(window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
                    deleteMutation.mutate(addr.id);
                  }
                }} className="text-sm text-red-500 hover:underline flex items-center gap-1">
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có địa chỉ nào</h3>
          <p className="text-gray-500 mb-6">Bạn chưa thêm địa chỉ giao hàng nào vào sổ địa chỉ.</p>
          <Button onClick={() => setIsAdding(true)} variant="outline">Thêm địa chỉ đầu tiên</Button>
        </div>
      )}
    </div>
  );
}
