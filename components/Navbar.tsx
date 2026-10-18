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
    { name: 'Tienda & Catálogo', href: '/tienda' },
    { name: 'Showroom Junín', href: '/#showroom' },
    { name: 'El Garaje (Comunidad)', href: '/comunidad' },
    { name: 'Encargos Especiales', href: '/#encargos' },
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
      <div className="bg-secondary-container text-on-secondary-container px-4 py-1 overflow-hidden select-none">
        <div className="w-full flex items-center justify-between font-label-telemetry text-xs uppercase tracking-wider">
          <div className="flex items-center gap-6 animate-pulse whitespace-nowrap overflow-x-auto">
            <span>🔥 Envíos a todo el país en blíster protegido</span>
            <span className="text-primary-container">//</span>
            <span>💳 10% OFF pagando con Transferencia Bancaria</span>
            <span className="text-primary-container">//</span>
            <span>📍 Retiros sin costo: Rioja 281, Junín</span>
            <span className="text-primary-container">//</span>
            <span>⚡ Stock 100% verificado y garantizado C-10</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 pl-4">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
            <span className="text-on-secondary-container font-bold">TELÉMETRIA DE STOCK EN VIVO</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="h-20 w-full px-4 md:px-8 mx-auto flex items-center justify-between gap-4 max-w-7xl">
        {/* Official Brand Logo */}
        <Link href="/" className="flex items-center gap-2 select-none group">
          <div className="relative h-12 w-12 md:h-14 md:w-14 overflow-hidden rounded-full border border-primary-container/40 group-hover:border-primary-container transition-colors shadow-lg shadow-primary-container/10">
            <Image
              src="/images/logos/logo-badge-dark.jpg"
              alt="Wheels Zone Emblema Oficial"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display-hero text-2xl md:text-3xl uppercase tracking-tighter text-on-surface leading-none group-hover:text-primary transition-colors">
              WHEELS<span className="text-primary-container">ZONE</span>
            </span>
            <span className="font-label-telemetry text-[10px] uppercase tracking-widest text-outline">
              DIE-CAST & HOT WHEELS COLLECTIBLES
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-label-telemetry text-xs uppercase tracking-wider px-3 py-1.5 transition-all ${
                  isActive
                    ? 'text-primary-container bg-surface-container-high font-bold border-b-2 border-primary-container'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Search Bar + Actions */}
        <div className="flex items-center gap-3">
          {/* Header Search input */}
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-56 lg:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline text-lg">search</span>
            </div>
            <input
              type="search"
              placeholder="Buscar casting, serie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-surface-container-high text-on-surface font-body-sm text-xs placeholder:text-outline focus:outline-none focus:border-primary-container transition-colors"
            />
          </form>

          {/* WhatsApp Pit Support Button */}
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent('¡Hola Wheels Zone! Quiero consultar por disponibilidad de modelos.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-surface-container-highest flex items-center gap-1.5 font-label-telemetry text-xs font-bold uppercase tracking-wider transition-colors select-none"
            title="Soporte WhatsApp Pit Crew"
          >
            <span className="material-symbols-outlined text-primary-container text-base">support_agent</span>
            <span className="hidden sm:inline">WHATSAPP PIT</span>
          </a>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="h-9 px-3.5 bg-primary-container hover:bg-surface-tint active:scale-95 text-on-primary-container font-label-telemetry text-xs tracking-wider font-bold uppercase flex items-center gap-1.5 transition-all shadow-md select-none"
          >
            <span className="material-symbols-outlined text-base">shopping_cart</span>
            <span className="hidden sm:inline">CARRITO</span>
            <span className="px-1.5 py-0.5 bg-on-primary-container text-primary-container text-xs font-bold leading-none">
              {totalItems}
            </span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-on-surface-variant hover:text-on-surface focus:outline-none"
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
          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-2">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg">search</span>
            <input
              type="search"
              placeholder="Buscar casting, serie, año..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-surface-container-low border border-surface-container-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:border-primary-container"
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
        </div>
      )}
    </header>
  );
}
