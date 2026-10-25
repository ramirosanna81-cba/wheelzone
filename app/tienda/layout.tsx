import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catálogo de Hot Wheels & Autos a Escala 1:64',
  description:
    'Explorá el catálogo completo de Wheels Zone: Hot Wheels Básicos, Línea Premium, Super Treasure Hunts ($TH), Kaido House, Mini GT y Matchbox en Argentina. Stock real y 3 cuotas sin interés.',
  alternates: {
    canonical: 'https://wheelszone.com.ar/tienda',
  },
  openGraph: {
    title: 'Catálogo y Tienda de Hot Wheels | Wheels Zone Argentina',
    description:
      'Piezas de colección certificadas en escala 1:64. Hot Wheels Premium, STH, RLC, Kaido House y Matchbox con envíos blindados a todo el país.',
    url: 'https://wheelszone.com.ar/tienda',
  },
};

export default function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
