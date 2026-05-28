'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Save, Globe, Phone, Mail, MapPin, Clock, Type, FileText, Megaphone, Leaf, ShieldCheck, Truck } from 'lucide-react';

// Các key mặc định của settings
const DEFAULT_SETTINGS: Record<string, string> = {
  // Hero Banner
  hero_title_1: 'Rau Củ Tươi Sạch',
  hero_title_2: 'Từ Nông Trại Đến Bàn Ăn',
  hero_description: 'Cung cấp thực phẩm an toàn, chất lượng cao với dịch vụ giao hàng nhanh chóng tại Phan Thiết. Tươi ngon mỗi ngày!',
  // Features
  feature1_title: '100% Tươi Sạch',
  feature1_desc: 'Rau củ được thu hoạch mỗi ngày, đảm bảo độ tươi ngon nhất khi đến tay bạn.',
  feature2_title: 'An Toàn Sức Khỏe',
  feature2_desc: 'Không sử dụng thuốc trừ sâu hóa học, tuân thủ tiêu chuẩn VietGAP.',
  feature3_title: 'Giao Hàng Tận Nơi',
  feature3_desc: 'Giao hàng tận nơi nhanh chóng và an toàn tại khu vực Phan Thiết.',
  // CTA
  cta_title: 'Bạn cần rau sạch cho bữa ăn hôm nay?',
  cta_description: 'Đặt hàng ngay hôm nay, chúng tôi sẽ giao hàng tận nơi cho bạn!',
  // Contact
  contact_phone: '0901234567',
  contact_email: 'lienhe@raucuphanthiet.vn',
  contact_address: 'TP. Phan Thiết, Bình Thuận',
  contact_hours: '06:00 - 20:00 hàng ngày',
};

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>(DEFAULT_SETTINGS);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsApi.getAll(),
  });

  // Merge settings từ DB vào form (giữ default cho các key chưa có trong DB)
  useEffect(() => {
    if (settings) {
      setForm(prev => ({ ...prev, ...(settings as any) }));
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (data: Record<string, string>) => settingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Đã lưu thay đổi thành công!');
    },
    onError: () => {
      toast.error('Lỗi khi lưu thay đổi');
    },
  });

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    mutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="h-6 w-6 text-green-600" />
            Chỉnh sửa nội dung Website
          </h1>
          <p className="text-gray-500 text-sm mt-1">Thay đổi nội dung hiển thị trên trang chủ và thông tin liên hệ</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="bg-green-600 hover:bg-green-700 gap-2 shrink-0"
        >
          <Save className="h-4 w-4" />
          {mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>

      {/* Thông tin liên hệ */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            Thông tin liên hệ
          </CardTitle>
          <p className="text-sm text-gray-500">Hiển thị ở Header và Footer của website</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Số điện thoại
              </label>
              <Input
                value={form.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                placeholder="0901234567"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </label>
              <Input
                value={form.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="email@domain.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Địa chỉ
              </label>
              <Input
                value={form.contact_address}
                onChange={(e) => handleChange('contact_address', e.target.value)}
                placeholder="TP. Phan Thiết, Bình Thuận"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Giờ mở cửa
              </label>
              <Input
                value={form.contact_hours}
                onChange={(e) => handleChange('contact_hours', e.target.value)}
                placeholder="06:00 - 20:00 hàng ngày"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hero Banner */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="h-5 w-5 text-green-600" />
            Hero Banner (Phần đầu trang chủ)
          </CardTitle>
          <p className="text-sm text-gray-500">Tiêu đề và mô tả lớn ở phần đầu trang chủ</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tiêu đề dòng 1</label>
            <Input
              value={form.hero_title_1}
              onChange={(e) => handleChange('hero_title_1', e.target.value)}
              placeholder="Rau Củ Tươi Sạch"
              className="text-lg font-semibold"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tiêu đề dòng 2 (màu xanh)</label>
            <Input
              value={form.hero_title_2}
              onChange={(e) => handleChange('hero_title_2', e.target.value)}
              placeholder="Từ Nông Trại Đến Bàn Ăn"
              className="text-lg font-semibold text-green-600"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mô tả</label>
            <textarea
              value={form.hero_description}
              onChange={(e) => handleChange('hero_description', e.target.value)}
              placeholder="Mô tả ngắn về cửa hàng..."
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
            />
          </div>
        </CardContent>
      </Card>

      {/* Đặc điểm nổi bật */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600" />
            3 Đặc điểm nổi bật
          </CardTitle>
          <p className="text-sm text-gray-500">3 ô đặc điểm hiển thị ngay dưới Hero Banner</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Feature 1 */}
          <div className="p-4 rounded-lg border border-green-100 bg-green-50/50 space-y-3">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <Leaf className="h-4 w-4" /> Đặc điểm 1
            </div>
            <Input
              value={form.feature1_title}
              onChange={(e) => handleChange('feature1_title', e.target.value)}
              placeholder="Tiêu đề đặc điểm 1"
              className="font-semibold"
            />
            <textarea
              value={form.feature1_desc}
              onChange={(e) => handleChange('feature1_desc', e.target.value)}
              placeholder="Mô tả đặc điểm 1"
              className="w-full min-h-[60px] px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y text-sm"
            />
          </div>

          {/* Feature 2 */}
          <div className="p-4 rounded-lg border border-blue-100 bg-blue-50/50 space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-medium">
              <ShieldCheck className="h-4 w-4" /> Đặc điểm 2
            </div>
            <Input
              value={form.feature2_title}
              onChange={(e) => handleChange('feature2_title', e.target.value)}
              placeholder="Tiêu đề đặc điểm 2"
              className="font-semibold"
            />
            <textarea
              value={form.feature2_desc}
              onChange={(e) => handleChange('feature2_desc', e.target.value)}
              placeholder="Mô tả đặc điểm 2"
              className="w-full min-h-[60px] px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y text-sm"
            />
          </div>

          {/* Feature 3 */}
          <div className="p-4 rounded-lg border border-purple-100 bg-purple-50/50 space-y-3">
            <div className="flex items-center gap-2 text-purple-700 font-medium">
              <Truck className="h-4 w-4" /> Đặc điểm 3
            </div>
            <Input
              value={form.feature3_title}
              onChange={(e) => handleChange('feature3_title', e.target.value)}
              placeholder="Tiêu đề đặc điểm 3"
              className="font-semibold"
            />
            <textarea
              value={form.feature3_desc}
              onChange={(e) => handleChange('feature3_desc', e.target.value)}
              placeholder="Mô tả đặc điểm 3"
              className="w-full min-h-[60px] px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* CTA Banner */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-red-600" />
            Banner kêu gọi (CTA - cuối trang)
          </CardTitle>
          <p className="text-sm text-gray-500">Banner màu xanh ở cuối trang chủ</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tiêu đề</label>
            <Input
              value={form.cta_title}
              onChange={(e) => handleChange('cta_title', e.target.value)}
              placeholder="Bạn cần rau sạch cho bữa ăn hôm nay?"
              className="font-semibold"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mô tả</label>
            <textarea
              value={form.cta_description}
              onChange={(e) => handleChange('cta_description', e.target.value)}
              placeholder="Mô tả kêu gọi hành động"
              className="w-full min-h-[60px] px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
            />
          </div>
        </CardContent>
      </Card>

      {/* Nút lưu cố định ở dưới */}
      <div className="sticky bottom-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={mutation.isPending}
          size="lg"
          className="bg-green-600 hover:bg-green-700 gap-2 shadow-lg shadow-green-600/30"
        >
          <Save className="h-5 w-5" />
          {mutation.isPending ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
        </Button>
      </div>
    </div>
  );
}
