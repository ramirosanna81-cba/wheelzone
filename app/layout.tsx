import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, DM_Sans, Caveat } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-barlow',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://wheelszone.com.ar'),
  title: {
    default: 'Wheels Zone | Plataforma y Vidriera de Hot Wheels & Coleccionables',
    template: '%s | Wheels Zone',
  },
  description:
    'La zona definitiva para coleccionistas en Argentina. Hot Wheels Premium, Super Treasure Hunts ($TH), RLC, Kaido House, Mini GT y Matchbox con embalaje blindado de grado militar y certificación de blíster en Junín y envíos a todo el país.',
  keywords: [
    'Hot Wheels Argentina',
    'Hot Wheels Premium',
    'Super Treasure Hunt',
    'STH Hot Wheels',
    'Kaido House Argentina',
    'Mini GT',
    'Matchbox Moving Parts',
    'Diecast 1:64',
    'Red Line Club RLC',
    'Comprar Hot Wheels Junin',
    'Wheels Zone',
  ],
  authors: [{ name: 'Wheels Zone Team', url: 'https://wheelszone.com.ar' }],
  creator: 'Wheels Zone',
  publisher: 'Wheels Zone',
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: 'https://wheelszone.com.ar',
  },
  openGraph: {
    title: 'Wheels Zone | Plataforma y Vidriera de Hot Wheels & Coleccionables',
    description:
      'La zona definitiva para coleccionistas. Hot Wheels Premium, STH, RLC, Kaido House y Matchbox con 3 cuotas sin interés y envíos blindados a toda la Argentina.',
    url: 'https://wheelszone.com.ar',
    siteName: 'Wheels Zone Argentina',
    locale: 'es_AR',
    type: 'website',
    images: [
      {
        url: '/images/logos/logo-badge-dark.jpg',
        width: 800,
        height: 800,
        alt: 'Wheels Zone - Plataforma de Hot Wheels y Coleccionables',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wheels Zone | Hot Wheels Premium & Coleccionables',
    description:
      'Hot Wheels Premium, Super Treasure Hunts ($TH), Kaido House y Mini GT con 3 cuotas sin interés y envíos blindados en Argentina.',
    images: ['/images/logos/logo-badge-dark.jpg'],
  },
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
  verification: {
    google: 'UBnkzVNhvckcLTQb_V1RXBwCPvAyyGOE4oKm9K7WjKE',
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
        {/* Preconexiones para acelerar Handshake DNS / TLS crítico */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://olkumxhhhcviuuhevaag.supabase.co" />
        <link rel="dns-prefetch" href="https://olkumxhhhcviuuhevaag.supabase.co" />

        {/* Material Symbols Outlined optimizado (ejes controlados: ~460KB vs 3.9MB y carga no bloqueante) */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
        />
        <link
          id="material-symbols-css"
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
          media="print"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var e=document.getElementById("material-symbols-css");if(e){if(e.sheet){e.media="all"}else{e.addEventListener("load",function(){e.media="all"});setTimeout(function(){e.media="all"},150)}}})();`,
          }}
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
          />
        </noscript>
        {/* Schema.org Datos Estructurados para Google (LocalBusiness & Tienda) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              name: 'Wheels Zone',
              image: 'https://wheelszone.com.ar/images/logos/logo-badge-dark.jpg',
              description:
                'Plataforma y tienda de Hot Wheels, Super Treasure Hunts ($TH), RLC, Kaido House y autos a escala 1:64 en Argentina.',
              url: 'https://wheelszone.com.ar',
              telephone: '+5492364275322',
              priceRange: '$$',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Rioja 281',
                addressLocality: 'Junín',
                addressRegion: 'Buenos Aires',
                postalCode: 'B6022',
                addressCountry: 'AR',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: -34.5888,
                longitude: -60.9463,
              },
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                  ],
                  opens: '09:00',
                  closes: '20:00',
                },
              ],
              sameAs: ['https://www.instagram.com/wheelszoneok'],
            }),
          }}
        />
      </head>
      <body className={`${barlowCondensed.variable} ${dmSans.variable} ${caveat.variable} font-sans bg-surface text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden w-full max-w-full`}>
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
