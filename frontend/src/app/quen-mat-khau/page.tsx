'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    newPassword: '',
    confirmPassword: '',
  });

  const resetMutation = useMutation({
    mutationFn: (data: any) => authApi.resetPassword(data),
    onSuccess: (res) => {
      toast.success(res?.data?.message || 'Lấy lại mật khẩu thành công!');
      router.push('/dang-nhap');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    resetMutation.mutate({
      email: formData.email,
      phone: formData.phone,
      newPassword: formData.newPassword,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-lg border-green-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quên Mật Khẩu</h1>
          <p className="text-gray-500">
            Nhập email và số điện thoại đã đăng ký để đặt lại mật khẩu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="nhap.email@example.com"
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0901234567"
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              required
              minLength={6}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="••••••••"
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              required
              minLength={6}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              className="rounded-xl"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 text-lg font-medium mt-6"
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </Button>

          <div className="text-center mt-6 text-gray-600">
            Nhớ mật khẩu rồi?{' '}
            <Link href="/dang-nhap" className="text-green-600 hover:text-green-700 font-medium">
              Đăng nhập ngay
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
