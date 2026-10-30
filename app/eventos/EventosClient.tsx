'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DiecastEvent } from '@/lib/types';
import { fetchEvents } from '@/lib/supabase';
import EventCard from '@/components/EventCard';

interface EventosClientProps {
  initialEvents: DiecastEvent[];
}

export default function EventosClient({ initialEvents }: EventosClientProps) {
  const [events, setEvents] = useState<DiecastEvent[]>(initialEvents);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'junin' | 'especiales' | 'proximos'>('all');

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5492364275322';

  // Sync / refresh events from Supabase or local storage on mount
  useEffect(() => {
    async function loadFreshEvents() {
      try {
        const fresh = await fetchEvents(true);
        if (fresh && fresh.length > 0) {
          setEvents(fresh);
        }
      } catch (err) {
        console.warn('Error fetching events client-side:', err);
      }
    }
    loadFreshEvents();
  }, []);

  // Filter events based on search query and selected tab
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Must be active
      if (!evt.is_active) return false;

      // Text search in title or city
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          evt.title.toLowerCase().includes(q) ||
          evt.city.toLowerCase().includes(q) ||
          (evt.special_text && evt.special_text.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Tab filter
      if (activeFilter === 'junin') {
        return evt.city.toLowerCase().includes('junín') || evt.city.toLowerCase().includes('junin');
      }
      if (activeFilter === 'especiales') {
        return evt.is_special;
      }
      if (activeFilter === 'proximos') {
        const todayStr = new Date().toISOString().split('T')[0];
        return evt.start_date >= todayStr;
      }

      return true;
    });
  }, [events, searchQuery, activeFilter]);

  // Cities count for quick metrics
  const uniqueCities = useMemo(() => {
    const set = new Set(events.filter((e) => e.is_active).map((e) => e.city));
    return Array.from(set);
  }, [events]);

  const whatsappGeneralUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    '¡Hola Wheels Zone! Quiero consultar por las próximas fechas y stands en ferias diecast.'
  )}`;

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-on-surface pt-20 sm:pt-24 md:pt-28 pb-20 relative overflow-hidden">
      {/* Telemetry ambient background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-race-red/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-5 w-96 h-96 bg-primary-container/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        {/* Eyebrow Pill Badge (from Flyer reference) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1c1c1f] border border-neutral-700/80 shadow-md mb-4 sm:mb-5">
          <span className="w-2 h-2 rounded-full bg-[#FFC200] animate-ping shrink-0"></span>
          <span className="font-label-telemetry text-[11px] sm:text-xs uppercase tracking-widest text-[#FFC200] font-black">
            + PADRÓN DE FERIAS // CALENDARIO Y ENCUENTROS
          </span>
        </div>

        {/* Main Title Section */}
        <div className="text-center max-w-3xl mb-8 sm:mb-10 flex flex-col items-center">
          <h1 className="font-display-hero text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-none">
            AGENDA DE FERIAS Y EVENTOS{' '}
            <span className="text-[#FFC200] italic font-black block sm:inline drop-shadow-[0_0_20px_rgba(255,194,0,0.4)]">
              DIECAST
            </span>
          </h1>
          <p className="font-body-md text-xs sm:text-sm md:text-base text-neutral-300 max-w-2xl mx-auto mt-3 leading-relaxed">
            Encontrá nuestro stand oficial de <strong className="text-white font-bold">Wheels Zone</strong> en ferias, plazas y convenciones. Llevamos valijas completas de autitos a escala, piezas Mainline, Super Treasure Hunts ($TH), RLC y asesoramiento para coleccionistas.
          </p>
        </div>

        {/* Controls: Search and Category Pills */}
        <div className="w-full max-w-4xl mb-7 sm:mb-9 flex flex-col md:flex-row items-center justify-between gap-3 bg-[#141416]/90 p-2.5 sm:p-3 rounded-2xl border border-neutral-800 backdrop-blur-md shadow-lg">
          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <span className="material-symbols-outlined text-neutral-400 absolute left-3 top-2.5 text-lg pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar plaza, ciudad o evento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1f1f23] border border-neutral-700/80 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:border-primary-container transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-white text-xs"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-display-hero uppercase text-xs sm:text-sm tracking-wider font-extrabold whitespace-nowrap transition-all ${
                activeFilter === 'all'
                  ? 'bg-primary-container text-black shadow-md'
                  : 'bg-[#1c1c20] text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              Todas ({events.filter((e) => e.is_active).length})
            </button>
            <button
              onClick={() => setActiveFilter('junin')}
              className={`px-3 py-1.5 rounded-xl font-display-hero uppercase text-xs sm:text-sm tracking-wider font-extrabold whitespace-nowrap transition-all ${
                activeFilter === 'junin'
                  ? 'bg-primary-container text-black shadow-md'
                  : 'bg-[#1c1c20] text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              Junín ({events.filter((e) => e.is_active && (e.city.toLowerCase().includes('junín') || e.city.toLowerCase().includes('junin'))).length})
            </button>
            <button
              onClick={() => setActiveFilter('especiales')}
              className={`px-3 py-1.5 rounded-xl font-display-hero uppercase text-xs sm:text-sm tracking-wider font-extrabold whitespace-nowrap transition-all ${
                activeFilter === 'especiales'
                  ? 'bg-[#E51937] text-white shadow-md'
                  : 'bg-[#1c1c20] text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              ⭐ Especiales ({events.filter((e) => e.is_active && e.is_special).length})
            </button>
          </div>
        </div>

        {/* Event Cards Grid (Replicating exact 3-columns / 2-columns / 1-column responsive layout) */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 md:gap-4.5 w-full">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="w-full max-w-md py-12 px-6 bg-[#161618] border border-neutral-800 rounded-2xl text-center flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-neutral-500">
              event_busy
            </span>
            <span className="font-display-hero text-lg uppercase text-white font-bold">
              No se encontraron eventos
            </span>
            <p className="text-xs text-neutral-400">
              No hay ferias que coincidan con &quot;{searchQuery}&quot;. Probá restableciendo los filtros de búsqueda.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="mt-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs text-white uppercase font-bold rounded-xl transition-colors"
            >
              Ver todas las fechas
            </button>
          </div>
        )}

        {/* Action Buttons from Flyer (AVISARME POR WHATSAPP & VISITAR SHOWROOM) */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
          {/* Avisarme por WhatsApp Button (Yellow style from reference) */}
          <a
            href={whatsappGeneralUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-w-[220px] px-6 py-3.5 rounded-xl bg-[#FFC200] hover:bg-[#e6af00] active:scale-95 text-black font-display-hero font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_18px_rgba(255,194,0,0.35)] hover:shadow-[0_6px_22px_rgba(255,194,0,0.5)] transition-all select-none"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">chat</span>
            <span>AVISARME POR WHATSAPP</span>
          </a>

          {/* Visitar Showroom Button (Dark outline style from reference) */}
          <Link
            href="/showroom"
            className="w-full sm:w-auto min-w-[200px] px-6 py-3.5 rounded-xl bg-[#1a1a1e] hover:bg-[#222228] active:scale-95 border border-neutral-700 hover:border-neutral-500 text-white font-display-hero font-extrabold text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-all select-none"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl text-[#FFC200]">
              storefront
            </span>
            <span>VISITAR SHOWROOM</span>
          </Link>
        </div>

        {/* Bottom Flyer Signature & Brand Tagline */}
        <div className="mt-10 sm:mt-14 pt-6 border-t border-neutral-800/80 w-full flex flex-col items-center justify-center gap-2 text-center">
          <div className="relative h-12 w-48 sm:h-14 sm:w-56 transition-transform hover:scale-105 duration-200">
            <Image
              src="/images/logos/logo-swoosh-transparent.webp"
              alt="Wheels Zone Brand Logo"
              fill
              sizes="224px"
              className="object-contain"
              priority
            />
          </div>
          <span className="font-caveat text-xl sm:text-2xl text-neutral-300 font-bold select-none tracking-wide">
            La felicidad en diferentes escalas
          </span>
        </div>
      </div>
    </div>
  );
}

