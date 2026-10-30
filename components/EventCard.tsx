'use client';

import React from 'react';
import Image from 'next/image';
import { DiecastEvent } from '@/lib/types';

interface EventCardProps {
  event: DiecastEvent;
  className?: string;
  onSelect?: () => void;
}

export function parseEventDate(dateStr: string) {
  if (!dateStr) {
    return { dayOfWeek: 'SÁB', dayNum: '01', monthName: 'OCT' };
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dateObj = new Date(Date.UTC(y, m, d, 12, 0, 0));
    const days = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return {
      dayOfWeek: days[dateObj.getUTCDay()],
      dayNum: String(d).padStart(2, '0'),
      monthName: months[m] || 'OCT',
    };
  }
  return { dayOfWeek: 'EVT', dayNum: '--', monthName: '---' };
}

export default function EventCard({ event, className = '', onSelect }: EventCardProps) {
  const { dayOfWeek, dayNum, monthName } = parseEventDate(event.start_date);

  // Check if special badge is mother's day / gift or exclusive meet
  const specialText = event.special_text || 'ESPECIAL';
  const isMotherOrGift =
    specialText.toUpperCase().includes('MADRE') ||
    specialText.toUpperCase().includes('REGALO') ||
    specialText.toUpperCase().includes('SORTEO');

  const isExclusive =
    specialText.toUpperCase().includes('EXCLUSIVO') ||
    specialText.toUpperCase().includes('ENCUENTRO') ||
    specialText.toUpperCase().includes('PREMIUM');

  const handleCardClick = () => {
    if (onSelect) {
      onSelect();
    } else if (event.maps_url) {
      window.open(event.maps_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-[#18181b]/95 hover:bg-[#202024] border border-[#2e2e33] hover:border-neutral-600/90 rounded-2xl p-2.5 sm:p-3 md:p-3.5 flex items-center gap-2.5 sm:gap-3 md:gap-3.5 transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.45)] hover:shadow-[0_8px_30px_rgba(229,25,55,0.15)] hover:-translate-y-0.5 cursor-pointer select-none overflow-hidden ${className}`}
      title={event.maps_url ? 'Click para ver ubicación en Google Maps' : event.title}
    >
      {/* Subtle top edge glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-primary-container/40 transition-colors"></div>

      {/* 1. Vertical Date Block on Left */}
      <div className="w-[58px] sm:w-[64px] h-[84px] sm:h-[90px] shrink-0 rounded-xl overflow-hidden flex flex-col shadow-md border border-neutral-700/60 bg-white">
        {/* Red Day of Week Header */}
        <div className="bg-[#E51937] text-white h-[26px] sm:h-[28px] flex items-center justify-center font-display-hero font-extrabold text-xs sm:text-[13px] tracking-wider uppercase select-none px-1">
          {dayOfWeek}
        </div>
        {/* White Day & Month Body */}
        <div className="flex-1 bg-white flex flex-col items-center justify-center text-center px-0.5 py-0.5 leading-none">
          <span className="font-display-hero font-black text-2xl sm:text-[28px] text-neutral-900 tracking-tight leading-none">
            {dayNum}
          </span>
          <span className="font-display-hero font-extrabold text-[11px] sm:text-xs text-neutral-900 uppercase tracking-widest leading-none mt-1">
            {monthName}
          </span>
        </div>
      </div>

      {/* 2. Photo Thumbnail at Center */}
      <div className="relative w-24 sm:w-28 md:w-32 h-[84px] sm:h-[90px] shrink-0 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-inner">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            sizes="(max-width: 640px) 96px, 128px"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800 text-neutral-500">
            <span className="material-symbols-outlined text-2xl">event</span>
            <span className="text-[10px] uppercase font-bold">Sin foto</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* 3. Typography Hierarchy at Right */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-[84px] sm:h-[90px] py-0.5">
        {/* Top Header Row: Title + Special Badge */}
        <div className="flex items-start justify-between gap-1.5 sm:gap-2">
          <h3 className="font-display-hero font-black text-sm sm:text-base md:text-[17px] uppercase tracking-wide text-white leading-tight line-clamp-2 pr-1">
            {event.title}
          </h3>

          {/* Special Event Badge on Top Right */}
          {event.is_special && (
            <div className="shrink-0 text-right">
              {isExclusive ? (
                <div className="bg-[#FFC200] text-black font-display-hero font-black text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 sm:py-1 rounded-md shadow-sm flex items-center gap-1 leading-tight whitespace-nowrap">
                  <span className="material-symbols-outlined text-xs">bolt</span>
                  <div className="flex flex-col text-left leading-none">
                    <span>{specialText.split(' ')[0] || 'ENCUENTRO'}</span>
                    <span className="text-[8px] opacity-90">{specialText.split(' ').slice(1).join(' ') || 'EXCLUSIVO'}</span>
                  </div>
                </div>
              ) : isMotherOrGift ? (
                <div className="bg-[#E51937] text-white font-display-hero font-black text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 sm:py-1 rounded-md shadow-sm flex items-center gap-1 leading-tight whitespace-nowrap">
                  <span className="material-symbols-outlined text-xs sm:text-sm">redeem</span>
                  <div className="flex flex-col text-left leading-none">
                    <span>ESPECIAL</span>
                    <span className="text-[8px] text-white/90">DÍA DE LA MADRE</span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#E51937] text-white font-display-hero font-black text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 sm:py-1 rounded-md shadow-sm flex items-center gap-1 leading-tight whitespace-nowrap">
                  <span className="material-symbols-outlined text-xs">stars</span>
                  <span>{specialText}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location & Time with Icons */}
        <div className="flex flex-col gap-0.5 sm:gap-1 mt-auto">
          {/* City with Map Pin Icon */}
          <div className="flex items-center gap-1.5 text-neutral-300 font-sans text-xs sm:text-[13px] font-semibold truncate">
            <span className="material-symbols-outlined text-[#FFC200] text-base shrink-0">
              location_on
            </span>
            <span className="truncate">{event.city}</span>
            {event.maps_url && (
              <span className="text-[10px] text-neutral-400 group-hover:text-[#FFC200] transition-colors ml-1 hidden xs:inline flex items-center gap-0.5 font-normal">
                (ver mapa <span className="material-symbols-outlined text-[10px]">open_in_new</span>)
              </span>
            )}
          </div>

          {/* Time with Clock Icon */}
          <div className="flex items-center gap-1.5 text-neutral-300 font-sans text-xs sm:text-[13px] font-semibold truncate">
            <span className="material-symbols-outlined text-[#FFC200] text-base shrink-0">
              schedule
            </span>
            <span className="truncate">{event.time_text || '15:00 hs'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

