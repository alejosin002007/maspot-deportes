import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import UserAvatar from "@/components/UserAvatar";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Maspot Deportes",
  description: "Portal de deportes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-900 text-black dark:text-gray-100 flex h-screen overflow-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={<div className="w-64 bg-black h-full shrink-0"></div>}>
            <Sidebar />
          </Suspense>

          {/* Main Content */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 shrink-0 shadow-sm">
              <div className="text-xl font-semibold dark:text-white">Noticias</div>
              <div className="w-1/3 min-w-[200px]">
                <Suspense fallback={<div className="w-full h-9 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse"></div>}>
                  <SearchBar />
                </Suspense>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <UserAvatar />
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto p-8 bg-gray-100 dark:bg-gray-900">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
