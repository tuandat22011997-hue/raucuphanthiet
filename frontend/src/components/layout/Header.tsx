'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, User, Search, MapPin, Home, ShoppingBag, Leaf, Carrot, Apple, Package, LogOut, Settings } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi, settingsApi } from '@/lib/api';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const { data: categoriesRes } = useQuery({
    queryKey: ['header-categories'],
    queryFn: () => categoriesApi.getAll(true),
  });
  const categories = categoriesRes?.data || [];

  const { data: settingsData } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsApi.getAll(),
  });
  const siteSettings = (settingsData as any) || {};

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/san-pham?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      {/* Top bar */}
      <div className="bg-green-600 text-white text-xs py-1.5 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>Giao hàng tận nơi tại Phan Thiết</span>
          </div>
          <div className="flex gap-4">
            <span>Hotline: {siteSettings.contact_phone || '0901234567'}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Mobile Menu */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 flex flex-col">
            <div className="p-6 bg-green-50 border-b border-green-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-3xl shadow-sm border border-green-200">
                🥬
              </div>
              <div>
                <h2 className="font-bold text-green-800 text-xl tracking-tight">RauCủ<span className="text-orange-500">PT</span></h2>
                {isAuthenticated && user ? (
                  <p className="text-sm text-green-600 font-medium mt-0.5">Chào, {user.name}!</p>
                ) : (
                  <p className="text-xs text-green-600/80 font-medium mt-0.5">Tươi ngon mỗi ngày</p>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="flex flex-col px-3 gap-1">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 text-gray-700 hover:text-green-700 font-medium transition-colors">
                  <Home className="w-5 h-5 text-gray-400" />
                  Trang chủ
                </Link>
                <Link href="/san-pham" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 text-gray-700 hover:text-green-700 font-medium transition-colors">
                  <ShoppingBag className="w-5 h-5 text-gray-400" />
                  Tất cả sản phẩm
                </Link>
                
                {categories.length > 0 && (
                  <div className="px-4 py-2 mt-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Danh mục</p>
                  </div>
                )}
                {categories.map((cat: any) => (
                  <Link 
                    key={cat.id} 
                    href={`/san-pham?category=${cat.slug}`} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="flex items-center gap-3 px-4 py-2.5 ml-2 rounded-xl hover:bg-green-50 text-gray-600 hover:text-green-700 transition-colors"
                  >
                    <Leaf className="w-4 h-4 text-green-500" />
                    {cat.name}
                  </Link>
                ))}

                <div className="px-4 py-2 mt-2 border-t pt-4">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tài khoản</p>
                </div>
                {isAuthenticated ? (
                  <>
                    <Link href="/tai-khoan" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 text-gray-700 hover:text-green-700 font-medium transition-colors">
                      <User className="w-5 h-5 text-gray-400" />
                      Tài khoản của tôi
                    </Link>
                    <Link href="/tai-khoan/don-hang" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 text-gray-700 hover:text-green-700 font-medium transition-colors">
                      <Package className="w-5 h-5 text-gray-400" />
                      Lịch sử đơn hàng
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-50 text-purple-700 font-medium transition-colors">
                        <Settings className="w-5 h-5 text-purple-400" />
                        Trang quản trị Admin
                      </Link>
                    )}
                    <button onClick={() => { setIsMobileMenuOpen(false); logout(); }} className="flex items-center gap-3 px-4 py-3 mt-4 mx-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors w-[calc(100%-16px)] text-left border border-red-100">
                      <LogOut className="w-5 h-5" />
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 px-4 mt-2">
                    <Link href="/dang-nhap" onClick={() => setIsMobileMenuOpen(false)} className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center rounded-xl py-6 border-2")}>Đăng nhập</Link>
                    <Link href="/dang-ky" onClick={() => setIsMobileMenuOpen(false)} className={cn(buttonVariants({ variant: "default" }), "w-full justify-center rounded-xl py-6 bg-green-600 hover:bg-green-700")}>Đăng ký ngay</Link>
                  </div>
                )}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-green-600 tracking-tight flex items-center">
            <span className="text-3xl mr-1">🥬</span>
            RauCủ<span className="text-orange-500">PT</span>
          </span>
        </Link>

        {/* Desktop Nav & Search */}
        <div className="hidden md:flex items-center flex-1 ml-8 gap-6">
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-green-600 transition-colors">Trang chủ</Link>
            <Link href="/san-pham" className="hover:text-green-600 transition-colors">Sản phẩm</Link>
          </nav>

          <form onSubmit={handleSearch} className="flex-1 max-w-md ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm rau củ, trái cây..."
              className="w-full h-10 pl-10 pr-4 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" className={cn(buttonVariants({ variant: "outline" }), "gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800")}>
                    <Settings className="h-4 w-4" />
                    <span className="hidden lg:inline">Quản trị</span>
                  </Link>
                )}
                <Link href="/tai-khoan" className={cn(buttonVariants({ variant: "ghost" }), "gap-2")}>
                  <User className="h-5 w-5" />
                  <span className="hidden lg:inline">{user?.name}</span>
                </Link>
              </div>
            ) : (
              <Link href="/dang-nhap" className={buttonVariants({ variant: "ghost" })}>
                Đăng nhập
              </Link>
            )}
          </div>
          
          <div className="relative shrink-0 ml-2">
            {/* Hiệu ứng sóng radar tỏa ra phía sau */}
            <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping"></div>
            
            <Link 
              href="/gio-hang" 
              className="relative flex items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-gradient-to-tr from-green-500 to-emerald-400 text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/40 shadow-lg shadow-green-500/30 group z-10"
            >
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
              {isMounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 md:h-6 md:w-6 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-pulse"></span>
                  <span className="relative inline-flex rounded-full h-full w-full bg-red-500 text-white text-[10px] md:text-xs font-bold items-center justify-center border-2 border-white shadow-sm">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
