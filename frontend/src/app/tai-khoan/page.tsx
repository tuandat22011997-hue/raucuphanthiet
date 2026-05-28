'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usersApi, authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await usersApi.updateProfile(formData);
      
      // Lấy lại thông tin user mới
      const res = await authApi.getMe();
      setUser(res.data);
      
      toast.success('Cập nhật thông tin thành công');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ của tôi</h1>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Chỉnh sửa
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email đăng nhập</Label>
          <Input 
            id="email" 
            value={user?.email || ''} 
            disabled 
            className="bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500">Email không thể thay đổi</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Họ và tên</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!isEditing}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input 
            id="phone" 
            value={formData.phone} 
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={!isEditing}
          />
        </div>

        {isEditing && (
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsEditing(false);
                setFormData({ name: user?.name || '', phone: user?.phone || '' });
              }}
              disabled={isLoading}
            >
              Hủy
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
