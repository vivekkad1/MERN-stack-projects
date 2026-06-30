import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { ClientProvider } from "@/components/providers/ClientProvider";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { ChatBot } from "@/components/chat/ChatBot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Minikart - Multi-Vendor E-Commerce",
  description: "Shop the best products from top brands and sellers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ClientProvider>
          <SocketProvider>
            <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <CategoryNav />
            <main className="flex-1">{children}</main>
            <Footer />
            <ChatBot />
          </div>
          </SocketProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
