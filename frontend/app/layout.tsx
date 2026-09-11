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
  title: "Maspot Fútbol",
  description: "Portal de fútbol mundial",
};

import Script from 'next/script';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Script global de Google AdSense real */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8662542322334638"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-950 text-black dark:text-gray-100 flex h-screen overflow-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={<div className="w-64 bg-black h-full shrink-0"></div>}>
            <Sidebar />
          </Suspense>

          {/* Main Content */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-[#144a2d] flex items-center justify-between px-8 shrink-0 shadow-sm">
              <div className="flex-1 flex items-center">
                <div className="text-xl font-bold dark:text-white tracking-tight">Noticias</div>
              </div>
              
              <div className="flex-1 flex justify-center max-w-lg w-full">
                <Suspense fallback={<div className="w-full max-w-md h-10 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse"></div>}>
                  <SearchBar />
                </Suspense>
              </div>
              
              <div className="flex-1 flex items-center justify-end gap-4">
                <Link href="/clasificacion" className="px-7 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-base font-black hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 transition-all shadow-md transform hover:scale-105">
                  🏆 Tablas
                </Link>
                <ThemeToggle />
                <UserAvatar />
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto p-8 bg-gray-100 dark:bg-gray-950">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
