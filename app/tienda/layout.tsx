import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tienda de Autitos de Colección, Hot Wheels y Matchbox',
  description:
    'Comprá autitos de colección, autos de metal, Hot Wheels y Matchbox nuevos en blíster. Todas las escalas para jugar o coleccionar con envíos a todo el país.',
  alternates: {
    canonical: '/tienda',
  },
  openGraph: {
    title: 'Tienda de Autitos de Colección, Hot Wheels y Matchbox | Wheels Zone',
    description:
      'Comprá autitos de colección, autos de metal, Hot Wheels y Matchbox nuevos en blíster. Todas las escalas para jugar o coleccionar con envíos a todo el país.',
    url: 'https://wheelszone.com.ar/tienda',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tienda Wheels Zone - Autitos de Colección y Autos a Escala',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tienda de Autitos de Colección, Hot Wheels y Matchbox | Wheels Zone',
    description:
      'Comprá autitos de colección, autos de metal, Hot Wheels y Matchbox nuevos en blíster con envíos a todo el país.',
    images: ['/og-image.jpg'],
  },
};

export default function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

