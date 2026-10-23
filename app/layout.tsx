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
  icons: {
    icon: [
      { url: '/images/logos/logo-badge-dark.jpg', sizes: 'any' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/images/logos/logo-badge-dark.jpg', sizes: '180x180' },
    ],
    shortcut: ['/images/logos/logo-badge-dark.jpg'],
  },
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
      <head>
        <link rel="icon" href="/images/logos/logo-badge-dark.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/logos/logo-badge-dark.jpg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=Caveat:wght@600;700&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="bg-surface text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden w-full max-w-full">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1 pt-24 sm:pt-28 md:pt-32 w-full max-w-full overflow-x-hidden">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
