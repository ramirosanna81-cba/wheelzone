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
import ProductModal from '@/components/ProductModal';

export default function HomePage() {
  const { addItem } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [spotlightAdded, setSpotlightAdded] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);

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
    estado_empaque: '1:64',
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
        const activeProds = products.filter((p) => p.activo !== false);
        const featured = activeProds.filter((p) => p.destacado);
        setFeaturedProducts(featured.length > 0 ? featured : activeProds.slice(0, 8));
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
        estado_empaque: '1:64',
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
      <section className="relative w-full overflow-hidden bg-carbon-pattern py-8 sm:py-12 md:py-16 lg:py-20 border-b border-surface-container">
        {/* Dynamic Fire Particles Canvas */}
        <FireParticles />

        {/* Ambient Telemetry Glows (Clipped within section) */}
        <div className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-secondary-container/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/2 right-0 sm:right-10 w-80 sm:w-[32rem] h-80 sm:h-[32rem] bg-secondary-container/25 rounded-full blur-[130px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-primary-container/15 rounded-full blur-[110px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-telemetry-grid opacity-30 pointer-events-none"></div>

        <div className="relative w-full px-3 sm:px-6 md:px-8 mx-auto max-w-7xl z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Hero Left Deck */}
            <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5">
              {/* Eyebrow with gradient accent line */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="font-label-telemetry text-[11px] sm:text-xs md:text-sm tracking-[0.2em] sm:tracking-[0.25em] text-neutral-300 uppercase font-semibold">
                  COLECCIONABLES A ESCALA
                </span>
                <div className="w-12 sm:w-16 h-[2.5px] bg-gradient-to-r from-[#FFC200] via-[#FF6A00] to-transparent rounded-full"></div>
              </div>

              {/* Main Impact Title - Slanted/Italic Display with Vertical Flame Gradient */}
              <div className="flex flex-col">
                <h1 className="font-display-hero italic font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-tighter leading-[0.92]">
                  <span className="text-hero-white block">
                    TU PRÓXIMA
                  </span>
                  <span className="text-gradient-flame block">
                    JOYA ESTÁ ACÁ
                  </span>
                </h1>
              </div>

              {/* Subtitle */}
              <p className="font-body-md text-sm sm:text-base md:text-lg text-neutral-200 max-w-xl leading-relaxed">
                Hot Wheels, premium y piezas especiales para tu colección.
              </p>

              {/* Action Buttons: Compact side-by-side on mobile, elegant & balanced */}
              <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 sm:gap-3 pt-0.5 sm:pt-1 w-full sm:w-auto max-w-xl">
                <Link
                  href="/tienda"
                  className="w-full sm:w-auto px-2.5 sm:px-7 py-2.5 sm:py-3.5 bg-gradient-to-r from-[#FFC200] via-[#FF6000] to-[#FF1E27] text-black font-extrabold text-[11px] min-[390px]:text-xs sm:text-sm md:text-base uppercase tracking-wide sm:tracking-wider rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 sm:gap-2.5 hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_16px_rgba(255,96,0,0.35)] whitespace-nowrap"
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-black shrink-0"
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
                  className="w-full sm:w-auto px-2.5 sm:px-7 py-2.5 sm:py-3.5 bg-[#151518]/90 hover:bg-[#202025] border border-neutral-600/90 text-white font-extrabold text-[11px] min-[390px]:text-xs sm:text-sm md:text-base uppercase tracking-wide sm:tracking-wider rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 sm:gap-2.5 transition-colors active:scale-95 whitespace-nowrap"
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white shrink-0"
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
              <div className="flex flex-col items-start pt-1.5 sm:pt-2">
                <span className="font-script text-white text-2xl xs:text-3xl sm:text-4xl italic tracking-wide select-none drop-shadow-md">
                  La felicidad en diferentes escalas
                </span>
                {/* Hand-drawn curved yellow swoosh under 'La felicidad' */}
                <svg
                  className="w-32 xs:w-36 sm:w-44 h-3 sm:h-3.5 text-[#FFC200] -mt-1 sm:-mt-1.5 ml-1"
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
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-surface-container-high/60 max-w-xl">
                <div className="p-2 sm:p-3 bg-surface-container-low/80 backdrop-blur-sm border border-surface-container flex flex-col">
                  <span className="font-headline-lg text-xl sm:text-2xl md:text-3xl text-primary-container tracking-tighter leading-none">
                    +1,250
                  </span>
                  <span className="font-label-telemetry text-[9px] xs:text-[10px] sm:text-[11px] uppercase text-on-surface-variant mt-1 leading-tight">
                    Modelos en Stock
                  </span>
                </div>
                <div className="p-2 sm:p-3 bg-surface-container-low/80 backdrop-blur-sm border border-surface-container flex flex-col">
                  <span className="font-headline-lg text-xl sm:text-2xl md:text-3xl text-secondary tracking-tighter leading-none">
                    100%
                  </span>
                  <span className="font-label-telemetry text-[9px] xs:text-[10px] sm:text-[11px] uppercase text-on-surface-variant mt-1 leading-tight">
                    Productos Originales
                  </span>
                </div>
                <div className="p-2 sm:p-3 bg-surface-container-low/80 backdrop-blur-sm border border-surface-container flex flex-col">
                  <span className="font-headline-lg text-xl sm:text-2xl md:text-3xl text-amber-400 tracking-tighter leading-none">
                    980+
                  </span>
                  <span className="font-label-telemetry text-[9px] xs:text-[10px] sm:text-[11px] uppercase text-on-surface-variant mt-1 leading-tight">
                    Coleccionistas
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Right Deck: Spotlight Blister Pack Mockup with Dynamic Interactive Carousel */}
            <div className="lg:col-span-5 relative flex flex-col justify-center items-center py-2 sm:py-4 w-full">
              {/* Radial dynamic reactive spotlight halo */}
              <div
                className={`absolute w-[260px] h-[260px] sm:w-[420px] sm:h-[420px] bg-gradient-to-br ${haloClass} to-transparent rounded-full blur-[70px] sm:blur-[80px] pointer-events-none transition-all duration-700`}
              ></div>

              {/* Blister Card Container with Pause on Hover */}
              <div
                onMouseEnter={() => setIsHeroPaused(true)}
                onMouseLeave={() => setIsHeroPaused(false)}
                className="relative z-10 w-full max-w-[320px] xs:max-w-sm sm:max-w-[420px] flex flex-col items-center gap-2.5 sm:gap-3 group select-none"
              >
                {/* Blister Image Frame (100% Clean, Unobstructed Art & Bubble) */}
                <div
                  onClick={() => setSelectedProductModal(activeSpotlight)}
                  className="relative w-full h-[320px] xs:h-[370px] sm:h-[440px] md:h-[470px] rounded-2xl overflow-hidden border border-neutral-700/80 bg-neutral-950/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-sm transition-transform duration-500 group-hover:scale-[1.01] cursor-pointer"
                  title="Hacé clic para ver la foto en alta resolución y ficha técnica con lupa"
                >
                  
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
                  {/* Subtle lighting sheen without blocking the bottom card or vehicle */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none"></div>

                  {/* Quality / Rarity Badge Top Left */}
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-neutral-700 text-[10px] sm:text-[11px] font-label-telemetry text-primary-container uppercase font-bold tracking-wider shadow-lg max-w-[85%] truncate">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-secondary-container animate-ping shrink-0"></span>
                    <span className="truncate">{badgeText}</span>
                  </div>

                  {/* Auto-play pause indicator */}
                  {isHeroPaused && (
                    <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 bg-black/80 backdrop-blur-md px-2 sm:px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-label-telemetry text-neutral-300 uppercase tracking-widest border border-neutral-700/60 shadow">
                      PAUSADO
                    </div>
                  )}

                  {/* Hover Floating Hint for Zoom / Technical Sheet */}
                  <div className="absolute bottom-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 text-white font-label-telemetry text-[11px] uppercase tracking-wider backdrop-blur-md border border-neutral-700 shadow-xl pointer-events-none">
                    <span className="material-symbols-outlined text-sm text-primary-container">zoom_in</span>
                    <span>Ver Ficha & Zoom</span>
                  </div>

                  {/* Manual Arrow Controls (< and >) - Visible on touch/mobile, hover on desktop */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevHero();
                    }}
                    className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/75 hover:bg-black text-white border border-neutral-700/80 flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-lg cursor-pointer"
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
                    className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/75 hover:bg-black text-white border border-neutral-700/80 flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-lg cursor-pointer"
                    aria-label="Siguiente modelo"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>

                {/* Dedicated Lower Information Bar (Anchored and perfectly centered under the blister image) */}
                <div
                  onClick={() => setSelectedProductModal(activeSpotlight)}
                  className="w-full bg-[#121214]/90 backdrop-blur-md border border-neutral-800/90 hover:border-neutral-700 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-xl flex items-center justify-between gap-2.5 sm:gap-3 transition-all duration-300 cursor-pointer"
                  title="Hacé clic para ver la ficha técnica completa"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {/* Model Acronym Chip */}
                    <div className="w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-lg bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 font-extrabold text-[10px] sm:text-xs tracking-tighter shrink-0 font-sans">
                      {modelAcronym}
                    </div>
                    {/* Model Name & Serie/Category */}
                    <div className="flex flex-col min-w-0">
                      <span className="font-sans font-bold text-xs sm:text-[15px] text-white leading-tight truncate">
                        {activeSpotlight.modelo}
                      </span>
                      <span className="font-sans text-[10px] sm:text-[11px] text-neutral-400 truncate mt-0.5">
                        {activeSpotlight.serie || `${activeSpotlight.marca} // ${activeSpotlight.categoria}`}
                      </span>
                    </div>
                  </div>

                  {/* Price & Compact Harmonious CTA Button */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="font-sans font-extrabold text-[#FFC200] text-sm sm:text-lg whitespace-nowrap">
                      ${activeSpotlight.precio.toLocaleString('es-AR')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSpotlight();
                      }}
                      title={spotlightAdded ? '¡Agregado al carrito!' : 'Agregar al carrito'}
                      className={`w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold transition-all shrink-0 shadow-md ${
                        spotlightAdded
                          ? 'bg-emerald-500 text-white scale-105'
                          : 'bg-primary-container hover:bg-amber-400 text-black hover:scale-105 active:scale-95'
                      }`}
                      aria-label="Agregar al carrito"
                    >
                      {spotlightAdded ? (
                        <span className="material-symbols-outlined text-sm sm:text-base">check</span>
                      ) : (
                        <span className="material-symbols-outlined text-sm sm:text-base">shopping_cart</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================================
          2. SECCIÓN DESTACADOS DE LA SEMANA (CIRCUITO DE RAREZAS)
      ============================================================================== */}
      <section className="w-full bg-surface py-10 sm:py-16 md:py-24 border-b border-surface-container overflow-hidden" id="destacados">
        <div className="w-full px-3 sm:px-6 md:px-8 mx-auto max-w-7xl flex flex-col gap-6 sm:gap-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-surface-container">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-label-telemetry text-[11px] sm:text-xs uppercase tracking-widest text-secondary font-bold">
                  CIRCUITO DE RAREZAS // EDICIONES LIMITADAS
                </span>
              </div>
              <div className="flex flex-col">
                <h2 className="font-display-hero text-2xl sm:text-3xl md:text-5xl uppercase tracking-tight text-white flex items-center gap-3">
                  DESTACADOS
                </h2>
                <div className="w-16 sm:w-20 h-1 bg-primary-container rounded-full mt-1 sm:mt-1.5"></div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto pt-1 sm:pt-0">
              <Link
                href="/tienda"
                className="font-headline-sm text-xs sm:text-sm uppercase text-primary-container hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                Ver todo el catálogo
                <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
              </Link>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('destacados-grid');
                    if (el) el.scrollBy({ left: -280, behavior: 'smooth' });
                  }}
                  className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Anterior"
                >
                  <span className="material-symbols-outlined text-base sm:text-lg">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('destacados-grid');
                    if (el) el.scrollBy({ left: 280, behavior: 'smooth' });
                  }}
                  className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full border border-primary-container bg-primary-container/10 hover:bg-primary-container text-primary-container hover:text-black flex items-center justify-center transition-colors font-bold"
                  aria-label="Siguiente"
                >
                  <span className="material-symbols-outlined text-base sm:text-lg">chevron_right</span>
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
              className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-4 scroll-smooth no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0"
            >
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="w-[240px] xs:w-[260px] sm:w-[280px] lg:w-[285px] xl:w-[298px] shrink-0 group bg-surface-container-low hover:bg-surface-container transition-all duration-300 flex flex-col border border-surface-container hover:border-primary-container relative overflow-hidden"
                >
                  {/* Photo area */}
                  <div
                    onClick={() => setSelectedProductModal(product)}
                    className="relative w-full h-56 sm:h-64 bg-surface-container-lowest overflow-hidden cursor-pointer"
                    title="Hacé clic para ver fotos en alta resolución, lupa y ficha técnica"
                  >
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

                    {/* Hover Hint Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-20">
                      <span className="px-3 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-neutral-600 text-white font-label-telemetry text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xl">
                        <span className="material-symbols-outlined text-sm text-primary-container">zoom_in</span>
                        <span>Ver Ficha & Zoom</span>
                      </span>
                    </div>
                  </div>

                  {/* Body area */}
                  <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-label-telemetry text-[11px] uppercase text-outline truncate">
                        {product.serie || product.marca}
                      </span>
                      <h3
                        onClick={() => setSelectedProductModal(product)}
                        className="font-headline-md text-lg uppercase text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-1 cursor-pointer"
                        title="Ver ficha técnica"
                      >
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

                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        <button
                          onClick={() => addItem(product)}
                          className="py-2 sm:py-2.5 px-1 sm:px-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest active:scale-95 text-on-surface font-headline-sm text-[11px] sm:text-xs uppercase flex items-center justify-center gap-1 transition-all border border-surface-container-highest shadow-sm"
                        >
                          <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                          <span>CARRITO</span>
                        </button>
                        <a
                          href={getWhatsAppProductUrl(product)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 sm:py-2.5 px-1 sm:px-2 rounded-lg bg-primary-container hover:bg-surface-tint active:scale-95 text-on-primary-container font-headline-sm text-[11px] sm:text-xs uppercase flex items-center justify-center gap-1 transition-all font-bold shadow-sm"
                        >
                          <span className="material-symbols-outlined text-sm">chat</span>
                          <span>WHATSAPP</span>
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
      <section className="w-full bg-carbon-pattern py-10 sm:py-16 md:py-24 border-b border-surface-container relative overflow-hidden" id="encargos">
        <div className="absolute top-0 right-10 w-80 sm:w-96 h-80 sm:h-96 bg-primary-container/10 rounded-full blur-[130px] pointer-events-none"></div>

        <div className="w-full px-3 sm:px-6 md:px-8 mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Information Column */}
            <div className="lg:col-span-5 flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-primary-container rounded-sm shadow-[0_0_8px_rgba(255,194,0,0.6)]"></span>
                  <span className="font-label-telemetry text-[11px] sm:text-xs uppercase tracking-widest text-primary-container font-bold">
                    GARAJE DE BÚSQUEDA &amp; IMPORTACIÓN
                  </span>
                </div>
                <h2 className="font-display-hero text-2xl sm:text-3xl md:text-5xl uppercase tracking-tight text-white leading-none">
                  ¿BUSCÁS UNA PIEZA QUE TE PARECE <span className="text-primary-container italic font-black drop-shadow-[0_2px_12px_rgba(255,194,0,0.35)]">IMPOSIBLE DE ENCONTRAR</span>?
                </h2>
                <p className="font-body-md text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed">
                  Nosotros nos encargamos de rastrearla, revisamos con la lupa su autenticidad y te la acercamos directo a tus manos. Contamos con una red de coleccionistas amigos en todo el país.
                </p>
              </div>

              {/* Protocol steps - High-end modern card */}
              <div className="flex flex-col gap-3.5 sm:gap-4 bg-gradient-to-b from-surface-container/90 to-surface-container-low/95 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/10 border-l-4 border-l-primary-container shadow-xl">
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                  <span className="material-symbols-outlined text-primary-container text-xl">saved_search</span>
                  <span className="font-headline-sm text-sm sm:text-base uppercase text-white font-bold tracking-wide">
                    Proceso de Búsqueda (Paso a Paso)
                  </span>
                </div>
                <div className="flex flex-col gap-3.5 font-body-sm text-xs sm:text-sm">
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-container/10 border border-primary-container/25 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="font-display-hero font-black text-primary-container text-sm">1</span>
                    </div>
                    <span className="text-neutral-200 leading-snug">
                      Buscamos en subastas privadas, clubes de coleccionistas exclusivos y grupos de fans de todo el país.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-container/10 border border-primary-container/25 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="font-display-hero font-black text-primary-container text-sm">2</span>
                    </div>
                    <span className="text-neutral-200 leading-snug">
                      Hacemos un control fotográfico detallado y revisamos el estado del producto.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-container/10 border border-primary-container/25 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="font-display-hero font-black text-primary-container text-sm">3</span>
                    </div>
                    <span className="text-neutral-200 leading-snug">
                      Solo cobramos una seña que queda congelada y pagás el resto recién cuando veas las fotos reales de la pieza ya en nuestras manos y das tu okay.
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantee alert box */}
              <div className="p-3.5 sm:p-4.5 bg-[#18181b]/95 backdrop-blur-md rounded-xl border border-primary-container/25 border-l-4 border-l-primary-container flex items-start gap-3 sm:gap-3.5 shadow-md">
                <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-primary-container/15 flex items-center justify-center shrink-0 text-primary-container mt-0.5">
                  <span className="material-symbols-outlined text-lg sm:text-xl">verified</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label-telemetry text-xs uppercase tracking-wider text-primary-container font-extrabold">
                    COMPROMISO DE CALIDAD Y CONFIANZA
                  </span>
                  <p className="font-body-sm text-xs sm:text-[13px] text-neutral-300 leading-relaxed">
                    Si la pieza no llega en las condiciones acordadas, se te devolverá el total de lo abonado previa devolución del producto.
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Request Form connected to Supabase */}
            <div className="lg:col-span-7 bg-surface-container-low/95 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-5 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-primary-container/15 border border-primary-container/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary-container text-base sm:text-lg">assignment</span>
                  </div>
                  <span className="font-headline-sm text-base sm:text-lg md:text-xl uppercase text-white font-bold tracking-wide">
                    FORMULARIO DE BÚSQUEDA PERSONALIZADA
                  </span>
                </div>
                <span className="font-label-telemetry text-xs text-primary-container hidden sm:inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-full bg-primary-container/10 border border-primary-container/20">
                  <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                  RADAR ACTIVO
                </span>
              </div>

              <form onSubmit={handleEncargoSubmit} className="flex flex-col gap-4.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-telemetry text-xs uppercase tracking-wider text-neutral-200 font-semibold">
                      CONTANOS TU NOMBRE <span className="text-primary-container">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Martín Rodríguez"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-4 py-3 sm:py-3.5 rounded-lg bg-[#141416] border border-neutral-700/80 hover:border-neutral-500 text-white font-body-sm text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/40 transition-all"
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-telemetry text-xs uppercase tracking-wider text-neutral-200 font-semibold">
                      WHATSAPP O TELÉFONO MÓVIL <span className="text-primary-container">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+54 9 11 5555-0123"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full px-4 py-3 sm:py-3.5 rounded-lg bg-[#141416] border border-neutral-700/80 hover:border-neutral-500 text-white font-body-sm text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/40 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Marca y Categoría */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-telemetry text-xs uppercase tracking-wider text-neutral-200 font-semibold">
                      INDICÁ MARCA Y CATEGORÍA DE LA PIEZA <span className="text-primary-container">*</span>
                    </label>
                    <select
                      required
                      value={formData.serie}
                      onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                      className="w-full px-4 py-3 sm:py-3.5 rounded-lg bg-[#141416] border border-neutral-700/80 hover:border-neutral-500 text-white font-body-sm text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/40 transition-all cursor-pointer"
                    >
                      <option value="">Seleccioná una línea o marca...</option>
                      {CATALOG_BRANDS.map((brand) => (
                        <option key={brand.value} value={brand.value} className="bg-[#18181b] text-white">
                          {brand.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Escala Automotor */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-telemetry text-xs uppercase tracking-wider text-neutral-200 font-semibold">
                      ESCALA REQUERIDA
                    </label>
                    <select
                      value={formData.estado_empaque}
                      onChange={(e) => setFormData({ ...formData, estado_empaque: e.target.value })}
                      className="w-full px-4 py-3 sm:py-3.5 rounded-lg bg-[#141416] border border-neutral-700/80 hover:border-neutral-500 text-white font-body-sm text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/40 transition-all cursor-pointer"
                    >
                      <option value="1:64" className="bg-[#18181b] text-white">1:64 (Escala Principal)</option>
                      {CATALOG_SCALES.filter((scale) => scale !== '1:64').map((scale) => (
                        <option key={scale} value={scale} className="bg-[#18181b] text-white">
                          {scale}
                        </option>
                      ))}
                      <option value="Indiferente" className="bg-[#18181b] text-white">Indiferente / Cualquier escala</option>
                    </select>
                  </div>
                </div>

                {/* Modelo exacto */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-telemetry text-xs uppercase tracking-wider text-neutral-200 font-semibold">
                    DESCRIBÍ EL MODELO EXACTO <span className="text-primary-container">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Toyota Supra MK4 1994 Amarillo Fast & Furious o Porsche 930 RLC Spectraflame Pink"
                    value={formData.modelo_buscado}
                    onChange={(e) => setFormData({ ...formData, modelo_buscado: e.target.value })}
                    className="w-full px-4 py-3 sm:py-3.5 rounded-lg bg-[#141416] border border-neutral-700/80 hover:border-neutral-500 text-white font-body-sm text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/40 transition-all"
                  />
                </div>

                {/* Presupuesto */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-telemetry text-xs uppercase tracking-wider text-neutral-200 font-semibold">
                    ¿CUÁL ES TU PRESUPUESTO APROXIMADO?
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Hasta $40.000 ARS o 45 USD"
                    value={formData.presupuesto}
                    onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })}
                    className="w-full px-4 py-3 sm:py-3.5 rounded-lg bg-[#141416] border border-neutral-700/80 hover:border-neutral-500 text-white font-body-sm text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/40 transition-all"
                  />
                </div>

                {/* Submit button */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 sm:h-14 py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-xl bg-primary-container hover:bg-[#ffd033] active:scale-[0.98] text-neutral-950 font-display-hero font-extrabold text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2 sm:gap-3 transition-all duration-200 shadow-[0_4px_18px_rgba(255,194,0,0.35)] hover:shadow-[0_6px_24px_rgba(255,194,0,0.5)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {submitting ? (
                      <>
                        <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
                        <span>CONECTANDO CON PIT CREW...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[22px] transition-transform duration-200 group-hover:translate-x-1 shrink-0">search</span>
                        <span>¡EMPEZAR LA BÚSQUEDA!</span>
                      </>
                    )}
                  </button>

                  {/* Feedback Message */}
                  {submitSuccess && (
                    <div className="p-3.5 rounded-lg bg-primary-container/15 border border-primary-container/30 text-on-surface font-label-telemetry text-xs flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-primary-container text-lg">check_circle</span>
                      <span className="text-primary-container font-bold uppercase tracking-wider">
                        ¡BÚSQUEDA ENVIADA! NOS CONTACTAREMOS VÍA WHATSAPP EN BREVE CON LAS PRIMERAS OPCIONES.
                      </span>
                    </div>
                  )}

                  {submitError && (
                    <div className="p-3.5 rounded-lg bg-error-container/30 border border-error-container text-error font-label-telemetry text-xs flex items-center gap-2.5">
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
          4. SECCIÓN DE CONFIANZA Y COMPROMISOS CON TU COLECCIÓN
      ============================================================================== */}
      <section className="relative w-full bg-[#111111] py-12 sm:py-16 md:py-24 border-b border-surface-container overflow-hidden">
        {/* Diamond Plate Industrial Floor Texture at Bottom */}
        <div className="absolute inset-x-0 bottom-0 h-44 sm:h-56 bg-diamond-plate opacity-50 pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-0 h-44 sm:h-56 bg-gradient-to-t from-transparent via-[#111111]/70 to-[#111111] pointer-events-none"></div>

        <div className="relative w-full px-3 sm:px-6 md:px-8 mx-auto max-w-7xl flex flex-col gap-6 sm:gap-8 z-10">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center gap-1.5">
            <span className="font-label-telemetry text-[11px] sm:text-xs uppercase tracking-widest text-primary-container font-bold">
              ESTÁNDAR DE OPERACIONES WHEELS ZONE
            </span>
            <h2 className="font-display-hero text-2xl sm:text-3xl md:text-5xl uppercase tracking-tight text-white">
              NUESTROS <span className="text-secondary-container">COMPROMISOS CON TU COLECCIÓN</span>
            </h2>
            <p className="font-body-md text-xs sm:text-sm md:text-base text-neutral-300 max-w-2xl leading-relaxed">
              Sabemos lo valiosa que es cada pieza para vos. Por eso, nos encargamos de que todo llegue impecable.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-6 lg:gap-8 items-stretch pt-6 sm:pt-8">
            {/* Card 1: Protección Total */}
            <div className="bg-[#161618] border border-neutral-800 p-5 sm:p-6 md:p-7 flex flex-col justify-between gap-4 transition-colors hover:border-neutral-700">
              <div className="flex flex-col gap-3.5 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-container text-white flex items-center justify-center shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-xl sm:text-2xl">shield</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-display-hero text-lg sm:text-xl uppercase font-bold tracking-tight text-white leading-tight">
                    PROTECCIÓN TOTAL EN CADA ENVÍO
                  </h3>
                  <span className="font-label-telemetry text-[11px] sm:text-xs text-secondary-container uppercase font-bold tracking-wider">
                    ENVOLTURA SEGURA + CAJA RESISTENTE
                  </span>
                </div>
                <p className="font-body-sm text-xs sm:text-[13px] text-neutral-300 leading-relaxed">
                  Cada blister va en su protector individual, cubierto por doble capa de plástico de burbujas y embalado en cajas súper resistentes para asegurar que llegue intacto.
                </p>
              </div>

              <div className="pt-2 font-label-telemetry text-xs text-primary-container flex items-center gap-1.5 font-bold tracking-wider">
                <span className="material-symbols-outlined text-base">check</span>
                <span>CERO ESQUINAS DOBLADAS GARANTIZADO</span>
              </div>
            </div>

            {/* Card 2: Autenticidad 100% */}
            <div className="bg-[#161618] border-2 border-[#FFC200] p-5 sm:p-6 md:p-7 flex flex-col justify-between gap-4 shadow-[0_4px_25px_rgba(0,0,0,0.6)] transition-all relative">
              <div className="flex flex-col gap-3.5 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-container text-black flex items-center justify-center shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-xl sm:text-2xl font-bold">verified_user</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-display-hero text-lg sm:text-xl uppercase font-bold tracking-tight text-white leading-tight">
                    AUTENTICIDAD 100% GARANTIZADA
                  </h3>
                  <span className="font-label-telemetry text-[11px] sm:text-xs text-primary-container uppercase font-bold tracking-wider">
                    CALIDAD Y ORIGINALIDAD ASEGURADAS
                  </span>
                </div>
                <p className="font-body-sm text-xs sm:text-[13px] text-neutral-300 leading-relaxed">
                  Todas nuestras piezas son completamente originales y pasan por un control previo riguroso. Comprá con total tranquilidad.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2 font-label-telemetry text-xs text-primary-container font-bold tracking-wider">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">check</span>
                  <span>CASTINGS CERTIFICADOS POR EXPERTOS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">check</span>
                  <span>MODELOS CONTROLADOS Y VERIFICADOS</span>
                </div>
              </div>
            </div>

            {/* Card 3: Transferencia con 20% OFF (Featured with Glowing Halo) */}
            <div className="bg-[#161618] border-2 border-[#FFC200] p-5 sm:p-6 md:p-7 flex flex-col justify-between gap-4 shadow-[0_0_35px_rgba(255,194,0,0.35)] relative transition-all">
              {/* Floating Top Badge with Golden Radial Glow */}
              <div className="absolute -top-9 sm:-top-11 right-6 sm:right-8 md:right-4 lg:right-8 flex flex-col items-center pointer-events-none select-none z-20">
                {/* Radial Golden Halo */}
                <div className="absolute inset-0 -inset-x-8 -inset-y-4 bg-primary-container/35 blur-xl rounded-full pointer-events-none"></div>

                <div className="relative flex flex-col items-center leading-none">
                  <span className="font-display-hero font-bold text-[11px] sm:text-[12px] lg:text-[13px] text-white tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    TRANSFERENCIA CON
                  </span>
                  <div className="flex items-start text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                    <span className="font-display-hero font-black text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-none text-white drop-shadow-[0_0_20px_rgba(255,194,0,0.6)]">
                      20
                    </span>
                    <div className="flex flex-col ml-0.5 justify-center leading-none pt-0.5 sm:pt-1">
                      <span className="font-display-hero font-black text-2xl sm:text-3xl lg:text-4xl leading-none text-white drop-shadow-[0_0_15px_rgba(255,194,0,0.6)]">
                        %
                      </span>
                      <span className="font-display-hero font-black text-lg sm:text-xl lg:text-2xl leading-none text-white tracking-tight -mt-0.5">
                        OFF
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3.5 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-xl sm:text-2xl">savings</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-display-hero text-lg sm:text-xl uppercase font-bold tracking-tight text-white leading-tight">
                    TRANSFERENCIA CON 20% OFF
                  </h3>
                  <span className="font-label-telemetry text-[11px] sm:text-xs text-neutral-300 uppercase font-bold tracking-wider">
                    ¡APROVECHÁ EL DESCUENTO MÁS GRANDE!
                  </span>
                </div>
                <p className="font-body-sm text-xs sm:text-[13px] text-neutral-300 leading-relaxed">
                  Pagá de forma directa por transferencia bancaria instantánea y aplicá un 20% de ahorro en tu compra. Aceptamos tarjetas vía Mercado Pago.
                </p>
              </div>

              <div className="pt-2 font-label-telemetry text-xs text-primary-container flex items-center gap-1.5 font-bold tracking-wider">
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
      <section className="w-full bg-carbon-pattern py-10 sm:py-16 md:py-24 border-b border-surface-container relative overflow-hidden" id="showroom">
        <div className="absolute top-1/2 left-0 w-80 sm:w-96 h-80 sm:h-96 bg-primary-container/10 rounded-full blur-[130px] pointer-events-none"></div>

        <div className="w-full px-3 sm:px-6 md:px-8 mx-auto max-w-7xl relative z-10 flex flex-col gap-6 sm:gap-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 pb-2 border-b border-surface-container">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-primary-container rounded-full animate-ping"></span>
                <span className="font-label-telemetry text-[11px] sm:text-xs uppercase tracking-widest text-primary-container font-bold">
                  WHEELS ZONE SHOWROOM / PUNTO DE RETIRO
                </span>
              </div>
              <h2 className="font-display-hero text-2xl sm:text-3xl md:text-5xl uppercase tracking-tight text-on-surface">
                VENÍ A CONOCER EL <span className="text-gradient-flame italic">GARAJE EN PERSONA</span>
              </h2>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant max-w-md">
              Inspeccioná las piezas bajo luz natural, comprobá el estado de los blísteres en mano y retirá tus compras de inmediato sin costo de envío.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            {/* Left Column: Headquarters Info & Action Buttons (5 Cols) */}
            <div className="lg:col-span-5 bg-surface-container-low/95 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-between gap-5 sm:gap-6 shadow-2xl relative">
              <div className="flex flex-col gap-4 sm:gap-5">
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-lg sm:text-xl">storefront</span>
                    <span className="font-headline-sm uppercase text-xs sm:text-sm text-white font-bold tracking-wider">
                      WHEELS ZONE SHOWROOM / PUNTO DE RETIRO
                    </span>
                  </div>
                  <span className="font-label-telemetry text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-secondary-container text-on-secondary-container uppercase font-extrabold shadow-sm">
                    PUNTO DE RETIRO
                  </span>
                </div>

                {/* Address Box */}
                <div className="flex flex-col gap-2 p-3.5 sm:p-5 rounded-xl bg-gradient-to-br from-surface-container/90 to-surface-container-low border border-primary-container/20 border-l-4 border-l-primary-container shadow-md">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-white/5">
                    <span className="font-display-hero text-xs sm:text-[15px] uppercase text-primary-container font-extrabold tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-amber-400 shrink-0">location_on</span>
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

                  {/* Cuerpo de la Dirección con separación clara */}
                  <div className="flex flex-col gap-0.5 mt-1 mb-1">
                    <p className="font-display-hero text-lg sm:text-xl md:text-2xl font-black uppercase text-white leading-tight tracking-wide">
                      RIOJA 281, 6002 JUNÍN, ARGENTINA
                    </p>
                    <span className="font-label-telemetry text-[11px] sm:text-xs text-[#FFC200] font-bold tracking-wider">
                      (Código Postal: 6002)
                    </span>
                  </div>
                  
                  {/* Detalle de Zona en gris claro de alto contraste */}
                  <span className="text-xs sm:text-[13px] font-sans font-medium text-neutral-200 leading-relaxed">
                    Provincia de Buenos Aires // Zona de fácil acceso
                  </span>
                </div>

                {/* Horarios */}
                <div className="flex flex-col gap-2 font-label-telemetry text-xs">
                  <span className="uppercase text-neutral-300 font-bold flex items-center gap-1.5 tracking-wider">
                    <span className="material-symbols-outlined text-sm text-primary-container">schedule</span>
                    HORARIOS DE ATENCIÓN DEL SHOWROOM
                  </span>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-on-surface">
                    <div className="p-2.5 sm:p-3 rounded-lg bg-[#141416] border border-neutral-700/70 flex flex-col">
                      <span className="text-primary-container font-extrabold text-xs">LUNES A VIERNES</span>
                      <span className="text-[11px] text-neutral-300 mt-0.5">09:30 a 13:00 hs</span>
                      <span className="text-[11px] text-neutral-300">16:30 a 20:30 hs</span>
                    </div>
                    <div className="p-2.5 sm:p-3 rounded-lg bg-[#141416] border border-neutral-700/70 flex flex-col">
                      <span className="text-primary-container font-extrabold text-xs">SÁBADOS</span>
                      <span className="text-[11px] text-neutral-300 mt-0.5">10:00 a 13:30 hs</span>
                      <span className="text-[11px] text-neutral-300">17:00 a 20:30 hs (consultar previamente)</span>
                    </div>
                  </div>
                </div>

                {/* Showroom Perks */}
                <div className="flex flex-col gap-2.5 sm:gap-3 font-sans text-xs sm:text-[13px] text-neutral-200 pt-1">
                  <div className="flex items-start gap-2 sm:gap-2.5 leading-snug">
                    <span className="material-symbols-outlined text-amber-400 text-sm sm:text-base font-bold shrink-0 mt-0.5">check</span>
                    <span>Más de 1.200 autitos coleccionables y STH en exhibición permanente.</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-2.5 leading-snug">
                    <span className="material-symbols-outlined text-amber-400 text-sm sm:text-base font-bold shrink-0 mt-0.5">check</span>
                    <span>20% OFF en efectivo o transferencia directa al retirar en showroom.</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-2.5 leading-snug">
                    <span className="material-symbols-outlined text-amber-400 text-sm sm:text-base font-bold shrink-0 mt-0.5">check</span>
                    <span>Calidad y autenticidad aseguradas en cada pieza.</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 sm:gap-3 pt-3 border-t border-white/10">
                {/* Botón Principal: Coordinar visita por WhatsApp con verde corporativo y logo oficial */}
                <a
                  href={`https://wa.me/${phone}?text=${encodeURIComponent('¡Hola Willson! Quiero coordinar para pasar a visitar el showroom de Wheels Zone en Rioja 281, Junín para ver/retirar piezas.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-display-hero font-extrabold uppercase text-xs sm:text-sm md:text-base tracking-wider flex items-center justify-center gap-2.5 sm:gap-3 shadow-[0_4px_20px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.55)] hover:scale-[1.01] transition-all duration-300 border border-emerald-400/40 group cursor-pointer text-center"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-white shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.301-.15-1.767-.867-2.04-.966-.274-.101-.473-.15-.673.15-.197.295-.771.966-.944 1.162-.175.197-.349.222-.65.074-.301-.15-1.27-.467-2.42-1.485-.896-.795-1.501-1.777-1.677-2.077-.175-.3-.019-.461.13-.61.134-.133.301-.347.451-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.01-.371-.01-.571-.01-.2 0-.523.074-.797.372-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>COORDINAR VISITA POR WHATSAPP</span>
                </a>

                {/* Botones Secundarios: Estilo compacto, sutil y elegante */}
                <div className="flex flex-row items-center gap-2">
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=Rioja+281,+6002+Jun%C3%ADn,+Provincia+de+Buenos+Aires"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-8 sm:h-9 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white font-sans font-medium text-[11px] sm:text-xs tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" width="14" height="14">
                      <path fill="#4285F4" d="M12 2C7.58 2 4 5.58 4 10c0 5.25 7 12.25 7.42 12.67a.8.8 0 001.16 0C13 22.25 20 15.25 20 10c0-4.42-3.58-8-8-8z"/>
                      <circle cx="12" cy="10" r="3.2" fill="#FFFFFF"/>
                      <path fill="#EA4335" d="M12 2C7.58 2 4 5.58 4 10c0 2.37 1.05 4.84 2.62 7.15l5.38-7.15z"/>
                      <path fill="#FBBC05" d="M6.62 17.15A23.7 23.7 0 0012 22.67v-9.82l-5.38 4.3z"/>
                      <path fill="#34A853" d="M12 22.67c1.78-1.78 5.38-6.17 5.38-12.67H12v12.67z"/>
                      <circle cx="12" cy="10" r="3" fill="#FFFFFF"/>
                    </svg>
                    <span className="truncate">CÓMO LLEGAR (MAPS)</span>
                  </a>

                  <a
                    href="https://waze.com/ul?q=Rioja+281,+6002+Jun%C3%ADn,+Argentina&navigate=yes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-8 sm:h-9 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white font-sans font-medium text-[11px] sm:text-xs tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" width="14" height="14">
                      <path fill="#33CCFF" d="M20.54 13.13a7.48 7.48 0 0 0-1.46-4.63 7.84 7.84 0 0 0-6.19-3.23 8.35 8.35 0 0 0-3.79.88A7.8 7.8 0 0 0 5.4 9.17a7.6 7.6 0 0 0-.82 3.82c0 .63.07 1.25.21 1.86a4.2 4.2 0 0 0-1.74 3.44 4.29 4.29 0 0 0 4.29 4.28h9.85a4.84 4.84 0 0 0 4.84-4.84 4.67 4.67 0 0 0-1.49-3.4zm-11.4 3.43a1.43 1.43 0 1 1 0-2.86 1.43 1.43 0 0 1 0 2.86zm5.72 0a1.43 1.43 0 1 1 0-2.86 1.43 1.43 0 0 1 0 2.86z"/>
                      <circle cx="9.14" cy="14.56" r="1.4" fill="#000000"/>
                      <circle cx="14.86" cy="14.56" r="1.4" fill="#000000"/>
                    </svg>
                    <span className="truncate">ABRIR EN WAZE</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Google Maps Interactive Dark Mode Embed (7 Cols) */}
            <div className="lg:col-span-7 bg-surface-container-low border border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-2xl relative overflow-hidden flex flex-col group min-h-[320px] sm:min-h-[400px] md:min-h-[440px]">
              {/* Floating Top Telemetry Bar */}
              <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/90 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg border border-primary-container/80 shadow-xl max-w-[90%] truncate">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-secondary-container animate-ping shrink-0"></span>
                <span className="font-label-telemetry text-[10px] sm:text-xs uppercase text-primary-container font-bold tracking-wider truncate">
                  WHEELS ZONE // RIOJA 281, 6002 JUNÍN
                </span>
              </div>

              {/* Google Maps Iframe with dark theme inversion filter */}
              <div className="relative w-full h-full min-h-[300px] sm:min-h-[380px] md:min-h-[420px] rounded-xl overflow-hidden bg-surface-container-lowest">
                <iframe
                  title="Ubicación Showroom Wheels Zone en Google Maps"
                  src="https://maps.google.com/maps?q=Rioja+281,+B6022+Jun%C3%ADn,+Provincia+de+Buenos+Aires&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full min-h-[300px] sm:min-h-[380px] md:min-h-[420px] border-0"
                  style={{
                    filter: 'invert(90%) hue-rotate(180deg) contrast(125%) grayscale(25%)',
                  }}
                  loading="lazy"
                  allowFullScreen
                ></iframe>

                {/* Floating GPS Action Card in Map */}
                <a
                  href="https://maps.google.com/?q=Rioja+281,+B6022+Jun%C3%ADn,+Provincia+de+Buenos+Aires"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#18181b]/95 hover:bg-[#232328] text-white hover:text-primary-container font-sans font-semibold text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 border border-neutral-700/80 hover:border-primary-container/60 rounded-xl transition-all shadow-2xl backdrop-blur-md group"
                >
                  <span className="material-symbols-outlined text-sm sm:text-base text-primary-container group-hover:scale-110 transition-transform">open_in_new</span>
                  <span>VER EN MAPS</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================================
          6. BANNER FINAL VELOCIDAD CALL TO ACTION
      ============================================================================== */}
      <section className="w-full bg-secondary-container text-on-secondary-container py-8 sm:py-10 relative overflow-hidden">
        <div className="w-full px-3 sm:px-6 md:px-8 mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 relative z-10 text-center md:text-left">
          <div className="flex flex-col gap-1">
            <span className="font-label-telemetry text-xs uppercase tracking-widest text-primary-fixed font-bold">
              ¡NO DEJES ESCAPAR ESA PIEZA!
            </span>
            <h2 className="font-headline-lg text-xl sm:text-2xl md:text-3xl uppercase tracking-tight text-on-secondary-container">
              ¿TENÉS DUDAS O QUERÉS VER FOTOS ADICIONALES DEL BLÍSTER?
            </h2>
            <p className="font-body-md text-xs sm:text-sm text-on-secondary-container/90 max-w-2xl">
              Chateá directamente con nuestro equipo de coleccionistas por WhatsApp y te enviamos video en vivo 360° de la pieza.
            </p>
          </div>
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent('¡Hola Wheels Zone! Quiero fotos y video 360° de las piezas disponibles.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-center justify-center whitespace-nowrap px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl bg-surface-container-lowest text-primary font-headline-md text-xs sm:text-sm md:text-base uppercase tracking-wider flex items-center gap-2 hover:bg-surface-container transition-colors shadow-xl shrink-0"
          >
            <span className="material-symbols-outlined text-primary-container text-base sm:text-xl">support_agent</span>
            <span>HABLAR CON UN ASESOR</span>
          </a>
        </div>
      </section>

      {/* ==============================================================================
          MODAL DE FICHA TÉCNICA CON FOTOGRAFÍA AMPLIADA, ZOOM INTERACTIVO Y LIGHTBOX
      ============================================================================== */}
      <ProductModal
        product={selectedProductModal}
        onClose={() => setSelectedProductModal(null)}
      />
    </div>
  );
}
