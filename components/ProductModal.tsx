'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { getDefaultProductDescription } from '@/lib/catalog-constants';
import { getProductSlug } from '@/lib/product-seo';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Zoom de lupa interactiva en contenedor principal (Desktop)
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const phone = '5492364275322';

  // Manejo de teclado (Cerrar con tecla Escape)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
          setLightboxZoom(false);
        } else {
          onClose();
        }
      }
    },
    [isLightboxOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Bloquear scroll de fondo mientras el modal o lightbox esté abierto
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  if (!product) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const getWhatsAppProductUrl = () => {
    const msg = `¡Hola Wheels Zone! Quiero consultar/comprar la siguiente pieza:\n*${product.modelo}*\nMarca: ${product.marca} | Escala: ${product.escala}\nPrecio: $${product.precio.toLocaleString('es-AR')}\nEstado Blíster: ${product.estado_blister}\n¿Tienen disponibilidad para envío protegido?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const handleAddToCart = () => {
    addItem(product);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 1800);
  };

  return (
    <>
      {/* ==============================================================================
          1. MODAL PRINCIPAL DE FICHA TÉCNICA (AMPLIADO & OPTIMIZADO)
      ============================================================================== */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overscroll-contain animate-fadeIn"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative w-full max-w-5xl bg-[#141417] border border-neutral-700/80 max-h-[94vh] overflow-y-auto flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.95)] rounded-2xl">
          {/* Barra Superior de Telemetría */}
          <div className="p-3 sm:p-4 bg-[#1a1a1f] border-b border-neutral-800 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse shrink-0"></span>
              <span className="material-symbols-outlined text-primary-container text-lg sm:text-xl shrink-0">
                speed
              </span>
              <div className="flex items-center gap-2 truncate">
                <span className="font-display-hero uppercase text-white font-extrabold tracking-wider text-sm sm:text-base truncate">
                  FICHA TÉCNICA // {product.marca}
                </span>
                <span className="hidden sm:inline-block font-label-telemetry text-xs uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                  {product.categoria}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8.5 h-8.5 sm:w-9 sm:h-9 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all shrink-0 active:scale-95 cursor-pointer"
              aria-label="Cerrar modal"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          {/* Cuerpo del Modal: 2 Columnas (Fotografía Ampliada + Ficha de Coleccionista) */}
          <div className="p-3.5 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-start">
            
            {/* Columna Izquierda: Fotografía de Alta Resolución con Lupa y Botón Pantalla Completa (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-2.5">
              <div
                ref={imageContainerRef}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setIsLightboxOpen(true)}
                className="relative w-full h-[320px] xs:h-[380px] sm:h-[450px] md:h-[480px] lg:h-[500px] bg-[#111114] border border-neutral-700/80 rounded-2xl overflow-hidden cursor-zoom-in group select-none shadow-xl"
                title="Hacé clic para ver en Pantalla Completa de ultra detalle"
              >
                {/* Imagen del Producto con Zoom de Lupa suave en desktop */}
                <div
                  className="relative w-full h-full transition-transform duration-150 ease-out"
                  style={{
                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                    transform: isHovering ? 'scale(2.05)' : 'scale(1)',
                  }}
                >
                  <Image
                    src={product.imagen_url}
                    alt={product.modelo}
                    fill
                    unoptimized={product.imagen_url.startsWith('data:')}
                    className="object-contain p-2 sm:p-4"
                    sizes="(max-width: 1024px) 100vw, 650px"
                    priority
                  />
                </div>

                {/* Badges Flotantes Superiores */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
                  <span className="bg-secondary-container/95 text-white font-label-telemetry text-[11px] sm:text-xs px-2.5 py-1 uppercase font-extrabold rounded-md shadow-md backdrop-blur-sm border border-red-500/30">
                    ESCALA {product.escala}
                  </span>
                  {product.categoria.includes('Super Treasure Hunt') && (
                    <span className="bg-amber-500 text-black font-label-telemetry text-[10px] sm:text-[11px] px-2 py-0.5 uppercase font-black rounded-md shadow flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">whatshot</span>
                      STH // EDICIÓN ESPECIAL
                    </span>
                  )}
                </div>

                {/* Badge de Estado del Blíster o Suelto (Siempre en Español) */}
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  {(() => {
                    const est = product.estado_blister || 'Impecable';
                    const isSuelto = est.toLowerCase().includes('suelto') || est.toLowerCase().includes('loose');
                    
                    if (isSuelto) {
                      const label = est.toLowerCase().includes('usado') ? 'SUELTO USADO' : 'SUELTO NUEVO';
                      return (
                        <span className="bg-black/90 backdrop-blur-md text-sky-400 font-label-telemetry text-[11px] sm:text-xs px-2.5 py-1 rounded-md border border-sky-400/40 font-bold uppercase shadow-lg flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                          <span>{label}</span>
                        </span>
                      );
                    }

                    let displayBlister: string = est;
                    if (est === 'Impecable') displayBlister = '10/10 IMPECABLE';
                    else if (est === 'Muy Bueno') displayBlister = 'MUY BUENO';
                    else if (est === 'Desgaste / Abrir') displayBlister = 'DESGASTE / ABRIR';

                    return (
                      <span className="bg-black/85 backdrop-blur-md text-amber-400 font-label-telemetry text-[11px] sm:text-xs px-2.5 py-1 rounded-md border border-amber-400/30 font-bold uppercase shadow-lg flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <span>BLÍSTER: {displayBlister}</span>
                      </span>
                    );
                  })()}
                </div>

                {/* Botón Flotante: Abrir en Pantalla Completa (Lightbox) */}
                <div className="absolute bottom-3 right-3 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                    className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-black/80 hover:bg-black text-white hover:text-primary-container border border-neutral-600/90 hover:border-primary-container flex items-center gap-1.5 font-label-telemetry text-xs uppercase tracking-wider backdrop-blur-md transition-all shadow-xl group/btn cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base text-primary-container group-hover/btn:scale-110 transition-transform">
                      zoom_in
                    </span>
                    <span className="font-bold">VER PANTALLA COMPLETA</span>
                  </button>
                </div>

                {/* Tip de Inspección en Desktop */}
                <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 text-neutral-300 font-label-telemetry text-[10px] uppercase tracking-wider backdrop-blur-sm pointer-events-none border border-neutral-800">
                  <span className="material-symbols-outlined text-xs text-primary-container">mouse</span>
                  <span>Pasá el mouse para hacer lupa • Clic para ampliar</span>
                </div>
              </div>

              {/* Leyenda de Garantía Fotográfica */}
              <div className="flex items-center justify-between text-[11px] font-label-telemetry text-neutral-400 px-1">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  Foto real de la pieza en stock físico
                </span>
                <span className="text-neutral-500">Wheels Zone Junín // Colección Certificada</span>
              </div>
            </div>

            {/* Columna Derecha: Detalles Técnicos, Precios y Acciones (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-5 justify-between h-full">
              <div className="flex flex-col gap-3.5 sm:gap-4">
                
                {/* Título & Serie */}
                <div className="flex flex-col gap-1 border-b border-neutral-800/80 pb-3">
                  <span className="font-label-telemetry text-xs sm:text-[13px] text-primary-container uppercase tracking-wider font-bold">
                    {product.serie || `${product.marca} // ${product.categoria}`}
                  </span>
                  <h2 className="font-display-hero text-2xl sm:text-3xl uppercase text-white font-extrabold leading-tight tracking-tight">
                    {product.modelo}
                  </h2>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-label-price text-2xl sm:text-3xl md:text-4xl text-[#FFC200] font-black tracking-tight">
                      ${product.precio.toLocaleString('es-AR')}
                    </span>
                    <span className="font-label-telemetry text-xs uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                      {product.stock > 0 ? `Stock: ${product.stock} disp.` : 'Agotado'}
                    </span>
                  </div>

                  {/* Beneficio de Financiación 3 Cuotas Sin Interés */}
                  <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-label-telemetry text-xs">
                    <span className="material-symbols-outlined text-base text-cyan-400 shrink-0">credit_card</span>
                    <div className="flex flex-wrap items-center gap-x-1.5 font-bold">
                      <span className="uppercase text-white tracking-wide">3 cuotas sin interés de</span>
                      <span className="text-cyan-400 font-black text-sm">
                        ${Math.round(product.precio / 3).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabla de Especificaciones de Grado Coleccionista */}
                <div className="p-3 sm:p-3.5 bg-[#17171c] border border-neutral-800 rounded-xl flex flex-col gap-2 font-label-telemetry text-xs">
                  {(() => {
                    const est = product.estado_blister || 'Impecable';
                    const isSuelto = est.toLowerCase().includes('suelto') || est.toLowerCase().includes('loose');
                    const condicionText = isSuelto
                      ? (est.toLowerCase().includes('usado') ? 'PIEZA SUELTA (USADA / VITRINA)' : 'PIEZA SUELTA (NUEVA / SIN BLÍSTER)')
                      : 'NUEVO (EN BLÍSTER ORIGINAL)';
                    const empaqueText = isSuelto ? 'SIN CARTÓN (PIEZA SUELTA)' : est;

                    return (
                      <>
                        <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                          <span className="text-neutral-400 uppercase">Condición:</span>
                          <span className={`font-bold uppercase ${isSuelto ? 'text-sky-400' : 'text-white'}`}>
                            {condicionText}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                          <span className="text-neutral-400 uppercase">Año de Lanzamiento:</span>
                          <span className="text-white font-bold">{product.anio}</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                          <span className="text-neutral-400 uppercase">Estado del Empaque:</span>
                          <span className="text-primary-container font-bold uppercase">{empaqueText}</span>
                        </div>
                      </>
                    );
                  })()}
                  <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                    <span className="text-neutral-400 uppercase">Inspección de Ruedas:</span>
                    <span className="text-white font-bold uppercase">Neumáticos de Aleación / Real Riders</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 uppercase">Embalaje Blindado:</span>
                    <span className="text-emerald-400 font-bold uppercase">INCLUIDO SIN COSTO EXTRA</span>
                  </div>
                </div>

                {/* Descripción Detallada */}
                <div className="flex flex-col gap-1">
                  <span className="font-label-telemetry text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                    DESCRIPCIÓN DEL CASTING & BLÍSTER
                  </span>
                  <p className="font-body-sm text-xs sm:text-[13px] text-neutral-200 leading-relaxed bg-[#111114] p-3 rounded-xl border border-neutral-800/60">
                    {product.descripcion || getDefaultProductDescription(product)}
                  </p>
                </div>
              </div>

              {/* Botones de Acción (Optimizados y Proporcionados para PC y Celular) */}
              <div className="flex flex-col gap-2.5 pt-3 border-t border-neutral-800">
                {/* Comprar o Consultar por WhatsApp */}
                <a
                  href={getWhatsAppProductUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 sm:h-12 px-4 rounded-xl bg-[#128C7E] hover:bg-[#075E54] active:scale-95 text-white font-display-hero uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(18,140,126,0.35)] transition-all text-center cursor-pointer select-none font-bold"
                >
                  <svg
                    className="w-5 h-5 shrink-0 fill-current"
                    style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px', maxWidth: '20px', maxHeight: '20px' }}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.301-.15-1.767-.867-2.04-.966-.274-.101-.473-.15-.673.15-.197.295-.771.966-.944 1.162-.175.197-.349.222-.65.074-.301-.15-1.27-.467-2.42-1.485-.896-.795-1.501-1.777-1.677-2.077-.175-.3-.019-.461.13-.61.134-.133.301-.347.451-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.01-.371-.01-.571-.01-.2 0-.523.074-.797.372-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="whitespace-nowrap">CONSULTAR POR WHATSAPP</span>
                </a>

                {/* Agregar al Carrito */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`w-full h-11 sm:h-12 px-4 rounded-xl font-display-hero uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all text-center cursor-pointer active:scale-95 border ${
                    addedFeedback
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_4px_14px_rgba(16,185,129,0.4)]'
                      : 'bg-primary-container hover:bg-[#ffd033] text-black font-extrabold border-amber-300/60 shadow-[0_4px_14px_rgba(255,194,0,0.25)]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="material-symbols-outlined text-base sm:text-lg shrink-0">
                    {addedFeedback ? 'check_circle' : 'add_shopping_cart'}
                  </span>
                  <span className="whitespace-nowrap">{addedFeedback ? '¡AGREGADO AL CARRITO!' : 'AGREGAR AL CARRITO'}</span>
                </button>

                {/* Enlace Canónico a la Ficha Completa del Producto */}
                <Link
                  href={`/autos/${getProductSlug(product)}`}
                  onClick={onClose}
                  className="w-full h-10 px-4 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/90 text-neutral-300 hover:text-white font-label-telemetry text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-neutral-700 hover:border-primary-container transition-all"
                >
                  <span className="material-symbols-outlined text-base text-[#FFC200]">open_in_new</span>
                  <span>VER FICHA WEB COMPLETA &amp; CALCULAR ENVÍO</span>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ==============================================================================
          2. VISOR PANTALLA COMPLETA (LIGHTBOX / FULLSCREEN INSPECTION)
      ============================================================================== */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-6 animate-fadeIn select-none"
          onClick={() => {
            setIsLightboxOpen(false);
            setLightboxZoom(false);
          }}
        >
          {/* Barra Superior del Lightbox */}
          <div
            className="w-full max-w-6xl flex items-center justify-between pb-3 sm:pb-4 border-b border-neutral-800 text-white z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="material-symbols-outlined text-primary-container text-xl sm:text-2xl">
                loupe
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-display-hero text-base sm:text-xl uppercase font-black tracking-wide text-white truncate">
                  {product.modelo}
                </span>
                <span className="font-label-telemetry text-xs uppercase text-primary-container">
                  {product.marca} // {product.escala} // Blíster {product.estado_blister}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Botón para alternar zoom 1x / 2x en Lightbox */}
              <button
                type="button"
                onClick={() => setLightboxZoom((prev) => !prev)}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 text-xs font-label-telemetry uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  {lightboxZoom ? 'zoom_out' : 'zoom_in'}
                </span>
                <span className="hidden xs:inline">{lightboxZoom ? 'Zoom 1x' : 'Zoom 2x'}</span>
              </button>

              {/* Botón Cerrar Lightbox */}
              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxZoom(false);
                }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-900 hover:bg-red-600/20 text-neutral-300 hover:text-red-400 border border-neutral-700/80 hover:border-red-500/40 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Cerrar pantalla completa"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
          </div>

          {/* Área Central de la Fotografía en Pantalla Completa */}
          <div
            className={`relative w-full max-w-5xl flex-1 my-3 sm:my-4 flex items-center justify-center overflow-auto rounded-2xl ${
              lightboxZoom ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxZoom((prev) => !prev);
            }}
          >
            <div
              className={`relative transition-all duration-300 ease-out flex items-center justify-center ${
                lightboxZoom
                  ? 'w-[160%] h-[160%] sm:w-[180%] sm:h-[180%]'
                  : 'w-full h-full max-h-[82vh]'
              }`}
            >
              <Image
                src={product.imagen_url}
                alt={product.modelo}
                fill
                unoptimized={product.imagen_url.startsWith('data:')}
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>

          {/* Barra Inferior con Guía de Atajos */}
          <div
            className="w-full max-w-6xl pt-2.5 sm:pt-3 border-t border-neutral-800 flex items-center justify-between text-neutral-400 font-label-telemetry text-xs uppercase tracking-wider"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Hacé clic en la foto para alternar zoom • Tocá ESC para salir</span>
            <span className="hidden sm:inline text-primary-container">
              Wheels Zone // Telemetría de Blíster Alta Resolución
            </span>
          </div>
        </div>
      )}
    </>
  );
}
