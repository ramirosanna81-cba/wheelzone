import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: 'Wheels Zone | Plataforma y Vidriera de Hot Wheels & Coleccionables',
  description: 'La zona definitiva para coleccionistas de alta velocidad. Hot Wheels Premium, Super Treasure Hunts ($TH), RLC, Kaido House y Matchbox con embalaje de grado militar y certificación de blíster en Argentina.',
  keywords: ['Hot Wheels', 'Super Treasure Hunt', 'Coleccionables', 'Diecast 1:64', 'Kaido House', 'RLC', 'Wheels Zone'],
  authors: [{ name: 'Wheels Zone Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-surface text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1 pt-24 w-full">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
