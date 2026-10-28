'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';

interface CategoryViewClientProps {
  products: Product[];
  categorySlug: string;
  categoryTitle: string;
  categoryDescription: string;
}

const PAGE_SIZE = 24;

export default function CategoryViewClient({
  products,
  categorySlug,
  categoryTitle,
  categoryDescription,
}: CategoryViewClientProps) {
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  const filteredAndSorted = useMemo(() => {
    return products
      .filter((p) => {
        if (p.activo === false) return false;
        if (onlyInStock && p.stock <= 0) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.precio - b.precio;
        if (sortBy === 'price-desc') return b.precio - a.precio;
        if (sortBy === 'name-asc') return a.modelo.localeCompare(b.modelo);
        return (new Date(b.created_at || '').getTime() || 0) - (new Date(a.created_at || '').getTime() || 0);
      });
  }, [products, onlyInStock, sortBy]);

  const displayedProducts = useMemo(() => {
    return filteredAndSorted.slice(0, visibleCount);
  }, [filteredAndSorted, visibleCount]);

  return (
    <div className="w-full flex flex-col pb-20">
      {/* Top Banner & Breadcrumb */}
      <section className="w-full bg-[#0E0E10] border-b border-surface-container py-8 sm:py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-diamond-plate opacity-10 pointer-events-none"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-label-telemetry text-xs text-neutral-400 flex-wrap">
            <Link href="/" className="hover:text-primary-container transition-colors">
              Inicio
            </Link>
            <span className="text-neutral-600">/</span>
            <Link href="/tienda" className="hover:text-primary-container transition-colors">
              Colección
            </Link>
            <span className="text-neutral-600">/</span>
            <span className="text-primary-container font-bold uppercase">{categoryTitle}</span>
          </nav>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-primary-container rounded-sm shadow-[0_0_8px_rgba(255,194,0,0.6)]"></span>
              <span className="font-label-telemetry text-xs uppercase tracking-widest text-primary-container font-bold">
                COLECCIÓN ESPECIALIZADA
              </span>
            </div>
            <h1 className="font-display-hero text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white font-black">
              {categoryTitle}
            </h1>
            <p className="font-body-md text-xs sm:text-sm md:text-base text-neutral-300 max-w-2xl leading-relaxed">
              {categoryDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="w-full max-w-7xl px-4 sm:px-6 md:px-8 mx-auto py-6 sm:py-8 flex flex-col gap-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-surface-container font-label-telemetry text-xs">
          <div className="flex items-center gap-3">
            <span className="text-neutral-400 uppercase">
              {filteredAndSorted.length} modelos encontrados
            </span>
            <span className="text-neutral-600">|</span>
            <label className="flex items-center gap-2 cursor-pointer text-neutral-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded bg-surface-container-highest border-neutral-700 text-primary-container focus:ring-0 cursor-pointer"
              />
              <span>Sólo en Stock</span>
            </label>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-neutral-400 uppercase">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-container-low border border-surface-container text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-primary-container text-xs cursor-pointer font-sans"
            >
              <option value="newest">Más recientes</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="name-asc">Nombre A-Z</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {displayedProducts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-3 bg-surface-container-lowest border border-surface-container p-8">
            <span className="material-symbols-outlined text-4xl text-neutral-500">search_off</span>
            <h3 className="font-headline-md text-base sm:text-lg text-white uppercase">
              No se encontraron piezas en este momento
            </h3>
            <p className="font-body-sm text-xs text-neutral-400 max-w-md">
              Actualmente no tenemos modelos disponibles en esta categoría o están agotados. Podés explorar todo el catálogo o consultarnos por WhatsApp.
            </p>
            <Link
              href="/tienda"
              className="mt-2 px-5 py-2.5 rounded-lg bg-primary-container text-black font-label-telemetry text-xs uppercase font-extrabold hover:bg-amber-300 transition-colors"
            >
              Ver Catálogo Completo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {displayedProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={idx < 4}
                onOpenModal={(p) => setSelectedProductModal(p)}
              />
            ))}
          </div>
        )}

        {/* Paginación progresiva */}
        {displayedProducts.length < filteredAndSorted.length && (
          <div className="flex flex-col items-center justify-center gap-3.5 pt-6 pb-2">
            <div className="flex items-center gap-2 font-label-telemetry text-xs text-neutral-400">
              <span>Mostrando</span>
              <span className="text-primary-container font-bold">{displayedProducts.length}</span>
              <span>de</span>
              <span className="text-white font-bold">{filteredAndSorted.length}</span>
              <span>piezas</span>
            </div>
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredAndSorted.length))}
              className="px-8 py-3 bg-surface-container-high hover:bg-surface-container-highest active:scale-95 text-on-surface font-display-hero uppercase text-xs sm:text-sm tracking-wider font-extrabold flex items-center gap-2 border border-surface-container-highest transition-all shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-primary-container">expand_more</span>
              <span>CARGAR MÁS MODELOS ({filteredAndSorted.length - displayedProducts.length} RESTANTES)</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal interactivo */}
      <ProductModal
        product={selectedProductModal}
        onClose={() => setSelectedProductModal(null)}
      />
    </div>
  );
}
