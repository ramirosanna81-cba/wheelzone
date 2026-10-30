'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart-context';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5492364275322';
  const instagramUrl = 'https://www.instagram.com/wheelszoneok?utm_source=qr&obrf=ZjZpY3QzdmVkZ2h1';

  const navLinks = [
    { name: 'Inicio', href: '/', icon: 'home', badge: 'Portada' },
    { name: 'Tienda', href: '/tienda', icon: 'storefront', badge: 'Catálogo' },
    { name: 'Showroom', href: '/showroom', icon: 'location_on', badge: 'Junín' },
    { name: 'EVENTOS', href: '/eventos', icon: 'event', badge: 'Ferias' },
    { name: 'El Garaje', href: '/comunidad', icon: 'garage_home', badge: 'Comunidad' },
    { name: 'Encargos', href: '/#encargos', icon: 'radar', badge: 'Cacería' },
    { name: 'Panel Admin', href: '/admin', icon: 'admin_panel_settings', badge: 'Gestión' },
  ];

  // Auto-close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll and listen for Escape key when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setMobileMenuOpen(false);
      window.location.href = `/tienda?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-b border-surface-container">
        {/* Top Banner (Racing Telemetry Strip) */}
        <div className="bg-secondary-container text-on-secondary-container px-2 sm:px-4 py-1.5 sm:py-2 overflow-hidden select-none border-b border-red-700/50 shadow-sm">
          <div className="w-full flex items-center justify-center font-label-telemetry text-xs sm:text-[13px] md:text-sm uppercase tracking-wider text-center">
            <div className="flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-3 gap-y-1 font-bold">
              <span className="flex items-center gap-1.5 text-white shrink-0">
                <span>🏁</span>
                <span>ENVÍOS A TODO EL PAÍS</span>
              </span>
              <span className="text-primary-container font-black hidden xs:inline shrink-0">|</span>
              <span className="flex items-center gap-1.5 text-white shrink-0">
                <span className="animate-heartbeat bg-primary-container text-black px-2.5 py-0.5 rounded-full font-black text-[11px] sm:text-xs tracking-wide shadow-[0_0_12px_rgba(255,194,0,0.65)] shrink-0">
                  20% OFF
                </span>
                <span className="text-white font-extrabold tracking-wide">CON TRANSFERENCIA BANCARIA</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="h-16 sm:h-20 md:h-24 w-full px-3 sm:px-6 lg:px-8 mx-auto flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 max-w-[1440px]">
          {/* Official Brand Logo (Horizontal Flame Swoosh) */}
          <Link
            href="/"
            className="flex items-center gap-2 select-none group shrink-0 py-1"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative h-9 w-32 xs:h-11 xs:w-40 sm:h-16 sm:w-52 md:h-[68px] md:w-60 lg:h-[74px] lg:w-[245px] transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/images/logos/logo-swoosh-transparent.webp"
                alt="Wheels Zone Official Logo"
                fill
                sizes="(max-width: 640px) 160px, 245px"
                className="object-contain object-left drop-shadow-[0_2px_12px_rgba(229,25,55,0.25)]"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
            {navLinks.filter((l) => l.name !== 'Panel Admin').map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative font-display-hero text-[15px] xl:text-[17px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 xl:px-3.5 xl:py-2 whitespace-nowrap transition-all duration-150 rounded-lg ${
                    isActive
                      ? 'text-primary-container bg-primary-container/[0.08] after:absolute after:bottom-0.5 after:left-2 after:right-2 after:h-[2.5px] after:bg-primary-container after:rounded-full after:shadow-[0_0_8px_rgba(255,194,0,0.6)]'
                      : 'text-neutral-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar + Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Header Search input (Pill Shape on Desktop) */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-36 lg:w-44 xl:w-56 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-neutral-400 text-lg">search</span>
              </div>
              <input
                type="search"
                aria-label="Buscar autos, marcas o modelos"
                placeholder="Buscar autos, marcas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 xl:h-12 pl-10 pr-4 rounded-full bg-[#18181b] border border-[#2e2e33] text-on-surface font-body-sm text-xs xl:text-sm placeholder:text-neutral-400 focus:outline-none focus:border-primary-container transition-colors"
              />
            </form>

            {/* WhatsApp Direct Green Button (Adaptive: icon-only on mobile, full pill on sm+) */}
            <a
              href={`https://wa.me/${phone}?text=${encodeURIComponent('¡Hola Wheels Zone! Quiero consultar por disponibilidad de modelos.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-auto sm:h-10.5 xl:h-11 px-0 sm:px-4 xl:px-4.5 bg-[#128C7E] hover:bg-[#075E54] active:bg-[#075E54] text-white font-sans font-semibold text-xs sm:text-sm xl:text-[15px] rounded-full border border-white/20 flex items-center justify-center sm:justify-start gap-2 transition-all shadow-[0_2px_10px_rgba(18,140,126,0.3)] hover:shadow-[0_4px_16px_rgba(18,140,126,0.45)] hover:scale-[1.02] active:scale-95 select-none whitespace-nowrap shrink-0"
              title="Enviar mensaje por WhatsApp"
            >
              <svg className="w-4.5 h-4.5 sm:w-[21px] sm:h-[21px] fill-current text-white shrink-0" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.301-.15-1.767-.867-2.04-.966-.274-.101-.473-.15-.673.15-.197.295-.771.966-.944 1.162-.175.197-.349.222-.65.074-.301-.15-1.27-.467-2.42-1.485-.896-.795-1.501-1.777-1.677-2.077-.175-.3-.019-.461.13-.61.134-.133.301-.347.451-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.01-.371-.01-.571-.01-.2 0-.523.074-.797.372-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Instagram Direct Button */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 xl:w-11 xl:h-11 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center transition-all shadow-[0_2px_10px_rgba(220,39,67,0.3)] hover:shadow-[0_4px_16px_rgba(220,39,67,0.5)] hover:scale-105 active:scale-95 shrink-0"
              title="Seguinos en Instagram @wheelszoneok"
              aria-label="Instagram Wheels Zone"
            >
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* Cart Button with Counter */}
            <button
              onClick={openCart}
              className="relative w-9 h-9 sm:w-11 sm:h-11 xl:w-12 xl:h-12 flex items-center justify-center rounded-xl bg-surface-container/60 hover:bg-surface-container text-white hover:text-primary-container border border-neutral-700/80 hover:border-neutral-500 transition-all shrink-0 active:scale-95"
              aria-label="Abrir Carrito"
            >
              <span className="material-symbols-outlined text-lg sm:text-2xl">shopping_cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 px-1 bg-race-red text-white text-[9px] sm:text-[11px] font-bold rounded-full flex items-center justify-center leading-none shadow-md">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Functional Animated Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-xl bg-surface-container/80 hover:bg-surface-container text-white border border-neutral-700/80 hover:border-primary-container transition-all focus:outline-none focus:ring-2 focus:ring-primary-container/40 active:scale-95 shrink-0"
              aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
            >
              <span
                className={`w-4 sm:w-5 h-0.5 bg-current rounded-full transition-transform duration-300 ease-in-out ${
                  mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              />
              <span
                className={`w-4 sm:w-5 h-0.5 bg-current rounded-full transition-opacity duration-200 ease-in-out ${
                  mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`w-4 sm:w-5 h-0.5 bg-current rounded-full transition-transform duration-300 ease-in-out ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation-menu"
            className="lg:hidden w-full bg-[#121215]/98 border-t border-surface-container shadow-[0_20px_60px_rgba(0,0,0,0.95)] max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain transition-all duration-200 ease-out origin-top"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {/* Search Input in Mobile Menu */}
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-neutral-400 text-lg pointer-events-none">
                  search
                </span>
                <input
                  type="search"
                  aria-label="Buscar modelo, marca, STH o RLC"
                  placeholder="Buscar modelo, marca, STH, RLC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-20 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm placeholder:text-neutral-400 focus:outline-none focus:border-primary-container"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 h-8 px-3 bg-primary-container hover:bg-surface-tint text-on-primary-container font-headline-sm uppercase text-xs font-bold rounded-lg transition-colors"
                >
                  Buscar
                </button>
              </form>

              {/* Navigation Links List */}
              <div className="flex flex-col gap-1 border-t border-surface-container pt-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'text-primary-container bg-primary-container/[0.12] border-l-4 border-primary-container font-bold'
                          : 'text-neutral-200 hover:text-white hover:bg-surface-container active:bg-surface-container-high font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-xl ${isActive ? 'text-primary-container' : 'text-neutral-400'}`}>
                          {link.icon}
                        </span>
                        <span className="font-display-hero text-lg uppercase tracking-wider">
                          {link.name}
                        </span>
                      </div>

                      <span
                        className={`font-label-telemetry text-[10px] uppercase px-2 py-0.5 rounded ${
                          isActive
                            ? 'bg-primary-container/20 text-primary-container font-bold'
                            : 'bg-surface-container text-outline'
                        }`}
                      >
                        {link.badge}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Quick Action Buttons Grid inside Mobile Drawer */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-container">
                {/* WhatsApp Quick Action */}
                <a
                  href={`https://wa.me/${phone}?text=${encodeURIComponent('¡Hola Wheels Zone! Quiero consultar por disponibilidad de modelos.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-2 bg-[#128C7E] hover:bg-[#075E54] active:bg-[#075E54] text-white rounded-xl flex items-center justify-center gap-1.5 font-sans font-semibold text-xs shadow-md transition-colors"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.301-.15-1.767-.867-2.04-.966-.274-.101-.473-.15-.673.15-.197.295-.771.966-.944 1.162-.175.197-.349.222-.65.074-.301-.15-1.27-.467-2.42-1.485-.896-.795-1.501-1.777-1.677-2.077-.175-.3-.019-.461.13-.61.134-.133.301-.347.451-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.01-.371-.01-.571-.01-.2 0-.523.074-.797.372-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>

                {/* Instagram Quick Action */}
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-2 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white rounded-xl flex items-center justify-center gap-1.5 font-sans font-semibold text-xs shadow-md transition-colors"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Instagram</span>
                </a>

                {/* View Cart Quick Action */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openCart();
                  }}
                  className="py-2.5 px-2 bg-surface-container hover:bg-surface-container-high active:bg-surface-container-highest text-white border border-surface-container-highest rounded-xl flex items-center justify-center gap-1.5 font-display-hero uppercase text-xs tracking-wider transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-primary-container">shopping_cart</span>
                  <span>Carrito ({totalItems})</span>
                </button>
              </div>

              {/* Bottom Telemetry Status in Drawer */}
              <div className="bg-surface-container-lowest/80 border border-surface-container p-2.5 rounded-xl flex flex-col gap-1 text-[11px] font-label-telemetry text-outline">
                <div className="flex items-center gap-1.5 text-secondary">
                  <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse shrink-0"></span>
                  <span className="font-bold uppercase">Showroom Junín // Atención Abierta</span>
                </div>
                <span className="text-[10px] text-on-surface-variant truncate">
                  Av. San Martín & Zona Centro • Junín, Bs. As.
                </span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Backdrop Overlay for Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
