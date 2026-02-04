import type { Metadata } from "next";
import { Suspense } from "react";
import { ClientProvider } from "@/contexts/client-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindForge - Anmelden",
  description: "Melde dich bei MindForge an",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-900 antialiased">
        <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
          <ClientProvider>
            <main className="min-h-screen flex items-center justify-center px-4 py-8">
              {children}
            </main>
          </ClientProvider>
        </Suspense>
      </body>
    </html>
  );
}
