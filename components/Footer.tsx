import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full relative bg-[#0E0E10] text-on-surface-variant border-t border-surface-container mt-16 overflow-hidden">
      {/* Industrial Diamond Plate Floor Texture */}
      <div className="absolute inset-0 bg-diamond-plate opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-[#0E0E10]/90 pointer-events-none"></div>

      {/* 4 Columns Racing Grid */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 md:px-8 mx-auto py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand & Presentation */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-48 transition-transform duration-200 hover:scale-105">
              <Image
                src="/images/logos/logo-swoosh-transparent.png"
                alt="Wheels Zone Flame Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </div>
          <p className="font-body-sm text-xs text-neutral-300 leading-relaxed">
            Tu espacio especializado en coleccionables a escala 1:64, desde Mainlines y RLC hasta Super Treasure Hunts. Calidad y autenticidad aseguradas en cada pieza.
          </p>
          <div className="flex flex-col gap-1 pt-1 font-label-telemetry">
            <span className="text-xs uppercase text-[#FFC200] font-bold tracking-wider">
              ATENCIÓN PERSONALIZADA 24/7
            </span>
            <span className="font-display-hero text-sm sm:text-base uppercase text-white font-extrabold tracking-wide">
              ASESORÍA Y SOPORTE PERSONALIZADO
            </span>
            <div className="flex items-center gap-2 pt-0.5 font-body-sm">
              <span className="w-2 h-2 rounded-full bg-[#E51937] animate-pulse shrink-0"></span>
              <span className="text-neutral-300 text-xs">Asesoría y soporte personalizado</span>
            </div>
          </div>
        </div>

        {/* Protección de Envíos */}
        <div className="flex flex-col gap-3">
          <span className="font-headline-sm uppercase text-white tracking-wider text-base font-bold">
            Protección de Envíos
          </span>
          <p className="font-body-sm text-xs text-neutral-300 leading-relaxed">
            Cuidamos cada detalle para que tu compra llegue en excelentes condiciones. Embalamos cada pieza con cartón, burbuja de protección y cajas firmes para que viajen seguras.
          </p>
          <div className="flex flex-col gap-2 font-label-telemetry text-xs pt-1">
            <div className="flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-[#FFC200] text-lg">verified</span>
              <span className="font-bold tracking-wider">EMPAQUE SEGURO Y RESISTENTE</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-[#FFC200] text-lg">shield</span>
              <span className="font-bold tracking-wider">CUIDADO EN CADA DETALLE</span>
            </div>
          </div>
        </div>

        {/* Pasarela & Despachos | Pagos y Envíos */}
        <div className="flex flex-col gap-3">
          <span className="font-headline-sm uppercase text-white tracking-wider text-base font-bold">
            Pasarela &amp; Despachos | Pagos y Envíos
          </span>
          <p className="font-body-sm text-xs text-neutral-300 leading-relaxed">
            Aboná en <strong className="text-cyan-400 font-bold">3 cuotas sin interés</strong> con todas las tarjetas o aprovechá un <strong className="text-[#FFC200] font-bold">20% de descuento directo</strong> abonando por transferencia bancaria.
          </p>

          {/* Card: Despacho Rápido y Seguro */}
          <div className="flex flex-col gap-1 font-label-telemetry text-xs bg-[#161618]/90 p-2.5 sm:p-3 border border-neutral-800 rounded-lg shadow-sm">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[#FFA07A] text-lg shrink-0 mt-0.5">local_shipping</span>
              <div className="flex flex-col leading-snug">
                <span className="text-[#FFB800] font-black uppercase text-[11px] tracking-wider">DESPACHO RÁPIDO Y SEGURO</span>
                <span className="text-white font-bold text-xs uppercase tracking-wide">DESPACHO EXPRESS 24/48HS</span>
              </div>
            </div>
            <span className="text-[11px] text-neutral-400 pl-6.5">Realizamos los envíos dentro de los 3 días hábiles.</span>
          </div>

          {/* Card: Punto de Retiro & Showroom */}
          <div className="flex flex-col gap-1.5 font-label-telemetry text-xs bg-[#161618]/90 p-2.5 sm:p-3 border border-neutral-800 rounded-lg shadow-sm">
            <div className="flex items-center gap-1.5 text-[#FFC200] font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-base">storefront</span>
              <span>PUNTO DE RETIRO &amp; SHOWROOM</span>
            </div>
            <a
              href="https://maps.google.com/?q=Rioja+281,+B6022+Jun%C3%ADn,+Provincia+de+Buenos+Aires"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-neutral-300 hover:text-[#FFC200] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-xs text-[#FF7A66]">location_on</span>
              <span>Rioja 281, Junín, Buenos Aires</span>
            </a>
            <a
              href="https://wa.me/5492364275322?text=Hola%20Wheels%20Zone!%20Quiero%20coordinar%20retiro%20en%20el%20showroom."
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#25D366] hover:text-emerald-300 transition-colors flex items-start gap-1.5 font-bold pt-1.5 border-t border-neutral-800 leading-snug"
            >
              <span className="material-symbols-outlined text-sm shrink-0">chat</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">WHATSAPP: Soporte y Coordinación Directa:</span>
                <span className="text-xs text-[#25D366] font-bold">+54 9 2364 27-5322</span>
              </div>
            </a>
            <a
              href="https://www.instagram.com/wheelszoneok?utm_source=qr&obrf=ZjZpY3QzdmVkZ2h1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1.5 font-bold pt-1.5 border-t border-neutral-800 leading-snug"
            >
              <svg className="w-3.5 h-3.5 shrink-0 fill-current text-pink-400" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>INSTAGRAM: @wheelszoneok</span>
            </a>
          </div>
        </div>

        {/* Recursos para Coleccionistas */}
        <div className="flex flex-col gap-3">
          <span className="font-headline-sm uppercase text-white tracking-wider text-base font-bold">
            Recursos para Coleccionistas
          </span>
          <ul className="flex flex-col gap-2.5 font-body-sm text-xs text-on-surface-variant">
            <li>
              <Link href="/comunidad" className="hover:text-primary-container transition-colors flex items-center gap-1.5 text-neutral-300 group">
                <span className="text-[#FFC200] font-bold group-hover:translate-x-0.5 transition-transform">&gt;</span>
                <span>Reseñas de la Comunidad</span>
              </Link>
            </li>
            <li>
              <Link href="/eventos" className="hover:text-primary-container transition-colors flex items-center gap-1.5 text-neutral-300 group">
                <span className="text-[#FFC200] font-bold group-hover:translate-x-0.5 transition-transform">&gt;</span>
                <span>Agenda de Ferias y Eventos (Dónde Encontrarnos)</span>
              </Link>
            </li>
            <li className="pt-1">
              <Link href="/admin" className="hover:text-primary-container transition-colors flex items-center gap-1.5 text-neutral-400 group">
                <span className="material-symbols-outlined text-sm text-[#FFC200] group-hover:scale-110 transition-transform">lock</span>
                <span>Portal de Administración (Privado)</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal Strip */}
      <div className="w-full bg-[#0B0B0B] border-t border-surface-container py-4 relative z-10">
        <div className="w-full max-w-7xl px-4 sm:px-6 md:px-8 mx-auto flex flex-col md:flex-row items-center justify-between gap-3 font-label-telemetry text-[11px] sm:text-xs text-neutral-400 text-center md:text-left">
          <div>
            <span>© {new Date().getFullYear()} WHEELS ZONE PLATFORM. TODOS LOS DERECHOS RESERVADOS.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-3 gap-y-1">
            <span>TRACK-TESTED PACKAGING SYSTEM</span>
            <span className="text-primary-container">//</span>
            <span>PADDOCK ENLACE SEGURO</span>
            <span className="text-primary-container">//</span>
            <Link href="/admin" className="hover:text-primary-container transition-colors">
              ADMIN CONTROL
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
