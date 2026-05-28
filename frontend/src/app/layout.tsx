import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { MainLayout } from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Rau Củ Phan Thiết - Thực Phẩm Sạch Từ Nông Trại",
  description: "Cửa hàng rau củ quả tươi sạch, giao hàng nhanh chóng tại Phan Thiết.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
        </Providers>
      </body>
    </html>
  );
}
