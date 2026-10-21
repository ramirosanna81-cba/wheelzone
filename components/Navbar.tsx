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
    { name: 'Admin', href: '/admin' },
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
      <div className="h-20 w-full px-4 md:px-6 lg:px-8 mx-auto flex items-center justify-between gap-3 sm:gap-4 max-w-7xl">
        {/* Official Brand Logo (Horizontal Flame Swoosh) */}
        <Link href="/" className="flex items-center gap-2 select-none group shrink-0">
          <div className="relative h-11 w-40 sm:h-12 sm:w-48 transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/images/logos/logo-swoosh-transparent.png"
              alt="Wheels Zone Official Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-6 shrink-0">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-label-telemetry text-xs uppercase tracking-wider py-1 whitespace-nowrap transition-all ${
                  isActive
                    ? 'text-primary-container font-bold border-b-2 border-primary-container'
                    : 'text-neutral-300 hover:text-white'
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
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-neutral-400 text-base">search</span>
            </div>
            <input
              type="search"
              placeholder="Buscar autos, marcas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#18181b] border border-[#27272a] text-on-surface font-body-sm text-xs placeholder:text-neutral-400 focus:outline-none focus:border-primary-container transition-colors"
            />
          </form>

          {/* WhatsApp Direct Green Button */}
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent('¡Hola Wheels Zone! Quiero consultar por disponibilidad de modelos.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8.5 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-lg flex items-center gap-1.5 font-sans text-xs transition-colors shadow-md select-none whitespace-nowrap shrink-0"
            title="Contactanos por WhatsApp"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.933 2.796.933 3.183 0 5.768-2.587 5.769-5.766.001-3.182-2.585-5.77-5.769-5.77zm0 10.377c-.779 0-1.637-.282-2.428-.751l-.174-.103-1.579.414.421-1.54-.113-.18c-.523-.834-.844-1.673-.843-2.6 0-2.508 2.041-4.549 4.55-4.549 2.509 0 4.55 2.041 4.55 4.549 0 2.51-2.041 4.55-4.55 4.55zm-1.89-6.38c-.105-.233-.217-.238-.318-.242-.083-.004-.177-.004-.271-.004s-.248.035-.378.177c-.13.141-.497.485-.497 1.183 0 .698.509 1.372.579 1.466.071.094 1.002 1.53 2.427 2.146.339.146.604.234.811.3.342.108.653.093.899.056.275-.041.846-.346.965-.68.119-.335.119-.622.084-.68-.035-.059-.13-.094-.271-.165s-.846-.418-.977-.465c-.13-.047-.225-.07-.32.071-.095.141-.367.465-.45.559-.083.094-.166.106-.307.035-.141-.07-.597-.22-.1.137-.39-.99-.885-.14-.24-.015-.369.056-.479.071-.11.141-.188.212-.283.07-.094.094-.165.141-.271.047-.106.024-.199-.012-.271-.035-.071-.318-.765-.436-1.048z" />
            </svg>
            <span>WhatsApp</span>
          </a>

          {/* Cart Button with Red Circular Counter */}
          <button
            onClick={openCart}
            className="relative p-2 text-white hover:text-primary-container transition-colors shrink-0"
            aria-label="Abrir Carrito"
          >
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-race-red text-white text-[11px] font-bold rounded-full flex items-center justify-center leading-none shadow-md">
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
              className={`px-3 py-2 text-sm font-headline-sm uppercase tracking-wider ${
                pathname === link.href
                  ? 'text-primary-container bg-surface-container-high font-bold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
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
            className="mt-2 px-3.5 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.933 2.796.933 3.183 0 5.768-2.587 5.769-5.766.001-3.182-2.585-5.77-5.769-5.77zm0 10.377c-.779 0-1.637-.282-2.428-.751l-.174-.103-1.579.414.421-1.54-.113-.18c-.523-.834-.844-1.673-.843-2.6 0-2.508 2.041-4.549 4.55-4.549 2.509 0 4.55 2.041 4.55 4.549 0 2.51-2.041 4.55-4.55 4.55zm-1.89-6.38c-.105-.233-.217-.238-.318-.242-.083-.004-.177-.004-.271-.004s-.248.035-.378.177c-.13.141-.497.485-.497 1.183 0 .698.509 1.372.579 1.466.071.094 1.002 1.53 2.427 2.146.339.146.604.234.811.3.342.108.653.093.899.056.275-.041.846-.346.965-.68.119-.335.119-.622.084-.68-.035-.059-.13-.094-.271-.165s-.846-.418-.977-.465c-.13-.047-.225-.07-.32.071-.095.141-.367.465-.45.559-.083.094-.166.106-.307.035-.141-.07-.597-.22-.1.137-.39-.99-.885-.14-.24-.015-.369.056-.479.071-.11.141-.188.212-.283.07-.094.094-.165.141-.271.047-.106.024-.199-.012-.271-.035-.071-.318-.765-.436-1.048z" />
            </svg>
            <span>WhatsApp</span>
          </a>
        </div>
      )}
    </header>
  );
}
