'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { User, ShoppingBag, MapPin, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuthStore();

  useEffect(() => {
    // Only redirect if not authenticated after mount
    if (!isAuthenticated) {
      router.push('/dang-nhap');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    router.push('/dang-nhap');
  };

  const navItems = [
    { name: 'Hồ sơ của tôi', href: '/tai-khoan', icon: User },
    { name: 'Đơn mua', href: '/tai-khoan/don-hang', icon: ShoppingBag },
    { name: 'Sổ địa chỉ', href: '/tai-khoan/dia-chi', icon: MapPin },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border p-6 shadow-sm sticky top-24">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{user?.name}</div>
                <div className="text-sm text-gray-500 truncate w-32">{user?.email}</div>
              </div>
            </div>
            
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive 
                        ? 'bg-green-50 text-green-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-left mt-2"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
