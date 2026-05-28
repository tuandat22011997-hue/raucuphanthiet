'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { LayoutDashboard, ShoppingCart, Users, Package, Tags, LogOut, Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/dang-nhap');
    } else if (user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  const handleLogout = () => {
    logout();
    router.push('/dang-nhap');
  };

  const navItems = [
    { name: 'Bảng điều khiển', href: '/admin', icon: LayoutDashboard },
    { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Sản phẩm', href: '/admin/products', icon: Package },
    { name: 'Danh mục', href: '/admin/categories', icon: Tags },
    { name: 'Khách hàng', href: '/admin/customers', icon: Users },
    { name: 'Chỉnh sửa web', href: '/admin/settings', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center px-6 bg-slate-950 font-bold text-xl text-white">
          <span className="text-3xl mr-2">🥬</span> AdminCP
        </div>
        
        <div className="p-4 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white uppercase">
            {user?.name?.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <div className="text-white font-medium truncate">{user?.name}</div>
            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/admin' 
              ? pathname === '/admin' 
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-green-600 text-white font-medium' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </Button>
            <h1 className="font-semibold text-lg text-gray-800">
              {navItems.find(item => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`)))?.name || 'Bảng điều khiển'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/" target="_blank">Xem Website</Link>
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
