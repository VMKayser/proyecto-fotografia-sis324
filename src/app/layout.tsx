/**
 * 🌐 Layout Principal
 * Layout raíz de la aplicación
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider, NotificationProvider } from '@/frontend/repositories';
import { Navbar, Footer } from '@/frontend/components/layout';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fotografía - Encuentra tu Fotógrafo Ideal',
  description: 'Plataforma para contratar fotógrafos profesionales en Bolivia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body className={inter.className}>
        <NotificationProvider>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen pb-16 lg:pb-24">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
