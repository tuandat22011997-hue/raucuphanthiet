'use client';

import { Header } from './Header';
import { Footer } from './Footer';
import { Toaster } from '@/components/ui/sonner';

import { usePathname } from 'next/navigation';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {!isAdmin && <Header />}
      <main className="flex-1 bg-white">
        {children}
      </main>
      {!isAdmin && <Footer />}
      <Toaster position="top-center" richColors duration={1500} />
    </div>
  );
}
