'use client';

import React, { useState } from 'react';
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

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Tienda', href: '/tienda' },
    { name: 'Showroom', href: '/#showroom' },
    { name: 'El Garaje', href: '/comunidad' },
    { name: 'Encargos', href: '/#encargos' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/tienda?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-b border-surface-container">
      {/* Top Banner (Racing Telemetry Strip) */}
      <div className="bg-secondary-container text-on-secondary-container px-4 py-1.5 overflow-hidden select-none">
        <div className="w-full flex items-center justify-center font-label-telemetry text-xs uppercase tracking-wider text-center">
          <div className="flex items-center gap-2 font-bold whitespace-nowrap overflow-x-auto">
            <span>🏁 ENVÍOS A TODO EL PAÍS</span>
            <span className="text-primary-container font-normal">|</span>
            <span>TU PASIÓN POR EL COLECCIONISMO, SIEMPRE MÁS CERCA</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="h-20 sm:h-22 md:h-24 w-full px-4 sm:px-6 lg:px-8 mx-auto flex items-center justify-between gap-3 sm:gap-4 lg:gap-6 max-w-[1440px]">
        {/* Official Brand Logo (Horizontal Flame Swoosh) */}
        <Link href="/" className="flex items-center gap-2 select-none group shrink-0 py-1">
          <div className="relative h-13 w-44 sm:h-16 sm:w-52 md:h-[68px] md:w-60 lg:h-[74px] lg:w-[245px] transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/images/logos/logo-swoosh-transparent.png"
              alt="Wheels Zone Official Logo"
              fill
              className="object-contain object-left drop-shadow-[0_2px_12px_rgba(229,25,55,0.25)]"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 shrink-0">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative font-display-hero text-base xl:text-[17px] font-extrabold uppercase tracking-wider px-3.5 py-2 xl:px-4 xl:py-2.5 whitespace-nowrap transition-all duration-150 rounded-lg ${
                  isActive
                    ? 'text-primary-container bg-primary-container/[0.08] after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-[2.5px] after:bg-primary-container after:rounded-full after:shadow-[0_0_8px_rgba(255,194,0,0.6)]'
                    : 'text-neutral-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Search Bar + Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Header Search input (Pill Shape) */}
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-36 lg:w-44 xl:w-56 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-neutral-400 text-lg">search</span>
            </div>
            <input
              type="search"
              placeholder="Buscar autos, marcas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 xl:h-12 pl-10 pr-4 rounded-full bg-[#18181b] border border-[#2e2e33] text-on-surface font-body-sm text-xs xl:text-sm placeholder:text-neutral-400 focus:outline-none focus:border-primary-container transition-colors"
            />
          </form>

          {/* WhatsApp Direct Green Button */}
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent('¡Hola Wheels Zone! Quiero consultar por disponibilidad de modelos.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10.5 xl:h-11 px-4 xl:px-4.5 bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1da851] text-white font-sans font-semibold text-sm xl:text-[15px] rounded-full border border-white/15 flex items-center gap-2.5 transition-all shadow-[0_2px_10px_rgba(37,211,102,0.25)] hover:shadow-[0_4px_16px_rgba(37,211,102,0.4)] hover:scale-[1.02] active:scale-95 select-none whitespace-nowrap shrink-0"
            title="Enviar mensaje por WhatsApp"
          >
            <svg className="w-[21px] h-[21px] fill-current text-white shrink-0" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.301-.15-1.767-.867-2.04-.966-.274-.101-.473-.15-.673.15-.197.295-.771.966-.944 1.162-.175.197-.349.222-.65.074-.301-.15-1.27-.467-2.42-1.485-.896-.795-1.501-1.777-1.677-2.077-.175-.3-.019-.461.13-.61.134-.133.301-.347.451-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.01-.371-.01-.571-.01-.2 0-.523.074-.797.372-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>Enviar WhatsApp</span>
          </a>

          {/* Cart Button with Red Circular Counter */}
          <button
            onClick={openCart}
            className="relative w-11 h-11 xl:w-12 xl:h-12 flex items-center justify-center rounded-xl bg-surface-container/60 hover:bg-surface-container text-white hover:text-primary-container border border-neutral-700/80 hover:border-neutral-500 transition-all shrink-0"
            aria-label="Abrir Carrito"
          >
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-race-red text-white text-[11px] font-bold rounded-full flex items-center justify-center leading-none shadow-md">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface focus:outline-none shrink-0"
            aria-label="Abrir Menú"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-surface-container-lowest border-t border-surface-container px-4 py-4 flex flex-col gap-2 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-2">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-lg">search</span>
            <input
              type="search"
              placeholder="Buscar autos, marcas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-full bg-surface-container-low border border-surface-container-high text-on-surface text-sm placeholder:text-neutral-400 focus:outline-none focus:border-primary-container"
            />
          </form>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2.5 text-base font-display-hero uppercase tracking-wider rounded-md transition-colors ${
                pathname === link.href
                  ? 'text-primary-container bg-surface-container-high font-bold border-l-4 border-primary-container'
                  : 'text-neutral-200 hover:text-white hover:bg-surface-container-low font-semibold'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent('¡Hola Wheels Zone! Quiero consultar por disponibilidad de modelos.')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1da851] text-white rounded-xl flex items-center justify-center gap-2.5 font-sans font-semibold text-sm shadow-sm transition-colors"
          >
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.301-.15-1.767-.867-2.04-.966-.274-.101-.473-.15-.673.15-.197.295-.771.966-.944 1.162-.175.197-.349.222-.65.074-.301-.15-1.27-.467-2.42-1.485-.896-.795-1.501-1.777-1.677-2.077-.175-.3-.019-.461.13-.61.134-.133.301-.347.451-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.01-.371-.01-.571-.01-.2 0-.523.074-.797.372-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>Enviar WhatsApp</span>
          </a>
        </div>
      )}
    </header>
  );
}
