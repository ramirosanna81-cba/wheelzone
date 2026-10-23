'use client';

import React from 'react';
import Link from 'next/link';

export default function EventosPage() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5492364275322';

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-carbon-pattern">
      {/* Telemetry ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-container/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-3xl w-full mx-auto relative z-10 flex flex-col items-center text-center gap-6 sm:gap-8">
        {/* Eyebrow badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/30 text-primary-container font-label-telemetry text-xs uppercase tracking-widest font-bold">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
          <span>PADDOCK ON TOUR // CALENDARIO Y ENCUENTROS</span>
        </div>

        {/* Main Title */}
        <div className="flex flex-col gap-2">
          <h1 className="font-display-hero text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-white leading-tight">
            AGENDA DE FERIAS Y EVENTOS <span className="text-primary-container block sm:inline italic">DIECAST</span>
          </h1>
          <p className="font-body-md text-sm sm:text-base text-neutral-300 max-w-xl mx-auto leading-relaxed">
            El espacio donde publicamos las fechas, ferias, exposiciones y puntos de encuentro de coleccionistas para vernos cara a cara con el garaje completo de piezas.
          </p>
        </div>

        {/* Under Construction Race-Themed Box */}
        <div className="w-full bg-[#161618]/95 backdrop-blur-md border border-neutral-700/80 rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
          {/* Top Yellow Hazard Border Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-container via-amber-500 to-race-red"></div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary-container/15 border border-primary-container/30 flex items-center justify-center text-primary-container shadow-lg">
            <span className="material-symbols-outlined text-3xl sm:text-4xl">construction</span>
          </div>

          <div className="flex flex-col gap-2 max-w-lg">
            <span className="font-label-telemetry text-xs sm:text-sm uppercase tracking-widest text-[#FFC200] font-bold">
              SECCIÓN EN CONSTRUCCIÓN
            </span>
            <h2 className="font-display-hero text-xl sm:text-2xl md:text-3xl uppercase font-bold text-white">
              ESTAMOS ARMANDO EL CALENDARIO OFICIAL
            </h2>
            <p className="font-body-sm text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Muy pronto vas a poder consultar el cronograma con las próximas ferias de autitos a escala, convenciones diecast y encuentros en Buenos Aires, Junín, Rosario y más ciudades.
            </p>
          </div>

          {/* Features preview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left pt-2">
            <div className="p-3.5 rounded-xl bg-[#1c1c1f] border border-neutral-800 flex flex-col gap-1">
              <span className="material-symbols-outlined text-primary-container text-xl">event_available</span>
              <span className="font-label-telemetry text-xs uppercase text-white font-bold">FECHAS CONFIRMADAS</span>
              <span className="text-[11px] text-neutral-400">Días, horarios y stand de Wheels Zone.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#1c1c1f] border border-neutral-800 flex flex-col gap-1">
              <span className="material-symbols-outlined text-primary-container text-xl">map</span>
              <span className="font-label-telemetry text-xs uppercase text-white font-bold">MAPA & UBICACIÓN</span>
              <span className="text-[11px] text-neutral-400">Dirección y accesos para no perderte.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#1c1c1f] border border-neutral-800 flex flex-col gap-1">
              <span className="material-symbols-outlined text-primary-container text-xl">local_fire_department</span>
              <span className="font-label-telemetry text-xs uppercase text-white font-bold">CAJAS EXCLUSIVAS</span>
              <span className="text-[11px] text-neutral-400">Piezas RLC y STH solo disponibles en persona.</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
            <a
              href={`https://wa.me/${phone}?text=${encodeURIComponent('¡Hola Wheels Zone! Quiero que me avisen cuando publiquen la agenda de las próximas ferias y eventos diecast.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-primary-container hover:bg-amber-400 text-black font-display-hero font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,194,0,0.35)] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">chat</span>
              <span>AVISARME POR WHATSAPP</span>
            </a>
            <Link
              href="/#showroom"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#202024] hover:bg-[#28282c] border border-neutral-700 text-white font-display-hero font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-lg">storefront</span>
              <span>VISITAR SHOWROOM JUNÍN</span>
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <Link
          href="/"
          className="font-label-telemetry text-xs uppercase text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Volver al inicio</span>
        </Link>
      </div>
    </div>
  );
}
