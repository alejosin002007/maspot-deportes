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
            <header className="h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-[#144a2d] flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm gap-2">
              <div className="flex items-center gap-2 md:flex-1">
                <div className="hidden md:block text-xl font-bold dark:text-white tracking-tight mr-4">Noticias</div>
                <Link href="/clasificacion" className="px-3 md:px-7 py-2 md:py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-sm md:text-base font-black hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 transition-all shadow-md transform hover:scale-105 whitespace-nowrap flex items-center gap-1">
                  📊 <span className="hidden sm:inline">Tablas</span>
                </Link>
              </div>
              
              <div className="flex-1 flex justify-center w-full max-w-lg mx-1 md:mx-4">
                <Suspense fallback={<div className="w-full h-10 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse"></div>}>
                  <SearchBar />
                </Suspense>
              </div>
              
              <div className="flex items-center justify-end gap-2 md:flex-1">
                <ThemeToggle />
                <UserAvatar />
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto p-8 bg-gray-100 dark:bg-gray-950">
              {children}
            </main>
          </div>
          
          {/* Widget de Google Translate a petición del usuario (VERSIÓN MEJORADA) */}
          <div id="google_translate_element" style={{ display: 'none' }}></div>
          <Script id="google-translate-script" strategy="afterInteractive">
            {`
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'auto', 
                  includedLanguages: 'es', 
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                  autoDisplay: true
                }, 'google_translate_element');
                
                // Fuerza un retraso mínimo para asegurar que las noticias cargaron en el DOM
                setTimeout(() => {
                  const botonTraducir = document.querySelector('.goog-te-combo');
                  if (botonTraducir) {
                    botonTraducir.value = 'es';
                    botonTraducir.dispatchEvent(new Event('change'));
                  }
                }, 1000);
              }
            `}
          </Script>
          <Script strategy="afterInteractive" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" />
          
        </ThemeProvider>
      </body>
    </html>
  );
}
