'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import FireParticles from '@/components/FireParticles';
import { Product } from '@/lib/types';
import { fetchProducts, createLead } from '@/lib/supabase';
import { useCart } from '@/lib/cart-context';

export default function HomePage() {
  const { addItem } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

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

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5491122334455';

  useEffect(() => {
    async function loadData() {
      try {
        const products = await fetchProducts();
        const featured = products.filter((p) => p.destacado).slice(0, 4);
        setFeaturedProducts(featured.length > 0 ? featured : products.slice(0, 4));
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
      <section className="relative w-full overflow-hidden bg-carbon-pattern py-12 md:py-20 lg:py-28 border-b border-surface-container">
        {/* Dynamic Fire Particles Canvas */}
        <FireParticles />

        {/* Ambient Telemetry Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-secondary-container/20 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/2 right-0 w-[32rem] h-[32rem] bg-primary-container/15 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-telemetry-grid opacity-30 pointer-events-none"></div>

        <div className="relative w-full px-4 md:px-8 mx-auto max-w-7xl z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Hero Text Deck */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* Velocity Status Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container text-on-secondary-container font-label-telemetry text-xs tracking-widest uppercase">
                  <span className="material-symbols-outlined text-sm animate-bounce" style={{ fontVariationSettings: '"FILL" 1' }}>
                    local_fire_department
                  </span>
                  STOCK LIMITADO
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high text-primary-container font-label-telemetry text-xs tracking-widest uppercase border border-surface-container-highest">
                  <span className="material-symbols-outlined text-sm">shield</span>
                  ENVÍO BLINDADO CARD-PROTECT
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-outline font-label-telemetry text-xs">
                  RADAR: ONLINE // EDICIÓN 2024
                </span>
              </div>

              {/* Main Impact Title */}
              <div className="flex flex-col">
                <span className="font-headline-sm text-sm md:text-base uppercase tracking-widest text-primary-container flex items-center gap-2">
                  <span className="w-8 h-1 bg-primary-container inline-block"></span>
                  DIVISIÓN PADDOCK 1:64
                </span>
                <h1 className="font-display-hero text-4xl sm:text-5xl md:text-6xl uppercase text-on-surface tracking-tight mt-2 leading-[0.95] drop-shadow-md">
                  LA ZONA DEFINITIVA PARA{' '}
                  <span className="text-gradient-flame italic">
                    COLECCIONISTAS
                  </span>{' '}
                  DE ALTA VELOCIDAD
                </h1>
              </div>

              <p className="font-body-lg text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
                Encontrá piezas únicas, Mainlines seleccionados, líneas Premium, exclusividades RLC y los codiciados Super Treasure Hunts con embalaje de grado industrial blindado a todo el país.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/tienda"
                  className="relative group px-6 py-4 bg-gradient-to-r from-primary-container via-surface-tint to-secondary-container text-surface-container-lowest font-headline-md text-base md:text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary-container/20 chamfer-tr"
                >
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                    speed
                  </span>
                  <span>EXPLORAR CATÁLOGO COMPLETO</span>
                </Link>

                <a
                  href="#encargos"
                  className="px-6 py-4 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-on-surface font-headline-md text-base md:text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-colors duration-200"
                >
                  <span className="material-symbols-outlined text-xl text-primary-container">travel_explore</span>
                  <span>HACER UN ENCARGO ESPECIAL</span>
                </a>
              </div>

              {/* Live Race Counters */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-surface-container-high">
                <div className="p-3 bg-surface-container-low border border-surface-container flex flex-col">
                  <span className="font-headline-lg text-2xl md:text-3xl text-primary-container tracking-tighter leading-none">
                    +1,250
                  </span>
                  <span className="font-label-telemetry text-[11px] uppercase text-on-surface-variant mt-1">
                    Modelos en Stock
                  </span>
                </div>
                <div className="p-3 bg-surface-container-low border border-surface-container flex flex-col">
                  <span className="font-headline-lg text-2xl md:text-3xl text-secondary tracking-tighter leading-none">
                    100%
                  </span>
                  <span className="font-label-telemetry text-[11px] uppercase text-on-surface-variant mt-1">
                    Blíster Cuidado C-10
                  </span>
                </div>
                <div className="p-3 bg-surface-container-low border border-surface-container flex flex-col">
                  <span className="font-headline-lg text-2xl md:text-3xl text-tertiary-fixed tracking-tighter leading-none">
                    980+
                  </span>
                  <span className="font-label-telemetry text-[11px] uppercase text-on-surface-variant mt-1">
                    Coleccionistas Felices
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Visual Spotlight Mockup */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              {/* Pulsing Radar Ring */}
              <div className="absolute w-[300px] h-[300px] md:w-[420px] md:h-[420px] bg-secondary-container/10 rounded-full flex items-center justify-center pointer-events-none animate-pulse">
                <div className="w-3/4 h-3/4 bg-primary-container/10 rounded-full flex items-center justify-center">
                  <div className="w-1/2 h-1/2 bg-surface-container-highest/20 rounded-full"></div>
                </div>
              </div>

              {/* Spotlight Die-Cast Card */}
              <div className="relative z-10 w-full max-w-md bg-surface-container-low border-2 border-primary-container/40 p-4 shadow-2xl flex flex-col gap-3 group">
                <div className="flex items-center justify-between pb-1 border-b border-surface-container-highest">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-secondary-container rounded-full animate-ping"></span>
                    <span className="font-label-telemetry text-xs uppercase text-primary tracking-widest font-bold">
                      SPOTLIGHT OFICIAL
                    </span>
                  </div>
                  <span className="font-label-telemetry text-[11px] px-2 py-0.5 bg-surface-container-highest text-outline uppercase">
                    SERIE PREMIUM CAR CULTURE
                  </span>
                </div>

                {/* Showcase Image */}
                <div className="relative w-full h-72 md:h-80 bg-surface-container-lowest overflow-hidden border border-surface-container flex items-center justify-center">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQvZS12mbKb8nmB3EtCJiJFGVrC8KgusEcf8NfnxbrNmoTRwX7Yxzw1u9EtVLnYTfrsjRSYO3ATU-owjBX_Jt-uaSJrJMDKvyVvxlg5A3eajb3_AtPwcMS-WHlSCQyfOwAIaBHtg8tJK2GwCJbgRn6J6gsq45t2aqHvbzhLNwe0kceg2QHxRLFGhfuqRi1TaD3VU6AChARkeYG4ke0XBy1ICk9BO-igcP8TW9y3X_nOG6RIB_mXQbXcA"
                    alt="Nissan Skyline GT-R BNR34 Nismo Fast and Furious"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="bg-secondary-container text-on-secondary-container font-label-telemetry text-[11px] px-2 py-0.5 uppercase font-bold tracking-wider">
                      SPECTRAFLAME FINISH
                    </span>
                    <span className="bg-surface-container-lowest/90 backdrop-blur-sm text-primary font-label-telemetry text-[11px] px-2 py-0.5 uppercase tracking-wider">
                      REAL RIDERS TIRES
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-end justify-between">
                    <div>
                      <span className="font-headline-sm text-base text-white uppercase block leading-tight">
                        Nissan Skyline R34 Nismo
                      </span>
                      <span className="font-body-sm text-xs text-on-surface-variant">
                        Chasis Metálico // Edición Limitada
                      </span>
                    </div>
                    <span className="font-label-price text-2xl text-primary-container">
                      $18.500
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 font-label-telemetry text-xs text-outline">
                  <span>ESC: 1:64 REAL DIE-CAST</span>
                  <span className="text-primary-container flex items-center gap-1 font-bold">
                    <span className="material-symbols-outlined text-sm">verified</span> CERTIFICADO MINT 10/10
                  </span>
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-surface-container">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-secondary-container"></span>
                <span className="font-label-telemetry text-xs uppercase tracking-widest text-secondary font-bold">
                  CIRCUITO DE RAREZAS // EDICIONES LIMITADAS
                </span>
              </div>
              <h2 className="font-display-hero text-3xl md:text-5xl uppercase tracking-tight text-on-surface">
                DESTACADOS DE LA <span className="text-primary-container italic">SEMANA</span>
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-body-sm text-xs text-on-surface-variant max-w-md hidden md:block">
                Piezas verificadas bajo el estricto protocolo C-10. Cada unidad cuenta con su protector acrílico rígido incluido sin recargo.
              </p>
              <Link
                href="/tienda"
                className="font-headline-sm text-sm uppercase text-primary-container hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                Ver todo el catálogo
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Cards Grid */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-96 bg-surface-container-low animate-pulse border border-surface-container"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-surface-container-low hover:bg-surface-container transition-all duration-300 flex flex-col border border-surface-container hover:border-primary-container relative overflow-hidden"
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
                <span className="font-label-telemetry text-xs text-outline hidden sm:inline">
                  TABLE: LEADS_ENCARGOS
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
                  {/* Marca o Serie */}
                  <div className="flex flex-col gap-1">
                    <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                      Marca / Serie Deseada *
                    </label>
                    <select
                      required
                      value={formData.serie}
                      onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface font-body-sm text-sm focus:outline-none focus:border-primary-container transition-colors"
                    >
                      <option value="">Seleccioná una línea...</option>
                      <option value="Hot Wheels RLC (Red Line Club)">Hot Wheels RLC (Red Line Club)</option>
                      <option value="Hot Wheels Super Treasure Hunt (STH)">Hot Wheels Super Treasure Hunt (STH)</option>
                      <option value="Hot Wheels Car Culture / Boulevard">Hot Wheels Car Culture / Boulevard</option>
                      <option value="Kaido House / Mini GT (1:64)">Kaido House / Mini GT (1:64)</option>
                      <option value="Inno64 / Tarmac Works">Inno64 / Tarmac Works</option>
                      <option value="Matchbox Collectors">Matchbox Collectors</option>
                      <option value="Vintage Redline (1968-1977)">Vintage Redline (1968-1977)</option>
                      <option value="Otra marca o categoría">Otra marca o categoría</option>
                    </select>
                  </div>

                  {/* Condición de Empaque */}
                  <div className="flex flex-col gap-1">
                    <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                      Condición requerida
                    </label>
                    <select
                      value={formData.estado_empaque}
                      onChange={(e) => setFormData({ ...formData, estado_empaque: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface font-body-sm text-sm focus:outline-none focus:border-primary-container transition-colors"
                    >
                      <option value="Blíster Mint C-10 (Perfecto)">Blíster Mint C-10 (Perfecto para vitrina)</option>
                      <option value="Blíster C-8 / C-9 (Detalles leves)">Blíster C-8 / C-9 (Detalles menores aceptables)</option>
                      <option value="Loose / Suelto (Para rodar o custom)">Loose / Fuera de blíster (Sin tarjeta)</option>
                      <option value="Indiferente">Indiferente si el precio conviene</option>
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
                  <span className="font-label-telemetry text-xs uppercase text-primary-container font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-secondary">location_on</span>
                    DIRECCIÓN DEL SHOWROOM
                  </span>
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
