'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import FireParticles from '@/components/FireParticles';
import { Product } from '@/lib/types';
import { fetchProducts, createLead } from '@/lib/supabase';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';
import { useCart } from '@/lib/cart-context';
import { CATALOG_BRANDS, CATALOG_SCALES } from '@/lib/catalog-constants';

export default function HomePage() {
  const { addItem } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [spotlightAdded, setSpotlightAdded] = useState(false);

  // Hero Spotlight Carousel State
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);
  const [destacadosHovered, setDestacadosHovered] = useState(false);

  // Filter hero products
  const heroProducts = useMemo(() => {
    const featured = featuredProducts.filter((p) => p.destacado);
    const list = featured.length > 0 ? featured : INITIAL_PRODUCTS.filter((p) => p.destacado);
    // Sort by hero_order if available
    return [...list].sort((a, b) => (a.hero_order || 99) - (b.hero_order || 99)).slice(0, 5);
  }, [featuredProducts]);

  const activeSpotlight = heroProducts[heroIndex] || heroProducts[0] || INITIAL_PRODUCTS[0];

  // Auto-play timer for Hero Spotlight (5s per car with telemetry progress bar)
  useEffect(() => {
    if (heroProducts.length <= 1) return;
    const interval = 5000;
    const step = 50;
    const increment = (step / interval) * 100;

    const timer = setInterval(() => {
      if (!isHeroPaused) {
        setHeroProgress((prev) => {
          if (prev >= 100) {
            setHeroIndex((idx) => (idx + 1) % heroProducts.length);
            return 0;
          }
          return prev + increment;
        });
      }
    }, step);

    return () => clearInterval(timer);
  }, [isHeroPaused, heroProducts.length]);

  // Auto-scroll timer for Destacados section
  useEffect(() => {
    if (featuredProducts.length <= 4 || destacadosHovered) return;
    const scrollTimer = setInterval(() => {
      const el = document.getElementById('destacados-grid');
      if (el) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 20) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 4500);

    return () => clearInterval(scrollTimer);
  }, [featuredProducts.length, destacadosHovered]);

  const handlePrevHero = () => {
    setHeroIndex((idx) => (idx - 1 + heroProducts.length) % heroProducts.length);
    setHeroProgress(0);
  };

  const handleNextHero = () => {
    setHeroIndex((idx) => (idx + 1) % heroProducts.length);
    setHeroProgress(0);
  };

  // Dynamic halo gradient depending on active car
  const haloClass = useMemo(() => {
    if (!activeSpotlight) return 'from-secondary-container/40 via-secondary-container/15';
    if (activeSpotlight.categoria?.includes('Super Treasure Hunt') || activeSpotlight.destacado_tipo === 'mensual') {
      return 'from-amber-500/40 via-yellow-500/15';
    }
    if (activeSpotlight.modelo?.toLowerCase().includes('porsche') || activeSpotlight.categoria?.includes('Speed')) {
      return 'from-sky-500/40 via-blue-600/15';
    }
    return 'from-secondary-container/40 via-secondary-container/15';
  }, [activeSpotlight]);

  // Model acronym for floating pill
  const modelAcronym = useMemo(() => {
    if (!activeSpotlight) return 'CAR';
    const m = activeSpotlight.modelo.toUpperCase();
    if (m.includes('SKYLINE') || m.includes('R34') || m.includes('GT-R')) return 'GT-R';
    if (m.includes('DATSUN')) return '$TH';
    if (m.includes('PORSCHE')) return 'GT3';
    if (m.includes('LAMBORGHINI') || m.includes('COUNTACH')) return 'LP500';
    if (m.includes('RX-7')) return 'FD3S';
    return activeSpotlight.marca.substring(0, 3).toUpperCase();
  }, [activeSpotlight]);

  // Dynamic badge tag for blister
  const badgeText = useMemo(() => {
    if (activeSpotlight?.destacado_tag) return activeSpotlight.destacado_tag;
    if (activeSpotlight?.destacado_tipo === 'mensual' || activeSpotlight?.categoria?.includes('Super Treasure Hunt')) {
      return '💎 JOYA DEL MES // $TH RAREZA';
    }
    if (activeSpotlight?.destacado_tipo === 'semanal') {
      return '🔥 HOT DROP DE LA SEMANA';
    }
    return '🔥 SPOTLIGHT DESTACADO';
  }, [activeSpotlight]);

  const handleAddSpotlight = () => {
    if (!activeSpotlight) return;
    addItem(activeSpotlight);
    setSpotlightAdded(true);
    confetti({
      particleCount: 45,
      spread: 55,
      origin: { y: 0.6 },
      colors: ['#FFC200', '#FF9900', '#E51937'],
    });
    setTimeout(() => setSpotlightAdded(false), 2000);
  };

  // Form states for Encargos Especiales
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    serie: '',
    modelo_buscado: '',
    estado_empaque: 'Blíster Mint C-10 (Perfecto)',
    presupuesto: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5492364275322';

  useEffect(() => {
    async function loadData() {
      try {
        const products = await fetchProducts();
        const featured = products.filter((p) => p.destacado);
        setFeaturedProducts(featured.length > 0 ? featured : products.slice(0, 8));
      } catch (err) {
        console.error('Error loading featured products:', err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadData();
  }, []);

  const handleEncargoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      await createLead({
        nombre: formData.nombre,
        telefono: formData.telefono,
        serie: formData.serie,
        modelo_buscado: formData.modelo_buscado,
        estado_empaque: formData.estado_empaque,
        presupuesto: formData.presupuesto,
      });

      // Confetti burst for victory
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FFC200', '#E51937', '#FFFFFF'],
      });

      setSubmitSuccess(true);
      setFormData({
        nombre: '',
        telefono: '',
        serie: '',
        modelo_buscado: '',
        estado_empaque: 'Blíster Mint C-10 (Perfecto)',
        presupuesto: '',
      });
    } catch (err) {
      console.error('Error submitting lead:', err);
      setSubmitError('Hubo un problema al registrar la solicitud. Por favor contactanos directamente por WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const getWhatsAppProductUrl = (product: Product) => {
    const msg = `¡Hola Wheels Zone! Quiero consultar/comprar la siguiente pieza:\n*${product.modelo}*\nMarca: ${product.marca} | Escala: ${product.escala}\nPrecio: $${product.precio.toLocaleString('es-AR')}\nEstado Blíster: ${product.estado_blister}\n¿Tienen disponibilidad para envío protegido?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="flex flex-col w-full">
      {/* ==============================================================================
          1. HERO SECTION: VELOCIDAD, FIBRA DE CARBONO Y PARTÍCULAS DE FUEGO
      ============================================================================== */}
      <section className="relative w-full overflow-hidden bg-carbon-pattern py-12 md:py-16 lg:py-20 border-b border-surface-container">
        {/* Dynamic Fire Particles Canvas */}
        <FireParticles />

        {/* Ambient Telemetry Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-secondary-container/20 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/2 right-10 w-[32rem] h-[32rem] bg-secondary-container/25 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary-container/15 rounded-full blur-[130px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-telemetry-grid opacity-30 pointer-events-none"></div>

        <div className="relative w-full px-4 md:px-8 mx-auto max-w-7xl z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Hero Left Deck */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* Eyebrow with gradient accent line */}
              <div className="flex items-center gap-2.5">
                <span className="font-label-telemetry text-xs md:text-sm tracking-[0.25em] text-neutral-300 uppercase font-semibold">
                  COLECCIONABLES A ESCALA
                </span>
                <div className="w-14 sm:w-16 h-[2.5px] bg-gradient-to-r from-[#FFC200] via-[#FF6A00] to-transparent rounded-full"></div>
              </div>

              {/* Main Impact Title - Slanted/Italic Display with Vertical Flame Gradient */}
              <div className="flex flex-col">
                <h1 className="font-display-hero italic font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-tighter leading-[0.92]">
                  <span className="text-hero-white block">
                    TU PRÓXIMA
                  </span>
                  <span className="text-gradient-flame block">
                    JOYA ESTÁ ACÁ
                  </span>
                </h1>
              </div>

              {/* Subtitle */}
              <p className="font-body-md text-base sm:text-lg text-neutral-200 max-w-xl leading-relaxed">
                Hot Wheels, premium y piezas especiales para tu colección.
              </p>

              {/* Action Buttons with identical rounded-xl corners & crisp SVGs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                <Link
                  href="/tienda"
                  className="px-6 sm:px-7 py-3.5 bg-gradient-to-r from-[#FFC200] via-[#FF6000] to-[#FF1E27] text-black font-extrabold text-sm sm:text-base uppercase tracking-wider rounded-xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-[0_8px_20px_rgba(255,96,0,0.35)]"
                >
                  <svg
                    className="w-5 h-5 text-black shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="21" r="1.5" fill="currentColor" />
                    <circle cx="19" cy="21" r="1.5" fill="currentColor" />
                    <path d="M2.5 3h3.2l2.4 11.2a1.8 1.8 0 0 0 1.8 1.4h9.8a1.8 1.8 0 0 0 1.8-1.4l1.6-8.2H6.5" />
                  </svg>
                  <span>EXPLORAR CATÁLOGO &gt;</span>
                </Link>

                <a
                  href="#encargos"
                  className="px-6 sm:px-7 py-3.5 bg-[#151518]/90 hover:bg-[#202025] border border-neutral-600/90 text-white font-extrabold text-sm sm:text-base uppercase tracking-wider rounded-xl flex items-center justify-center gap-3 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-white shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5.5 10.5L7.5 5.5C7.8 4.6 8.7 4 9.6 4h4.8c.9 0 1.8.6 2.1 1.5l2 5" />
                    <rect x="2.5" y="10.5" width="19" height="7" rx="2" />
                    <ellipse cx="6" cy="14" rx="1.5" ry="1" fill="currentColor" />
                    <ellipse cx="18" cy="14" rx="1.5" ry="1" fill="currentColor" />
                    <line x1="9.5" y1="14.5" x2="14.5" y2="14.5" />
                    <path d="M4.5 17.5v2M19.5 17.5v2" strokeWidth="2.5" />
                  </svg>
                  <span>PEDIR UN AUTO &gt;</span>
                </a>
              </div>

              {/* Crisp White Handwritten Cursive Slogan with Curved Yellow Underline */}
              <div className="flex flex-col items-start pt-2">
                <span className="font-script text-white text-3xl sm:text-4xl italic tracking-wide select-none drop-shadow-md">
                  La felicidad en diferentes escalas
                </span>
                {/* Hand-drawn curved yellow swoosh under 'La felicidad' */}
                <svg
                  className="w-36 sm:w-44 h-3.5 text-[#FFC200] -mt-1 sm:-mt-1.5 ml-1"
                  viewBox="0 0 160 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 4 9 C 40 16, 95 16, 156 4"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Live Race Counters */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-surface-container-high/60 max-w-xl">
                <div className="p-3 bg-surface-container-low/80 backdrop-blur-sm border border-surface-container flex flex-col">
                  <span className="font-headline-lg text-2xl md:text-3xl text-primary-container tracking-tighter leading-none">
                    +1,250
                  </span>
                  <span className="font-label-telemetry text-[11px] uppercase text-on-surface-variant mt-1">
                    Modelos en Stock
                  </span>
                </div>
                <div className="p-3 bg-surface-container-low/80 backdrop-blur-sm border border-surface-container flex flex-col">
                  <span className="font-headline-lg text-2xl md:text-3xl text-secondary tracking-tighter leading-none">
                    100%
                  </span>
                  <span className="font-label-telemetry text-[11px] uppercase text-on-surface-variant mt-1">
                    Blíster C-10 Mint
                  </span>
                </div>
                <div className="p-3 bg-surface-container-low/80 backdrop-blur-sm border border-surface-container flex flex-col">
                  <span className="font-headline-lg text-2xl md:text-3xl text-amber-400 tracking-tighter leading-none">
                    980+
                  </span>
                  <span className="font-label-telemetry text-[11px] uppercase text-on-surface-variant mt-1">
                    Coleccionistas
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Right Deck: Spotlight Blister Pack Mockup with Dynamic Interactive Carousel */}
            <div className="lg:col-span-5 relative flex flex-col justify-center items-center py-4">
              {/* Radial dynamic reactive spotlight halo */}
              <div
                className={`absolute w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] bg-gradient-to-br ${haloClass} to-transparent rounded-full blur-[80px] pointer-events-none transition-all duration-700`}
              ></div>

              {/* Blister Card Container with Pause on Hover */}
              <div
                onMouseEnter={() => setIsHeroPaused(true)}
                onMouseLeave={() => setIsHeroPaused(false)}
                className="relative z-10 w-full max-w-sm sm:max-w-md group select-none"
              >
                {/* Blister Image Frame */}
                <div className="relative w-full h-[400px] sm:h-[460px] rounded-2xl overflow-hidden border border-neutral-700/80 bg-neutral-950/80 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-sm transition-transform duration-500 group-hover:scale-[1.01]">
                  
                  {/* Telemetry RPM Progress Bar at Top */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-800/80 z-30 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-container via-amber-400 to-race-red transition-all duration-75 ease-linear"
                      style={{ width: `${heroProgress}%` }}
                    ></div>
                  </div>

                  <Image
                    key={activeSpotlight.id}
                    src={activeSpotlight.imagen_url}
                    alt={activeSpotlight.modelo}
                    fill
                    className="object-cover object-center transition-all duration-500"
                    priority
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                  {/* Subtle lighting sheen */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-white/10 pointer-events-none"></div>

                  {/* Quality / Rarity Badge Top Left */}
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md border border-neutral-700 text-[11px] font-label-telemetry text-primary-container uppercase font-bold tracking-wider shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-secondary-container animate-ping"></span>
                    <span>{badgeText}</span>
                  </div>

                  {/* Auto-play pause indicator */}
                  {isHeroPaused && (
                    <div className="absolute top-3 right-3 z-20 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-label-telemetry text-neutral-300 uppercase tracking-widest border border-neutral-700/60">
                      PAUSADO
                    </div>
                  )}

                  {/* Manual Arrow Controls (< and >) on hover */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevHero();
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-neutral-700/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-lg"
                    aria-label="Anterior modelo"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextHero();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-neutral-700/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-lg"
                    aria-label="Siguiente modelo"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>

                {/* Floating Glassmorphism Product Card in Corner */}
                <div className="absolute -bottom-4 right-2 sm:-right-4 z-20 bg-neutral-900/95 backdrop-blur-md border border-neutral-700/90 rounded-2xl p-3.5 sm:p-4 shadow-2xl flex items-center justify-between gap-4 max-w-xs sm:max-w-sm transition-all duration-300">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 font-extrabold text-xs tracking-tighter shrink-0">
                      {modelAcronym}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white leading-tight truncate">
                        {activeSpotlight.modelo}
                      </span>
                      <span className="text-[11px] text-neutral-400 truncate">
                        {activeSpotlight.serie || `${activeSpotlight.marca} // ${activeSpotlight.categoria}`}
                      </span>
                      <span className="text-base font-extrabold text-[#FFC200] mt-0.5">
                        ${activeSpotlight.precio.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleAddSpotlight}
                    title="Agregar al carrito"
                    className="w-10 h-10 rounded-full bg-primary-container hover:bg-amber-400 text-black flex items-center justify-center font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
                  >
                    {spotlightAdded ? '✓' : '>'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================================
          2. SECCIÓN DESTACADOS DE LA SEMANA (CIRCUITO DE RAREZAS)
      ============================================================================== */}
      <section className="w-full bg-surface py-16 md:py-24 border-b border-surface-container" id="destacados">
        <div className="w-full px-4 md:px-8 mx-auto max-w-7xl flex flex-col gap-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-surface-container">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-label-telemetry text-xs uppercase tracking-widest text-secondary font-bold">
                  CIRCUITO DE RAREZAS // EDICIONES LIMITADAS
                </span>
              </div>
              <div className="flex flex-col">
                <h2 className="font-display-hero text-3xl md:text-5xl uppercase tracking-tight text-white flex items-center gap-3">
                  DESTACADOS
                </h2>
                <div className="w-20 h-1 bg-primary-container rounded-full mt-1.5"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/tienda"
                className="font-headline-sm text-sm uppercase text-primary-container hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                Ver todo el catálogo
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('destacados-grid');
                    if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 rounded-full border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Anterior"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('destacados-grid');
                    if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 rounded-full border border-primary-container bg-primary-container/10 hover:bg-primary-container text-primary-container hover:text-black flex items-center justify-center transition-colors font-bold"
                  aria-label="Siguiente"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cards Carousel */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-96 bg-surface-container-low animate-pulse border border-surface-container"></div>
              ))}
            </div>
          ) : (
            <div
              id="destacados-grid"
              onMouseEnter={() => setDestacadosHovered(true)}
              onMouseLeave={() => setDestacadosHovered(false)}
              className="flex items-stretch gap-4 overflow-x-auto pb-4 scroll-smooth no-scrollbar"
            >
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="w-[280px] sm:w-[300px] lg:w-[285px] xl:w-[298px] shrink-0 group bg-surface-container-low hover:bg-surface-container transition-all duration-300 flex flex-col border border-surface-container hover:border-primary-container relative overflow-hidden"
                >
                  {/* Photo area */}
                  <div className="relative w-full h-64 bg-surface-container-lowest overflow-hidden">
                    <Image
                      src={product.imagen_url}
                      alt={product.modelo}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />

                    {/* Scale and series badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                      {product.destacado_tipo === 'mensual' ? (
                        <span className="bg-amber-400 text-black font-label-telemetry text-[11px] px-2 py-0.5 uppercase font-black tracking-wider flex items-center gap-1 shadow-md">
                          <span>💎 JOYA DEL MES</span>
                        </span>
                      ) : product.destacado_tipo === 'semanal' ? (
                        <span className="bg-secondary-container text-white font-label-telemetry text-[11px] px-2 py-0.5 uppercase font-black tracking-wider flex items-center gap-1 shadow-md">
                          <span>🔥 DESTACADO DE LA SEMANA</span>
                        </span>
                      ) : null}

                      <span className="bg-surface-container-highest/90 text-on-surface font-label-telemetry text-[11px] px-2 py-0.5 uppercase tracking-wider">
                        ESCALA {product.escala}
                      </span>
                      {product.categoria.includes('Super Treasure Hunt') ? (
                        <span className="bg-secondary-container text-on-secondary-container font-label-telemetry text-[11px] px-2 py-0.5 uppercase font-bold tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: '"FILL" 1' }}>whatshot</span>
                          STH ULTRA RARO
                        </span>
                      ) : (
                        <span className="bg-primary-container text-on-primary-container font-label-telemetry text-[11px] px-2 py-0.5 uppercase font-bold tracking-wider">
                          {product.categoria}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 z-10">
                      <span className="bg-surface-container-lowest/90 text-tertiary-fixed font-label-telemetry text-[11px] px-2 py-0.5 border border-surface-container">
                        BLÍSTER {product.estado_blister === 'Impecable' ? '10/10' : product.estado_blister}
                      </span>
                    </div>
                  </div>

                  {/* Body area */}
                  <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-label-telemetry text-[11px] uppercase text-outline truncate">
                        {product.serie || product.marca}
                      </span>
                      <h3 className="font-headline-md text-lg uppercase text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-1">
                        {product.modelo}
                      </h3>
                      <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2">
                        {product.descripcion || `${product.marca} escala ${product.escala} con detalles de fundición coleccionable.`}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-surface-container">
                      <div className="flex items-baseline justify-between">
                        <span className="font-label-price text-2xl text-primary-container">
                          ${product.precio.toLocaleString('es-AR')}
                        </span>
                        <span className="font-label-telemetry text-xs text-outline">
                          STOCK: {product.stock} UNID.
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => addItem(product)}
                          className="py-2.5 px-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-headline-sm text-xs uppercase flex items-center justify-center gap-1 transition-colors border border-surface-container-highest"
                        >
                          <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                          <span>CARRITO</span>
                        </button>
                        <a
                          href={getWhatsAppProductUrl(product)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-2 bg-primary-container hover:bg-surface-tint text-on-primary-container font-headline-sm text-xs uppercase flex items-center justify-center gap-1 transition-colors font-bold"
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
        </div>
      </section>

      {/* ==============================================================================
          3. SECCIÓN DE ENCARGOS ESPECIALES & CACERÍA TELEMÉTRICA
      ============================================================================== */}
      <section className="w-full bg-carbon-pattern py-16 md:py-24 border-b border-surface-container relative" id="encargos">
        <div className="absolute top-0 right-10 w-96 h-96 bg-primary-container/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="w-full px-4 md:px-8 mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Information Column */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-primary-container"></span>
                  <span className="font-label-telemetry text-xs uppercase tracking-widest text-primary-container font-bold">
                    GARAJE DE BÚSQUEDA & IMPORTACIÓN
                  </span>
                </div>
                <h2 className="font-display-hero text-3xl md:text-5xl uppercase tracking-tight text-on-surface leading-none">
                  ¿BUSCÁS UNA PIEZA <span className="text-secondary italic">INCONSEGUIBLE</span>?
                </h2>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                  Nosotros la rastreamos, verificamos su autenticidad y estado de blíster bajo lupa, y la traemos directo a tus manos a través de nuestra red de coleccionistas internacionales en Japón, Estados Unidos y Europa.
                </p>
              </div>

              {/* Protocol steps */}
              <div className="flex flex-col gap-3 bg-surface-container-low p-4 border border-surface-container">
                <span className="font-headline-sm text-base uppercase text-primary">
                  Protocolo de Cacería Wheels Zone
                </span>
                <div className="flex flex-col gap-2 font-body-sm text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-base">radar</span>
                    <span>Escaneo en subastas RLC y clubes cerrados de coleccionistas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-base">verified</span>
                    <span>Verificación fotográfica de esquinas, tampografía y burbuja</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-base">lock</span>
                    <span>Seña congelada hasta aprobación de fotos reales en mano</span>
                  </div>
                </div>
              </div>

              {/* Guarantee alert box */}
              <div className="p-4 bg-secondary-container/15 border-l-4 border-secondary-container flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary-container text-2xl">priority_high</span>
                <p className="font-label-telemetry text-xs text-on-surface uppercase leading-snug">
                  SIN COMPROMISO DE COMPRA SI EL ESTADO DEL BLÍSTER NO COINCIDE EXACTAMENTE CON EL ACORDADO PREVIAMENTE.
                </p>
              </div>
            </div>

            {/* Custom Request Form connected to Supabase */}
            <div className="lg:col-span-7 bg-surface-container-low border border-surface-container p-6 md:p-8 flex flex-col gap-4 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">assignment</span>
                  <span className="font-headline-sm text-lg uppercase text-on-surface">
                    FORMULARIO DE CACERÍA TELEMÉTRICA
                  </span>
                </div>
                <span className="font-label-telemetry text-xs text-primary-container hidden sm:inline-flex items-center gap-1 font-bold">
                  <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                  RADAR DE BÚSQUEDA ACTIVO
                </span>
              </div>

              <form onSubmit={handleEncargoSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div className="flex flex-col gap-1">
                    <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                      Nombre Completo del Coleccionista *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Martín Rodríguez"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface font-body-sm text-sm placeholder:text-outline focus:outline-none focus:border-primary-container transition-colors"
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="flex flex-col gap-1">
                    <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                      WhatsApp / Teléfono Móvil *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+54 9 11 5555-0123"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface font-body-sm text-sm placeholder:text-outline focus:outline-none focus:border-primary-container transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Marca y Categoría */}
                  <div className="flex flex-col gap-1">
                    <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                      Marca y Categoría Deseada *
                    </label>
                    <select
                      required
                      value={formData.serie}
                      onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface font-body-sm text-sm focus:outline-none focus:border-primary-container transition-colors"
                    >
                      <option value="">Seleccioná una línea...</option>
                      {CATALOG_BRANDS.map((brand) => (
                        <option key={brand.value} value={brand.value}>
                          {brand.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Escala Automotor */}
                  <div className="flex flex-col gap-1">
                    <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                      Escala Requerida
                    </label>
                    <select
                      value={formData.estado_empaque}
                      onChange={(e) => setFormData({ ...formData, estado_empaque: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface font-body-sm text-sm focus:outline-none focus:border-primary-container transition-colors"
                    >
                      {CATALOG_SCALES.map((scale) => (
                        <option key={scale} value={scale}>
                          {scale}
                        </option>
                      ))}
                      <option value="Indiferente">Indiferente / Cualquier escala</option>
                    </select>
                  </div>
                </div>

                {/* Modelo exacto */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Modelo exacto, año o variante de color *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Toyota Supra MK4 1994 Amarillo Fast & Furious o Porsche 930 RLC Spectraflame Pink"
                    value={formData.modelo_buscado}
                    onChange={(e) => setFormData({ ...formData, modelo_buscado: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface font-body-sm text-sm placeholder:text-outline focus:outline-none focus:border-primary-container transition-colors"
                  />
                </div>

                {/* Presupuesto */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Presupuesto Estimado / Rango Dispuesto (ARS o USD)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Hasta $40.000 ARS o aprox. 45 USD"
                    value={formData.presupuesto}
                    onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface font-body-sm text-sm placeholder:text-outline focus:outline-none focus:border-primary-container transition-colors"
                  />
                </div>

                {/* Submit button */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-primary-container hover:bg-surface-tint active:scale-[0.99] text-on-primary-container font-headline-md text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md font-bold disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
                        <span>CONECTANDO CON PIT CREW...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-xl">send</span>
                        <span>ENVIAR ENCARGO A CACERÍA</span>
                      </>
                    )}
                  </button>

                  {/* Feedback Message */}
                  {submitSuccess && (
                    <div className="p-3 bg-secondary-container/20 border border-secondary-container text-on-surface font-label-telemetry text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary-container text-lg">check_circle</span>
                      <span className="text-primary-container font-bold uppercase tracking-wider">
                        ¡ENCARGO RECIBIDO! NOS CONTACTAREMOS VÍA WHATSAPP EN BREVE CON LAS PRIMERAS OPCIONES DE PISTA.
                      </span>
                    </div>
                  )}

                  {submitError && (
                    <div className="p-3 bg-error-container/30 border border-error-container text-error font-label-telemetry text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">error</span>
                      <span>{submitError}</span>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================================
          4. SECCIÓN DE CONFIANZA Y BLINDAJE DE BLÍSTERS
      ============================================================================== */}
      <section className="w-full bg-surface py-16 md:py-24 border-b border-surface-container">
        <div className="w-full px-4 md:px-8 mx-auto max-w-7xl flex flex-col gap-10">
          <div className="flex flex-col items-center text-center gap-1">
            <span className="font-label-telemetry text-xs uppercase tracking-widest text-primary-container font-bold">
              ESTÁNDAR DE OPERACIONES WHEELS ZONE
            </span>
            <h2 className="font-display-hero text-3xl md:text-5xl uppercase tracking-tight text-on-surface">
              BLINDAJE Y <span className="text-secondary-container italic">GARANTÍA TOTAL</span>
            </h2>
            <p className="font-body-md text-sm text-on-surface-variant max-w-xl">
              Sabemos el valor intrínseco de cada tarjeta y burbuja. Por eso diseñamos un circuito de empaque sin margen de daño mecánico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-surface-container-low border border-surface-container p-6 flex flex-col gap-4 hover:border-secondary transition-colors">
              <div className="w-12 h-12 bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">shield</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-md text-xl uppercase text-on-surface">
                  Embalaje de Grado Militar
                </h3>
                <span className="font-label-telemetry text-xs text-secondary uppercase">
                  BURBUJA ANTI-IMPACTO + CAJA TRICAPA
                </span>
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Cada blíster viaja en su protector individual, recubierto por doble capa de plástico de burbujas de alta densidad y embalado en cajas corrugadas tricapa para resistir cualquier aplastamiento en tránsito.
              </p>
              <div className="pt-2 font-label-telemetry text-xs text-primary-container flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-base">check</span>
                <span>CERO ESQUINAS DOBLADAS GARANTIZADO</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-container-low border border-surface-container p-6 flex flex-col gap-4 hover:border-primary-container transition-colors">
              <div className="w-12 h-12 bg-primary-container text-on-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-md text-xl uppercase text-on-surface">
                  Autenticidad 100% Garantizada
                </h3>
                <span className="font-label-telemetry text-xs text-primary-container uppercase">
                  VERIFICACIÓN OFICIAL DE REMACHES
                </span>
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Supervisamos remaches originales de fundición, tampografía de fábrica, número de serie y sello holográfico para descartar falsificaciones, resellos no oficiales o reempaquetados caseros.
              </p>
              <div className="pt-2 font-label-telemetry text-xs text-primary-container flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-base">check</span>
                <span>CASTINGS CERTIFICADOS POR EXPERTOS</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-container-low border border-surface-container p-6 flex flex-col gap-4 hover:border-surface-tint transition-colors">
              <div className="w-12 h-12 bg-surface-container-highest text-on-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">savings</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-md text-xl uppercase text-on-surface">
                  Transferencia con 10% OFF
                </h3>
                <span className="font-label-telemetry text-xs text-outline uppercase">
                  DESCUENTO DIRECTO EN CHECKOUT
                </span>
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Aboná de forma segura por transferencia bancaria directa instantánea y aplicá un 10% de ahorro directo en cualquier pieza. También aceptamos todas las tarjetas vía Mercado Pago.
              </p>
              <div className="pt-2 font-label-telemetry text-xs text-primary-container flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-base">check</span>
                <span>DESPACHO EXPRESS CON TELEMETRÍA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================================
          5. SECCIÓN PADDOCK PRESENCIAL & SHOWROOM JUNÍN (GOOGLE MAPS DARK MODE)
      ============================================================================== */}
      <section className="w-full bg-carbon-pattern py-16 md:py-24 border-b border-surface-container relative" id="showroom">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary-container/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="w-full px-4 md:px-8 mx-auto max-w-7xl relative z-10 flex flex-col gap-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-surface-container">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-primary-container rounded-full animate-ping"></span>
                <span className="font-label-telemetry text-xs uppercase tracking-widest text-primary-container font-bold">
                  PADDOCK PRESENCIAL & SHOWROOM OFICIAL
                </span>
              </div>
              <h2 className="font-display-hero text-3xl md:text-5xl uppercase tracking-tight text-on-surface">
                VENÍ A CONOCER EL <span className="text-gradient-flame italic">GARAJE EN PERSONA</span>
              </h2>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant max-w-md">
              Inspeccioná las piezas bajo luz natural, comprobá el estado de los blísteres en mano y retirá tus compras de inmediato sin costo de envío.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Headquarters Info & Action Buttons (5 Cols) */}
            <div className="lg:col-span-5 bg-surface-container-low border border-surface-container p-6 md:p-8 flex flex-col justify-between gap-6 shadow-2xl relative">
              <div className="flex flex-col gap-5">
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-xl">storefront</span>
                    <span className="font-headline-sm uppercase text-sm text-on-surface tracking-wider">
                      WHEELS ZONE HEADQUARTERS
                    </span>
                  </div>
                  <span className="font-label-telemetry text-[11px] px-2 py-0.5 bg-secondary-container text-on-secondary-container uppercase font-bold">
                    PUNTO DE RETIRO
                  </span>
                </div>

                {/* Address Box */}
                <div className="flex flex-col gap-1.5 p-3.5 bg-surface-container border border-surface-container-high">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-label-telemetry text-xs uppercase text-primary-container font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-secondary">location_on</span>
                      DIRECCIÓN DEL SHOWROOM
                    </span>
                    <a
                      href={`https://wa.me/${phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-label-telemetry text-xs uppercase text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">chat</span>
                      +54 9 2364 27-5322
                    </a>
                  </div>
                  <p className="font-headline-sm text-lg uppercase text-on-surface leading-snug">
                    Rioja 281, B6022 Junín, Argentina
                  </p>
                  <span className="text-xs font-body-sm text-on-surface-variant">
                    Provincia de Buenos Aires // Zona Centro de fácil acceso
                  </span>
                </div>

                {/* Horarios */}
                <div className="flex flex-col gap-2 font-label-telemetry text-xs">
                  <span className="uppercase text-outline font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary-container">schedule</span>
                    HORARIOS DE ATENCIÓN EN PADDOCK
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-on-surface">
                    <div className="p-2 bg-surface-container border border-surface-container-high flex flex-col">
                      <span className="text-primary-container font-bold">LUNES A VIERNES</span>
                      <span className="text-[11px] text-on-surface-variant">09:30 a 13:00 hs</span>
                      <span className="text-[11px] text-on-surface-variant">16:30 a 20:30 hs</span>
                    </div>
                    <div className="p-2 bg-surface-container border border-surface-container-high flex flex-col">
                      <span className="text-primary-container font-bold">SÁBADOS</span>
                      <span className="text-[11px] text-on-surface-variant">10:00 a 13:30 hs</span>
                      <span className="text-[11px] text-on-surface-variant">17:00 a 20:30 hs</span>
                    </div>
                  </div>
                </div>

                {/* Showroom Perks */}
                <div className="flex flex-col gap-1.5 font-body-sm text-xs text-on-surface-variant pt-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span>
                    <span>Más de 1.200 autitos coleccionables y STH en exhibición</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span>
                    <span>10% OFF en efectivo o transferencia directa al retirar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span>
                    <span>Inspección de remaches y estado de blíster bajo lupa</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-3 border-t border-surface-container">
                <a
                  href={`https://wa.me/${phone}?text=${encodeURIComponent('¡Hola Willson! Quiero coordinar para pasar a visitar el showroom de Wheels Zone en Rioja 281, Junín para ver/retirar piezas.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-gradient-to-r from-primary-container via-surface-tint to-secondary-container text-surface-container-lowest font-headline-md uppercase text-sm tracking-wider flex items-center justify-center gap-2 font-bold shadow-lg hover:scale-[1.01] active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                  <span>COORDINAR VISITA POR WHATSAPP</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=Rioja+281,+B6022+Jun%C3%ADn,+Provincia+de+Buenos+Aires"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-2 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-on-surface font-headline-sm uppercase text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-primary-container">directions</span>
                    <span>CÓMO LLEGAR (MAPS)</span>
                  </a>

                  <a
                    href="https://waze.com/ul?q=Rioja+281,+B6022+Jun%C3%ADn,+Argentina&navigate=yes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-2 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-on-surface font-headline-sm uppercase text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-secondary">navigation</span>
                    <span>ABRIR EN WAZE</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Google Maps Interactive Dark Mode Embed (7 Cols) */}
            <div className="lg:col-span-7 bg-surface-container-low border-2 border-primary-container/40 p-2 shadow-2xl relative overflow-hidden flex flex-col group min-h-[420px]">
              {/* Floating Top Telemetry Bar */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/90 backdrop-blur-md px-3 py-1.5 border border-primary-container shadow-xl">
                <span className="w-2 h-2 rounded-full bg-secondary-container animate-ping"></span>
                <span className="font-label-telemetry text-xs uppercase text-primary-container font-bold">
                  WHEELS ZONE // RIOJA 281, JUNÍN
                </span>
              </div>

              {/* Google Maps Iframe with dark theme inversion filter */}
              <div className="relative w-full h-full min-h-[400px] bg-surface-container-lowest overflow-hidden">
                <iframe
                  title="Ubicación Showroom Wheels Zone en Google Maps"
                  src="https://maps.google.com/maps?q=Rioja+281,+B6022+Jun%C3%ADn,+Provincia+de+Buenos+Aires&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full min-h-[400px] border-0"
                  style={{
                    filter: 'invert(90%) hue-rotate(180deg) contrast(125%) grayscale(25%)',
                  }}
                  loading="lazy"
                  allowFullScreen
                ></iframe>

                {/* Floating GPS Action Pill in Map */}
                <a
                  href="https://maps.google.com/?q=Rioja+281,+B6022+Jun%C3%ADn,+Provincia+de+Buenos+Aires"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-black/90 hover:bg-primary-container text-white hover:text-black font-label-telemetry text-xs uppercase flex items-center gap-1.5 border border-primary-container transition-colors shadow-xl"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  <span>VER EN GOOGLE MAPS GRANDE</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================================
          6. BANNER FINAL VELOCIDAD CALL TO ACTION
      ============================================================================== */}
      <section className="w-full bg-secondary-container text-on-secondary-container py-10 relative overflow-hidden">
        <div className="w-full px-4 md:px-8 mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col gap-1">
            <span className="font-label-telemetry text-xs uppercase tracking-widest text-primary-fixed font-bold">
              ¡NO DEJES ESCAPAR ESA PIEZA!
            </span>
            <h2 className="font-headline-lg text-2xl md:text-3xl uppercase tracking-tight text-on-secondary-container">
              ¿TENÉS DUDAS O QUERÉS VER FOTOS ADICIONALES DEL BLÍSTER?
            </h2>
            <p className="font-body-md text-xs md:text-sm text-on-secondary-container/90">
              Chateá directamente con nuestro equipo de coleccionistas por WhatsApp y te enviamos video en vivo 360° de la pieza.
            </p>
          </div>
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent('¡Hola Wheels Zone! Quiero fotos y video 360° de las piezas disponibles.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap px-6 py-3.5 bg-surface-container-lowest text-primary font-headline-md text-sm md:text-base uppercase tracking-wider flex items-center gap-2 hover:bg-surface-container transition-colors shadow-xl"
          >
            <span className="material-symbols-outlined text-primary-container">support_agent</span>
            <span>HABLAR CON UN ASESOR</span>
          </a>
        </div>
      </section>
    </div>
  );
}
