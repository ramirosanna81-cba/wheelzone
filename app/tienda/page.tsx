'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Product, BlisterCondition } from '@/lib/types';
import { fetchProducts } from '@/lib/supabase';
import { useCart } from '@/lib/cart-context';
import {
  CATALOG_BRANDS,
  CATALOG_SCALES,
  CATALOG_THEMES,
  matchesBrand,
} from '@/lib/catalog-constants';

function TiendaContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialBrand = searchParams.get('marca') || searchParams.get('brand') || '';
  const initialCategory = searchParams.get('categoria') || searchParams.get('category') || '';
  const initialScale = searchParams.get('escala') || searchParams.get('scale') || '';

  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(initialSearch);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrand ? [initialBrand] : []);
  const [selectedScales, setSelectedScales] = useState<string[]>(initialScale ? [initialScale] : []);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  // Dynamic maximum price based on inventory
  const maxCatalogPrice = useMemo(() => {
    if (products.length === 0) return 100000;
    const highest = Math.max(...products.map((p) => p.precio || 0));
    return Math.max(80000, Math.ceil(highest / 10000) * 10000);
  }, [products]);

  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>('newest');

  // UI state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5492364275322';

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProducts();
        setProducts(data);
        if (data && data.length > 0) {
          const highest = Math.max(...data.map((p) => p.precio || 0));
          const ceiling = Math.max(80000, Math.ceil(highest / 10000) * 10000);
          setMaxPrice(ceiling);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Update filter states if query param changes
  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
    if (initialBrand) setSelectedBrands([initialBrand]);
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialScale) setSelectedScales([initialScale]);
  }, [initialSearch, initialBrand, initialCategory, initialScale]);

  // Brand toggle
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Scale toggle
  const toggleScale = (scale: string) => {
    setSelectedScales((prev) =>
      prev.includes(scale) ? prev.filter((s) => s !== scale) : [...prev, scale]
    );
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedBrands([]);
    setSelectedScales([]);
    setSelectedCategory('');
    setMaxPrice(maxCatalogPrice);
    setOnlyInStock(false);
  };

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Customer store visibility check
        if (p.activo === false) return false;

        // Stock check
        if (onlyInStock && p.stock <= 0) return false;

        // Price check (only filter if slider was moved below catalog ceiling)
        if (maxPrice < maxCatalogPrice && p.precio > maxPrice) return false;

        // Text search
        if (search.trim()) {
          const q = search.toLowerCase();
          const match =
            p.modelo.toLowerCase().includes(q) ||
            p.marca.toLowerCase().includes(q) ||
            p.categoria.toLowerCase().includes(q) ||
            (p.serie && p.serie.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Brand & Category check (synchronized with catalog constants)
        if (selectedBrands.length > 0) {
          const brandMatch = selectedBrands.some((cat) => matchesBrand(p, cat));
          if (!brandMatch) return false;
        }

        // Scale check
        if (selectedScales.length > 0 && !selectedScales.includes(p.escala)) {
          return false;
        }

        // Category / Motorsport Theme
        if (selectedCategory) {
          const catLower = (p.categoria || '').toLowerCase();
          const selLower = selectedCategory.toLowerCase();
          const matchesCategory =
            catLower.includes(selLower) ||
            (selLower === 'básicos' && (catLower.includes('básico') || catLower.includes('mainline')));
          if (!matchesCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.precio - b.precio;
        if (sortBy === 'price-desc') return b.precio - a.precio;
        if (sortBy === 'name-asc') return a.modelo.localeCompare(b.modelo);
        return (new Date(b.created_at || '').getTime() || 0) - (new Date(a.created_at || '').getTime() || 0);
      });
  }, [products, search, selectedBrands, selectedScales, selectedCategory, maxPrice, maxCatalogPrice, onlyInStock, sortBy]);

  const getWhatsAppProductUrl = (product: Product) => {
    const msg = `¡Hola Wheels Zone! Quiero comprar la siguiente pieza:\n*${product.modelo}*\nMarca: ${product.marca} | Escala: ${product.escala}\nPrecio: $${product.precio.toLocaleString('es-AR')}\nCondición: Nuevo en empaque original\n¿Me confirman disponibilidad para despacho en caja protegida?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const BRANDS_LIST = CATALOG_BRANDS;
  const SCALES_LIST = CATALOG_SCALES;
  const THEMES_LIST = CATALOG_THEMES;

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Top Telemetry Strip */}
      <section className="w-full bg-surface-container-lowest px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 border-b border-surface-container">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-[10px] sm:text-xs font-label-telemetry">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
              <span className="text-primary-container font-bold uppercase">LIVE INVENTORY PADDOCK</span>
            </div>
            <span className="text-outline-variant hidden xs:inline">//</span>
            <span className="text-on-surface-variant uppercase hidden xs:inline">SERIE 2024 - BATCH IMPORTADO</span>
          </div>
          <div className="flex items-center gap-3 text-outline">
            <span className="flex items-center gap-1 text-secondary">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              CARD PROTECTOR CASE INCLUIDO
            </span>
            <span className="hidden md:inline text-primary-container">
              10% OFF EN TRANSFERENCIA
            </span>
          </div>
        </div>
      </section>

      {/* Main Store Layout: 12-Column Grid */}
      <div className="w-full max-w-7xl px-3 sm:px-6 md:px-8 mx-auto py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* ==============================================================================
            SIDEBAR DE FILTROS EN TIEMPO REAL
        ============================================================================== */}
        <aside
          className={`lg:col-span-3 flex flex-col gap-4 ${
            mobileFilterOpen
              ? 'fixed inset-0 z-50 bg-surface-container-lowest p-4 sm:p-6 overflow-y-auto'
              : 'hidden lg:flex'
          }`}
        >
          {/* Mobile Filter Close button */}
          {mobileFilterOpen && (
            <div className="flex items-center justify-between pb-3 border-b border-surface-container lg:hidden">
              <span className="font-headline-md uppercase text-on-surface text-lg">Filtros de Catálogo</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
          )}

          {/* Search Box */}
          <div className="bg-surface-container-low border border-surface-container p-4 flex flex-col gap-2">
            <label className="font-label-telemetry text-xs text-primary-container uppercase tracking-widest flex items-center justify-between">
              <span>Búsqueda Telemétrica</span>
              <span className="text-outline text-[10px]">WZ-SRC v2.4</span>
            </label>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Casting, serie, año..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container text-on-surface font-body-sm text-xs px-3 py-2 pl-9 placeholder:text-outline focus:outline-none focus:border-primary-container transition-colors"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-outline text-base pointer-events-none">
                search
              </span>
            </div>
          </div>

          {/* Quick Stock Toggle */}
          <div className="bg-surface-container-low border border-surface-container p-4 flex flex-col gap-3">
            <label className="flex items-center justify-between cursor-pointer group select-none">
              <span className="font-label-telemetry text-xs text-on-surface uppercase group-hover:text-primary-container transition-colors">
                Solo Stock Inmediato
              </span>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="accent-primary-container w-4 h-4 cursor-pointer"
              />
            </label>
          </div>

          {/* Brand & Line Filters */}
          <div className="bg-surface-container-low border border-surface-container p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-surface-container">
              <span className="font-headline-sm uppercase text-on-surface text-sm tracking-wider">
                Marca y Categoría
              </span>
              <span className="font-label-telemetry text-[11px] text-primary-container">
                {selectedBrands.length > 0 ? `${selectedBrands.length} activas` : 'TODAS'}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 pt-1 max-h-72 overflow-y-auto pr-1">
              {BRANDS_LIST.map((b) => (
                <label
                  key={b.value}
                  className="flex items-center justify-between text-xs text-on-surface-variant hover:text-on-surface cursor-pointer py-1"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b.value)}
                      onChange={() => toggleBrand(b.value)}
                      className="accent-primary-container w-3.5 h-3.5"
                    />
                    <span className={b.value.toLowerCase().includes('sth') ? 'text-secondary font-bold' : ''}>
                      {b.label}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Escala Die-Cast */}
          <div className="bg-surface-container-low border border-surface-container p-4 flex flex-col gap-2">
            <span className="font-headline-sm uppercase text-on-surface text-sm tracking-wider pb-1 border-b border-surface-container">
              Escala Automotor
            </span>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {SCALES_LIST.map((scale) => {
                const isSelected = selectedScales.includes(scale);
                return (
                  <button
                    key={scale}
                    onClick={() => toggleScale(scale)}
                    className={`py-1.5 px-2 font-label-telemetry text-xs uppercase flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-primary-container text-on-primary-container border-primary-container font-bold'
                        : 'bg-surface-container text-on-surface-variant border-surface-container hover:border-surface-container-highest'
                    }`}
                  >
                    <span>{scale}</span>
                    {isSelected && <span className="material-symbols-outlined text-xs">check</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Motorsport Themes */}
          <div className="bg-surface-container-low border border-surface-container p-4 flex flex-col gap-2">
            <span className="font-headline-sm uppercase text-on-surface text-sm tracking-wider pb-1 border-b border-surface-container">
              Temática Motorsport
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-2 py-1 font-label-telemetry text-[11px] uppercase border transition-colors ${
                  selectedCategory === ''
                    ? 'bg-primary-container text-on-primary-container border-primary-container font-bold'
                    : 'bg-surface-container text-on-surface border-surface-container hover:bg-surface-container-high'
                }`}
              >
                Todas
              </button>
              {THEMES_LIST.map((theme) => (
                <button
                  key={theme}
                  onClick={() => setSelectedCategory(selectedCategory === theme ? '' : theme)}
                  className={`px-2 py-1 font-label-telemetry text-[11px] uppercase border transition-colors ${
                    selectedCategory === theme
                      ? 'bg-primary-container text-on-primary-container border-primary-container font-bold'
                      : 'bg-surface-container text-on-surface border-surface-container hover:bg-surface-container-high'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="bg-surface-container-low border border-surface-container p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm uppercase text-on-surface text-sm tracking-wider">
                Precio Máximo
              </span>
              <span className="font-label-telemetry text-xs text-primary-container font-bold">
                {maxPrice >= maxCatalogPrice ? 'Sin límite de precio' : `Hasta $${maxPrice.toLocaleString('es-AR')}`}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max={maxCatalogPrice}
              step="2500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary-container cursor-pointer"
            />
            <div className="flex justify-between font-label-telemetry text-[10px] text-outline">
              <span>$5.000 ARS</span>
              <span>${maxCatalogPrice.toLocaleString('es-AR')}+ ARS</span>
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={resetFilters}
            className="w-full py-2 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-telemetry text-xs uppercase tracking-wider border border-surface-container transition-colors"
          >
            Restablecer Filtros
          </button>

          {/* Mobile apply button */}
          {mobileFilterOpen && (
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 bg-primary-container text-on-primary-container font-headline-sm uppercase text-sm font-bold mt-2"
            >
              Aplicar y Ver ({filteredProducts.length}) Piezas
            </button>
          )}
        </aside>

        {/* ==============================================================================
            ÁREA PRINCIPAL DE PRODUCTOS
        ============================================================================== */}
        <main className="lg:col-span-9 flex flex-col gap-4 sm:gap-6">
          {/* Top Bar */}
          <div className="bg-surface-container-low border border-surface-container p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden px-3 py-1.5 bg-surface-container-high text-on-surface font-label-telemetry text-xs uppercase flex items-center gap-1.5 border border-surface-container-highest rounded-sm hover:border-primary-container transition-colors"
              >
                <span className="material-symbols-outlined text-base text-primary-container">tune</span>
                <span>Filtros ({selectedBrands.length + selectedScales.length + (selectedCategory ? 1 : 0)})</span>
              </button>

              <div className="flex items-center gap-2 font-label-telemetry text-[11px] sm:text-xs">
                <span className="text-on-surface font-bold whitespace-nowrap">
                  {filteredProducts.length} MODELOS
                </span>
                <span className="text-outline hidden xs:inline">|</span>
                <span className="text-outline hidden xs:inline">STOCK INMEDIATO</span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 font-label-telemetry text-xs w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-container">
              <label htmlFor="sort-select" className="text-outline uppercase text-[11px] sm:text-xs">Ordenar:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface-container border border-surface-container-highest text-on-surface px-2.5 py-1 text-xs focus:outline-none focus:border-primary-container cursor-pointer"
              >
                <option value="newest">Últimos Ingresos</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="name-asc">Nombre A - Z</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 sm:h-96 bg-surface-container-low animate-pulse border border-surface-container"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-surface-container-low border border-surface-container p-8 sm:p-12 text-center flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-4xl sm:text-5xl text-outline">search_off</span>
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-md text-lg sm:text-xl uppercase text-on-surface">
                  No encontramos modelos con estos filtros
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant max-w-md">
                  Probá ajustando el rango de precio, quitando filtros de marca o solicitando la pieza a través del formulario de Encargos Especiales.
                </p>
              </div>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-primary-container text-on-primary-container font-headline-sm uppercase text-xs sm:text-sm tracking-wider font-bold"
              >
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-surface-container-low hover:bg-surface-container border border-surface-container hover:border-primary-container transition-all duration-300 flex flex-col relative overflow-hidden"
                >
                  {/* Photo area */}
                  <div
                    className="relative w-full h-48 xs:h-44 sm:h-64 bg-surface-container-lowest overflow-hidden cursor-pointer"
                    onClick={() => setSelectedProductModal(product)}
                  >
                    <Image
                      src={product.imagen_url}
                      alt={product.modelo}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Telemetry badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 max-w-[85%]">
                      <span className="bg-surface-container-highest/90 text-on-surface font-label-telemetry text-[10px] sm:text-[11px] px-2 py-0.5 uppercase tracking-wider w-fit">
                        {product.escala}
                      </span>
                      {product.categoria.includes('Super Treasure Hunt') ? (
                        <span className="bg-secondary-container text-on-secondary-container font-label-telemetry text-[10px] sm:text-[11px] px-2 py-0.5 uppercase font-bold tracking-wider flex items-center gap-1 w-fit">
                          <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: '"FILL" 1' }}>whatshot</span>
                          STH // RARO
                        </span>
                      ) : (
                        <span className="bg-primary-container text-on-primary-container font-label-telemetry text-[10px] sm:text-[11px] px-2 py-0.5 uppercase font-bold tracking-wider truncate w-fit max-w-full">
                          {product.categoria}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 z-10">
                      <span className="font-label-telemetry text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 uppercase border bg-surface-container-lowest/90 text-primary-container border-primary-container/40">
                        NUEVO
                      </span>
                    </div>

                    {/* Inspect button overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="px-3 py-1.5 bg-black/80 text-white font-label-telemetry text-xs uppercase tracking-wider flex items-center gap-1 border border-primary-container">
                        <span className="material-symbols-outlined text-sm text-primary-container">zoom_in</span>
                        VER DETALLE
                      </span>
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between gap-2.5 sm:gap-3">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-label-telemetry text-[10px] sm:text-[11px] uppercase text-outline truncate">
                        {product.serie || product.marca}
                      </span>
                      <h3
                        onClick={() => setSelectedProductModal(product)}
                        className="font-headline-md text-sm sm:text-base uppercase text-on-surface group-hover:text-primary transition-colors cursor-pointer leading-snug line-clamp-1"
                      >
                        {product.modelo}
                      </h3>
                      <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2">
                        {product.descripcion || `${product.marca} escala ${product.escala} con pintura detallada y tarjeta protegida.`}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-surface-container">
                      <div className="flex items-baseline justify-between">
                        <span className="font-label-price text-lg sm:text-2xl text-primary-container">
                          ${product.precio.toLocaleString('es-AR')}
                        </span>
                        <span className="font-label-telemetry text-[10px] sm:text-xs text-outline">
                          {product.stock > 0 ? `STOCK: ${product.stock}` : 'AGOTADO'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        <button
                          onClick={() => addItem(product)}
                          disabled={product.stock <= 0}
                          className="py-2 px-1 sm:py-2.5 sm:px-2 bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-50 text-on-surface font-headline-sm text-[11px] sm:text-xs uppercase flex items-center justify-center gap-1 transition-colors border border-surface-container-highest"
                        >
                          <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                          <span>CARRITO</span>
                        </button>
                        <a
                          href={getWhatsAppProductUrl(product)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-1 sm:py-2.5 sm:px-2 bg-primary-container hover:bg-surface-tint text-on-primary-container font-headline-sm text-[11px] sm:text-xs uppercase flex items-center justify-center gap-1 transition-colors font-bold"
                        >
                          <span className="material-symbols-outlined text-sm">chat</span>
                          <span>COMPRAR</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ==============================================================================
          MODAL DE INSPECCIÓN DETALLADA DEL PRODUCTO
      ============================================================================== */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overscroll-contain">
          <div className="relative w-full max-w-3xl bg-surface-container-low border border-surface-container-highest max-h-[92vh] overflow-y-auto flex flex-col shadow-2xl rounded-sm">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 bg-surface-container border-b border-surface-container-highest flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-primary-container text-lg sm:text-xl shrink-0">speed</span>
                <span className="font-headline-md uppercase text-on-surface tracking-wider text-xs sm:text-base truncate">
                  Ficha Técnica // {selectedProductModal.marca}
                </span>
              </div>
              <button
                onClick={() => setSelectedProductModal(null)}
                className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-md transition-colors shrink-0"
                aria-label="Cerrar modal"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
              {/* Left: High-res Photo */}
              <div className="relative w-full h-60 sm:h-80 bg-surface-container-lowest border border-surface-container overflow-hidden rounded-sm">
                <Image
                  src={selectedProductModal.imagen_url}
                  alt={selectedProductModal.modelo}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-secondary-container text-on-secondary-container font-label-telemetry text-[11px] sm:text-xs px-2 py-0.5 uppercase font-bold">
                    ESCALA {selectedProductModal.escala}
                  </span>
                </div>
              </div>

              {/* Right: Technical Specs & Purchase */}
              <div className="flex flex-col gap-3.5 sm:gap-4">
                <div className="flex flex-col gap-1">
                  <span className="font-label-telemetry text-xs text-primary-container uppercase tracking-wider">
                    {selectedProductModal.serie || selectedProductModal.categoria}
                  </span>
                  <h2 className="font-headline-md text-xl sm:text-2xl uppercase text-on-surface leading-tight">
                    {selectedProductModal.modelo}
                  </h2>
                  <span className="font-label-price text-2xl sm:text-3xl text-primary-container mt-1">
                    ${selectedProductModal.precio.toLocaleString('es-AR')}
                  </span>
                </div>

                <div className="p-3 bg-surface-container border border-surface-container-highest flex flex-col gap-1.5 font-label-telemetry text-xs">
                  <div className="flex justify-between border-b border-surface-container-low pb-1">
                    <span className="text-outline uppercase">Condición:</span>
                    <span className="text-primary font-bold uppercase">NUEVO (EMPAQUE ORIGINAL)</span>
                  </div>
                  <div className="flex justify-between border-b border-surface-container-low pb-1">
                    <span className="text-outline uppercase">Año de Lanzamiento:</span>
                    <span className="text-on-surface">{selectedProductModal.anio}</span>
                  </div>
                  <div className="flex justify-between border-b border-surface-container-low pb-1">
                    <span className="text-outline uppercase">Disponibilidad:</span>
                    <span className="text-primary-container font-bold">{selectedProductModal.stock} unidades</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline uppercase">Embalaje Blindado:</span>
                    <span className="text-secondary font-bold">INCLUIDO SIN CARGO</span>
                  </div>
                </div>

                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  {selectedProductModal.descripcion || 'Pieza original verificada en telemetría de stock. Se despacha con protector rígido anti-impacto para garantizar la llegada intacta de esquinas y burbuja.'}
                </p>

                {/* Direct Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <a
                    href={getWhatsAppProductUrl(selectedProductModal)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-primary-container hover:bg-surface-tint text-on-primary-container font-headline-md uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 font-bold shadow-md transition-all text-center"
                  >
                    <span className="material-symbols-outlined text-lg">chat</span>
                    <span>COMPRAR VÍA WHATSAPP</span>
                  </a>

                  <button
                    onClick={() => {
                      addItem(selectedProductModal);
                      setSelectedProductModal(null);
                    }}
                    className="w-full py-3 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-on-surface font-headline-md uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-colors text-center"
                  >
                    <span className="material-symbols-outlined text-lg text-primary-container">add_shopping_cart</span>
                    <span>AGREGAR AL CARRITO</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TiendaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-2 font-label-telemetry text-primary-container text-sm uppercase">
            <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
            <span>Cargando catálogo Wheels Zone...</span>
          </div>
        </div>
      }
    >
      <TiendaContent />
    </Suspense>
  );
}
