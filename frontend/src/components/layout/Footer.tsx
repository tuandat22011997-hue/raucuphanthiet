'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api';

export function Footer() {
  const { data: settingsData } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsApi.getAll(),
  });
  const s = (settingsData as any) || {};

  return (
    <footer className="bg-gray-50 border-t pt-16 pb-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 max-w-4xl mx-auto">
          {/* Cột 1 */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-bold text-green-600 tracking-tight flex items-center">
                <span className="text-3xl mr-1">🥬</span>
                RauCủ<span className="text-orange-500">PT</span>
              </span>
            </Link>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Chúng tôi cung cấp các loại rau củ quả tươi sạch, đảm bảo chất lượng và an toàn vệ sinh thực phẩm trực tiếp từ nông trại đến bàn ăn gia đình bạn.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>

          {/* Cột 2 */}
          <div>
            <h3 className="font-bold text-lg mb-6">Liên Hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-600">
                <MapPin className="text-green-600 shrink-0 mt-1" size={20} />
                <span>{s.contact_address || 'TP. Phan Thiết, Bình Thuận'}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <Phone className="text-green-600 shrink-0" size={20} />
                <span>{s.contact_phone || '0901234567'}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <Mail className="text-green-600 shrink-0" size={20} />
                <span>{s.contact_email || 'lienhe@raucuphanthiet.vn'}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <Clock className="text-green-600 shrink-0" size={20} />
                <span>Mở cửa: {s.contact_hours || '06:00 - 20:00 hàng ngày'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Rau Củ Phan Thiết. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
