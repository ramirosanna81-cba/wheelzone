import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest text-on-surface-variant border-t border-surface-container mt-16">
      {/* 4 Columns Racing Grid */}
      <div className="w-full max-w-7xl px-4 md:px-8 mx-auto py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand & Manifesto */}
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
          <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
            El hub definitivo para coleccionistas de alta gama, rarezas Mainline, Red Line Club (RLC), Super Treasure Hunts y piezas de automovilismo a escala 1:64 con certificación rigurosa de estado de blíster.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="w-2.5 h-2.5 bg-race-red rounded-full animate-ping"></span>
            <span className="font-label-telemetry text-xs uppercase text-primary-container">
              ATENCIÓN PERSONALIZADA 24/7
            </span>
          </div>
        </div>

        {/* Blindaje de Empaque */}
        <div className="flex flex-col gap-3">
          <span className="font-headline-sm uppercase text-on-surface tracking-wider text-base">
            Blindaje de Empaque
          </span>
          <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
            Cada pieza viaja en protector acrílico rígido o burbuja termoformada, resguardada en cajas corrugadas tricapa reforzadas para evitar esquinas dobladas, grietas o estrés mecánico durante el envío.
          </p>
          <div className="flex flex-col gap-1.5 font-label-telemetry text-xs text-outline pt-1">
            <span className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary-container text-sm">verified</span>
              PROTECTOR CARD CASE INCLUIDO
            </span>
            <span className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary-container text-sm">shield</span>
              SELLO ANTI-APLASTAMIENTO C-10
            </span>
          </div>
        </div>

        {/* Pasarela & Despachos */}
        <div className="flex flex-col gap-3">
          <span className="font-headline-sm uppercase text-on-surface tracking-wider text-base">
            Pasarela & Despachos
          </span>
          <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
            Aboná de forma segura por transferencia bancaria instantánea y obtené un 10% de descuento directo en cualquier modelo. También aceptamos Mercado Pago y tarjetas.
          </p>
          <div className="flex flex-col gap-1 font-label-telemetry text-xs text-primary-container bg-surface-container-low p-2.5 border border-surface-container">
            <div className="flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined text-base">local_shipping</span>
              <span className="font-bold">DESPACHO EXPRESS 24/48HS</span>
            </div>
            <span className="text-[11px] text-outline">Seguimiento por WhatsApp en tiempo real</span>
          </div>
          {/* Showroom & Pickup Point */}
          <div className="flex flex-col gap-1 font-label-telemetry text-xs text-on-surface bg-surface-container p-2.5 border border-surface-container-highest">
            <div className="flex items-center gap-1.5 text-primary-container font-bold uppercase">
              <span className="material-symbols-outlined text-base">storefront</span>
              <span>PUNTO DE RETIRO & SHOWROOM</span>
            </div>
            <a
              href="https://maps.google.com/?q=Rioja+281,+B6022+Jun%C3%ADn,+Provincia+de+Buenos+Aires"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-on-surface-variant hover:text-primary-container transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs text-secondary">location_on</span>
              Rioja 281, B6022 Junín, Argentina
            </a>
            <a
              href="https://wa.me/5492364275322?text=Hola%20Wheels%20Zone!%20Quiero%20hacerles%20una%20consulta."
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-bold pt-1 border-t border-surface-container-high"
            >
              <span className="material-symbols-outlined text-xs">chat</span>
              WhatsApp: +54 9 2364 27-5322
            </a>
            <span className="text-[10px] text-outline">Coordinación previa para entrega en mano</span>
          </div>
        </div>

        {/* Protocolo Coleccionista */}
        <div className="flex flex-col gap-3">
          <span className="font-headline-sm uppercase text-on-surface tracking-wider text-base">
            Protocolo Coleccionista
          </span>
          <ul className="flex flex-col gap-2 font-body-sm text-xs text-on-surface-variant">
            <li>
              <Link href="/tienda" className="hover:text-primary-container transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-primary-container">chevron_right</span>
                Guía de Grados de Blíster (C-1 a C-10)
              </Link>
            </li>
            <li>
              <Link href="/comunidad" className="hover:text-primary-container transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-primary-container">chevron_right</span>
                El Garaje de la Comunidad (Reseñas Reales)
              </Link>
            </li>
            <li>
              <Link href="/#encargos" className="hover:text-primary-container transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-primary-container">chevron_right</span>
                Cacería de Piezas Raras & Importación
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-primary-container transition-colors flex items-center gap-1.5 text-outline">
                <span className="material-symbols-outlined text-xs text-secondary-container">lock</span>
                Portal de Administración (Privado)
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal Strip */}
      <div className="w-full bg-surface-container-low border-t border-surface-container py-4">
        <div className="w-full max-w-7xl px-4 md:px-8 mx-auto flex flex-col md:flex-row items-center justify-between gap-3 font-label-telemetry text-xs text-outline">
          <div>
            <span>© {new Date().getFullYear()} WHEELS ZONE PLATFORM. TODOS LOS DERECHOS RESERVADOS.</span>
          </div>
          <div className="flex items-center gap-4">
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
