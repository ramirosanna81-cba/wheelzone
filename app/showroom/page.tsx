import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Showroom en Junín | Retiro de Autitos de Colección',
  description:
    'Visitá nuestro showroom en Junín, Buenos Aires. Retirá tus autitos de colección, Hot Wheels y autos a escala comprados online sin costo de envío.',
  alternates: {
    canonical: '/showroom',
  },
  openGraph: {
    title: 'Showroom en Junín | Retiro de Autitos de Colección - Wheels Zone',
    description:
      'Visitá nuestro showroom en Junín, Buenos Aires. Retirá tus autitos de colección, Hot Wheels y autos a escala comprados online sin costo de envío.',
    url: 'https://wheelszone.com.ar/showroom',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Showroom Wheels Zone Junín - Punto de Retiro Oficial',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Showroom en Junín | Retiro de Autitos de Colección | Wheels Zone',
    description:
      'Visitá nuestro showroom en Junín, Buenos Aires. Retirá tus autitos comprados online sin costo de envío.',
    images: ['/og-image.jpg'],
  },
};

export default function ShowroomPage() {
  const whatsappUrl =
    'https://wa.me/5492364275322?text=' +
    encodeURIComponent(
      '¡Hola Wheels Zone! Quiero coordinar una visita o retiro en el Showroom de Junín (Rioja 281).'
    );
  const mapsUrl =
    'https://maps.google.com/?q=Rioja+281,+B6000+Jun%C3%ADn,+Provincia+de+Buenos+Aires';

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HobbyShop',
    name: 'Wheels Zone - Showroom y Punto de Retiro Oficial',
    image: 'https://wheelszone.com.ar/og-image.jpg',
    description:
      'Showroom y punto de retiro gratuito de autitos de colección, Hot Wheels y autos a escala en Junín, Buenos Aires.',
    url: 'https://wheelszone.com.ar/showroom',
    telephone: '+5492364275322',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rioja 281',
      addressLocality: 'Junín',
      addressRegion: 'Buenos Aires',
      postalCode: '6000',
      addressCountry: 'AR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -34.5838,
      longitude: -60.9433,
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
  };

  return (
    <div className="w-full flex flex-col bg-[#0d0d10] text-on-surface min-h-[85vh]">
      {/* Schema.org específico para la página del Showroom */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      {/* Hero Strip de Ubicación */}
      <section className="relative w-full overflow-hidden bg-carbon-pattern py-10 sm:py-16 md:py-20 border-b border-surface-container">
        <div className="absolute -top-24 -left-24 w-80 sm:w-96 h-80 sm:h-96 bg-primary-container/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-secondary-container/20 rounded-full blur-[130px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="font-label-telemetry text-xs md:text-sm tracking-[0.25em] text-[#FFC200] uppercase font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FFC200] animate-ping" />
              PUNTO DE RETIRO OFICIAL &amp; SHOWROOM
            </span>
            <span className="text-outline text-xs hidden sm:inline">//</span>
            <span className="text-neutral-400 font-label-telemetry text-xs hidden sm:inline uppercase">
              JUNÍN, BUENOS AIRES
            </span>
          </div>

          <h1 className="font-display-hero text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-white leading-[0.95] max-w-4xl">
            VENÍ A CONOCER EL <span className="text-gradient-flame italic">GARAJE EN PERSONA</span>
          </h1>

          <p className="font-body-md text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl leading-relaxed">
            Comprá tus autitos de colección online y retirálos en nuestro showroom de Junín 
            <strong> 100% gratis, sin costo de envío</strong>. Revisá el estado del blíster en mano 
            y disfrutá de atención personalizada para tu colección o regalos.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-display-hero uppercase text-xs sm:text-sm tracking-wider font-extrabold rounded-xl flex items-center gap-2 shadow-[0_4px_16px_rgba(37,211,102,0.35)] transition-all"
            >
              <span className="material-symbols-outlined text-lg">chat</span>
              <span>COORDINAR RETIRO POR WHATSAPP</span>
            </a>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-[#18181c] hover:bg-[#232328] active:scale-95 text-white border border-neutral-700 hover:border-[#FFC200] font-display-hero uppercase text-xs sm:text-sm tracking-wider font-bold rounded-xl flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[#FFC200] text-lg">location_on</span>
              <span>CÓMO LLEGAR EN GOOGLE MAPS</span>
            </a>

            <Link
              href="/tienda"
              className="px-6 py-3.5 bg-primary-container hover:bg-[#ffd033] active:scale-95 text-black font-display-hero uppercase text-xs sm:text-sm tracking-wider font-black rounded-xl flex items-center gap-2 transition-all shadow-[0_4px_16px_rgba(255,194,0,0.25)]"
            >
              <span className="material-symbols-outlined text-lg">storefront</span>
              <span>VER CATÁLOGO DISPONIBLE</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Grid de Información del Showroom */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Columna Izquierda: Tarjetas de Información */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card Principal: Datos de Ubicación y Horarios */}
          <div className="bg-[#141418] border border-neutral-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
              <span className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container shrink-0">
                <span className="material-symbols-outlined text-2xl">home_pin</span>
              </span>
              <div className="flex flex-col">
                <span className="font-label-telemetry text-xs text-[#FFC200] font-bold uppercase tracking-wider">
                  COORDENADAS OFICIALES
                </span>
                <h2 className="font-display-hero text-xl sm:text-2xl uppercase text-white font-bold">
                  SHOWROOM WHEELS ZONE JUNÍN
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-label-telemetry text-xs">
              {/* Dirección */}
              <div className="flex flex-col gap-1.5 p-4 bg-[#1a1a20] rounded-xl border border-neutral-800">
                <span className="text-neutral-400 uppercase font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#FFC200]">near_me</span>
                  Dirección Física
                </span>
                <span className="text-white text-sm sm:text-base font-bold">
                  Rioja 281
                </span>
                <span className="text-neutral-300 text-xs">
                  Junín, Provincia de Buenos Aires (CP 6000)
                </span>
              </div>

              {/* Horarios */}
              <div className="flex flex-col gap-1.5 p-4 bg-[#1a1a20] rounded-xl border border-neutral-800">
                <span className="text-neutral-400 uppercase font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#FFC200]">schedule</span>
                  Horarios de Atención
                </span>
                <span className="text-white text-sm sm:text-base font-bold">
                  Lunes a Sábados
                </span>
                <span className="text-neutral-300 text-xs">
                  09:00 a 20:00 hs (Coordinación previa)
                </span>
              </div>

              {/* Teléfono / WhatsApp */}
              <div className="flex flex-col gap-1.5 p-4 bg-[#1a1a20] rounded-xl border border-neutral-800">
                <span className="text-neutral-400 uppercase font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#25D366]">call</span>
                  WhatsApp Oficial
                </span>
                <span className="text-[#25D366] text-sm sm:text-base font-bold">
                  +54 9 2364 27-5322
                </span>
                <span className="text-neutral-300 text-xs">
                  Atención directa con el equipo
                </span>
              </div>

              {/* Costo de Retiro */}
              <div className="flex flex-col gap-1.5 p-4 bg-emerald-950/30 rounded-xl border border-emerald-500/30">
                <span className="text-emerald-400 uppercase font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">savings</span>
                  Costo de Retiro
                </span>
                <span className="text-white text-sm sm:text-base font-black">
                  $0 ARS (GRATIS)
                </span>
                <span className="text-emerald-300 text-xs font-semibold">
                  Ahorrá 100% en gastos de envío
                </span>
              </div>
            </div>

            {/* Medios de Pago en Showroom */}
            <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">
              <span className="font-label-telemetry text-xs uppercase text-neutral-400 font-bold tracking-wider">
                Medios de Pago Habilitados:
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-label-telemetry">
                <span className="px-3 py-1 rounded-lg bg-neutral-800/80 text-white border border-neutral-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-cyan-400">credit_card</span>
                  3 Cuotas Sin Interés
                </span>
                <span className="px-3 py-1 rounded-lg bg-amber-500/15 text-[#FFC200] border border-amber-500/30 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">percent</span>
                  20% OFF Transferencia
                </span>
                <span className="px-3 py-1 rounded-lg bg-neutral-800/80 text-white border border-neutral-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-emerald-400">payments</span>
                  Efectivo en Mano
                </span>
              </div>
            </div>
          </div>

          {/* 3 Pilares del Showroom */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#141418] border border-neutral-800 rounded-xl flex flex-col gap-2">
              <span className="material-symbols-outlined text-[#FFC200] text-2xl">verified</span>
              <h3 className="font-display-hero text-sm uppercase text-white font-bold">
                100% NUEVOS Y CERRADOS
              </h3>
              <p className="font-body-sm text-xs text-neutral-400 leading-relaxed">
                Todas las piezas están en blíster o caja original de fábrica. Cero rayones o desgastes.
              </p>
            </div>

            <div className="p-4 bg-[#141418] border border-neutral-800 rounded-xl flex flex-col gap-2">
              <span className="material-symbols-outlined text-cyan-400 text-2xl">visibility</span>
              <h3 className="font-display-hero text-sm uppercase text-white font-bold">
                INSPECCIÓN EN MANO
              </h3>
              <p className="font-body-sm text-xs text-neutral-400 leading-relaxed">
                Podés verificar la burbuja plástica, tarjeta y detalles antes de retirarlo.
              </p>
            </div>

            <div className="p-4 bg-[#141418] border border-neutral-800 rounded-xl flex flex-col gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-2xl">handshake</span>
              <h3 className="font-display-hero text-sm uppercase text-white font-bold">
                ASESORÍA PERSONALIZADA
              </h3>
              <p className="font-body-sm text-xs text-neutral-400 leading-relaxed">
                ¿Buscás un modelo para regalar o completar una serie? Te guiamos en cada casting.
              </p>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Mapa & FAQ de Retiro */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Tarjeta de Mapa Interactivo / Enlace Directo */}
          <div className="bg-[#141418] border border-neutral-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display-hero text-base sm:text-lg uppercase text-white font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FFC200]">map</span>
                LOCALIZACIÓN GEOGRÁFICA
              </h3>
              <span className="font-label-telemetry text-[11px] text-neutral-400">JUNÍN, BS AS</span>
            </div>

            {/* Simulación visual de mapa táctico */}
            <div className="relative w-full h-48 bg-[#18181f] rounded-xl overflow-hidden border border-neutral-700 flex flex-col items-center justify-center text-center p-4">
              <div className="absolute inset-0 bg-telemetry-grid opacity-25" />
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-secondary-container text-white flex items-center justify-center shadow-[0_0_20px_rgba(229,25,55,0.6)] animate-bounce">
                  <span className="material-symbols-outlined text-2xl">pin_drop</span>
                </div>
                <span className="font-display-hero text-white text-base font-extrabold uppercase tracking-tight">
                  Rioja 281, Junín
                </span>
                <span className="font-label-telemetry text-xs text-neutral-300">
                  Lat: -34.5838 // Long: -60.9433
                </span>
              </div>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-gradient-to-r from-[#FFC200] via-[#FF6000] to-[#FF1E27] text-black font-display-hero uppercase text-xs sm:text-sm tracking-wider font-extrabold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all text-center"
            >
              <span>ABRIR EN GOOGLE MAPS &gt;</span>
            </a>
          </div>

          {/* Preguntas Frecuentes de Retiro */}
          <div className="bg-[#141418] border border-neutral-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
            <h3 className="font-display-hero text-base sm:text-lg uppercase text-white font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400">help</span>
              PREGUNTAS FRECUENTES DE RETIRO
            </h3>

            <div className="flex flex-col gap-3 font-body-sm text-xs">
              <div className="p-3 bg-[#181820] rounded-xl border border-neutral-800 flex flex-col gap-1">
                <span className="text-white font-bold text-xs uppercase font-label-telemetry">
                  ¿Cómo selecciono el retiro en showroom?
                </span>
                <p className="text-neutral-300 leading-relaxed">
                  Al momento de coordinar tu compra o carrito, seleccionás la opción de retiro en Junín y coordinamos día y horario por WhatsApp sin ningún costo de envío.
                </p>
              </div>

              <div className="p-3 bg-[#181820] rounded-xl border border-neutral-800 flex flex-col gap-1">
                <span className="text-white font-bold text-xs uppercase font-label-telemetry">
                  ¿Puedo pagar al momento de retirar?
                </span>
                <p className="text-neutral-300 leading-relaxed">
                  Sí, podés abonar en el showroom en efectivo, por transferencia bancaria (con 20% de descuento directo) o con tarjeta de crédito en 3 cuotas sin interés.
                </p>
              </div>

              <div className="p-3 bg-[#181820] rounded-xl border border-neutral-800 flex flex-col gap-1">
                <span className="text-white font-bold text-xs uppercase font-label-telemetry">
                  ¿Puedo ver otros modelos cuando vaya?
                </span>
                <p className="text-neutral-300 leading-relaxed">
                  ¡Por supuesto! El showroom cuenta con vitrinas y stock físico disponible para que elijas entre cientos de modelos a escala 1:64, 1:43 y más.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
