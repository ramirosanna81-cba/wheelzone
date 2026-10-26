'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { getDefaultProductDescription } from '@/lib/catalog-constants';
import { getProductSlug } from '@/lib/product-seo';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  slug: string;
}

interface ShippingQuote {
  provider: string;
  service: string;
  cost: number | string;
  time: string;
  isFree?: boolean;
}

export default function ProductDetailClient({
  product,
  relatedProducts,
  slug,
}: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Calculadora de Código Postal
  const [postalCode, setPostalCode] = useState('');
  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[] | null>(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');

  const phone = '5492364275322';

  const handleAddToCart = () => {
    addItem(product);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const getWhatsAppProductUrl = () => {
    const msg = `¡Hola Wheels Zone! Quiero comprar la siguiente pieza:\n*${product.modelo}*\nMarca: ${product.marca} | Escala: ${product.escala}\nPrecio: $${product.precio.toLocaleString('es-AR')}\nCondición: 100% Nuevo en Blíster Cerrado\nLink: https://wheelszone.com.ar/tienda/${slug}\n¿Tienen disponibilidad para envío protegido o retiro en Showroom Junín?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCp = postalCode.trim();
    if (!cleanCp || cleanCp.length < 4) {
      setShippingError('Ingresá un código postal válido de 4 dígitos (ej: 6000, 1001, 5000)');
      return;
    }

    setShippingError('');
    setCalculatingShipping(true);

    // Simulación telemétrica según CP argentino
    setTimeout(() => {
      setCalculatingShipping(false);
      const isJunin = cleanCp === '6000' || cleanCp.startsWith('600');
      const isBsAs = cleanCp.startsWith('1') || cleanCp.startsWith('2') || cleanCp.startsWith('6');

      const quotes: ShippingQuote[] = [
        {
          provider: 'Showroom Junín',
          service: 'Punto de Retiro Físico (Rioja 281)',
          cost: 0,
          time: 'Inmediato (Lunes a Sábados 09 a 20hs)',
          isFree: true,
        },
        {
          provider: 'Correo Argentino',
          service: 'Envío Clásico a Domicilio (Embalaje Blindado)',
          cost: isJunin ? 4200 : isBsAs ? 5800 : 7900,
          time: isJunin ? '24 - 48 hs' : '3 a 6 días hábiles',
        },
        {
          provider: 'Andreani',
          service: 'Envío Prioritario Express a Sucursal / Domicilio',
          cost: isJunin ? 4900 : isBsAs ? 6900 : 8900,
          time: isJunin ? '24 hs' : '2 a 4 días hábiles',
        },
      ];

      setShippingQuotes(quotes);
    }, 450);
  };

  const precioTransferencia = Math.round(product.precio * 0.8);
  const precioCuota = Math.round(product.precio / 3);

  return (
    <div className="w-full flex flex-col gap-10">
      {/* ==============================================================================
          GRID PRINCIPAL: FOTO HD (IZQUIERDA) & PANEL DE COMPRA (DERECHA)
      ============================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Galería y Foto Principal (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div
            className="relative w-full aspect-square sm:aspect-[4/3] bg-[#111114] border border-neutral-800 rounded-2xl overflow-hidden cursor-pointer group shadow-2xl"
            onClick={() => setIsLightboxOpen(true)}
          >
            {/* Ambient halo glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800/40 via-[#111114] to-[#111114] pointer-events-none" />

            {/* Main high resolution product image with priority for LCP */}
            <Image
              src={product.imagen_url}
              alt={`${product.modelo} - ${product.marca} escala ${product.escala} en blíster cerrado`}
              fill
              priority
              unoptimized={product.imagen_url.startsWith('data:')}
              className="object-contain p-4 sm:p-6 group-hover:scale-105 transition-transform duration-500 z-0"
              sizes="(max-width: 1024px) 100vw, 640px"
            />

            {/* Badges superiores flotantes */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
              <span className="px-2.5 py-1 rounded-md bg-black/80 text-white font-label-telemetry text-xs uppercase tracking-wider border border-neutral-700/80 backdrop-blur-md">
                ESCALA {product.escala}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-primary-container text-black font-label-telemetry text-xs uppercase font-extrabold tracking-wider border border-amber-300 shadow-md">
                100% NUEVO // BLÍSTER CERRADO
              </span>
            </div>

            <div className="absolute top-3 right-3 z-10">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-label-telemetry text-xs uppercase font-bold backdrop-blur-md flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">verified</span>
                ORIGINAL GARANTIZADO
              </span>
            </div>

            {/* Click to zoom overlay */}
            <div className="absolute bottom-3 right-3 z-10">
              <span className="px-3 py-1.5 rounded-lg bg-black/80 text-white font-label-telemetry text-xs uppercase tracking-wider flex items-center gap-1 border border-neutral-700 group-hover:border-primary-container transition-colors backdrop-blur-md">
                <span className="material-symbols-outlined text-sm text-primary-container">zoom_in</span>
                <span>AMPLIAR FOTO HD</span>
              </span>
            </div>
          </div>

          {/* Garantías de transporte y blíster */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#141418] border border-neutral-800 rounded-xl flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#FFC200] text-xl shrink-0">shield</span>
              <div className="flex flex-col leading-tight font-label-telemetry text-[11px]">
                <span className="text-white font-bold uppercase">EMBALAJE BLINDADO</span>
                <span className="text-neutral-400">Caja rígida + burbuja</span>
              </div>
            </div>

            <div className="p-3 bg-[#141418] border border-neutral-800 rounded-xl flex items-center gap-2.5">
              <span className="material-symbols-outlined text-cyan-400 text-xl shrink-0">storefront</span>
              <div className="flex flex-col leading-tight font-label-telemetry text-[11px]">
                <span className="text-white font-bold uppercase">RETIRO EN JUNÍN</span>
                <span className="text-neutral-400">Gratis en Showroom</span>
              </div>
            </div>

            <div className="p-3 bg-[#141418] border border-neutral-800 rounded-xl flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-400 text-xl shrink-0">local_shipping</span>
              <div className="flex flex-col leading-tight font-label-telemetry text-[11px]">
                <span className="text-white font-bold uppercase">ENVÍOS NACIONALES</span>
                <span className="text-neutral-400">A toda la Argentina</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Panel de Compra y Calculadora (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Encabezado del Producto */}
          <div className="flex flex-col gap-2 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2 font-label-telemetry text-xs text-neutral-400">
              <span className="text-primary-container font-bold uppercase">{product.marca}</span>
              <span>•</span>
              <span className="uppercase">{product.categoria}</span>
              {product.serie && (
                <>
                  <span>•</span>
                  <span className="text-neutral-300 uppercase">{product.serie}</span>
                </>
              )}
            </div>

            <h1 className="font-display-hero text-2xl sm:text-3xl md:text-4xl uppercase text-white font-black leading-tight tracking-tight">
              {product.modelo}
            </h1>

            {/* Precios */}
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex items-baseline justify-between">
                <span className="font-label-price text-3xl sm:text-4xl text-[#FFC200] font-black">
                  ${product.precio.toLocaleString('es-AR')}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-label-telemetry text-xs uppercase font-bold">
                  {product.stock > 0 ? `Stock Disponible: ${product.stock}` : 'Agotado'}
                </span>
              </div>

              {/* 20% OFF Transferencia */}
              <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl font-label-telemetry text-xs text-[#FFC200]">
                <span className="material-symbols-outlined text-base shrink-0">percent</span>
                <span>
                  <strong>${precioTransferencia.toLocaleString('es-AR')}</strong> abonando por transferencia bancaria (20% OFF directo)
                </span>
              </div>

              {/* 3 Cuotas Sin Interés */}
              <div className="flex items-center gap-2 px-3 py-2 bg-cyan-950/40 border border-cyan-500/30 rounded-xl font-label-telemetry text-xs text-cyan-300">
                <span className="material-symbols-outlined text-base text-cyan-400 shrink-0">credit_card</span>
                <span>
                  <strong>3 cuotas sin interés</strong> de <strong>${precioCuota.toLocaleString('es-AR')}</strong> con todas las tarjetas
                </span>
              </div>
            </div>
          </div>

          {/* Botones de Conversión */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`w-full h-12 rounded-xl font-display-hero uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all font-extrabold shadow-lg active:scale-95 ${
                addedFeedback
                  ? 'bg-emerald-600 text-white border border-emerald-500 shadow-emerald-600/30'
                  : 'bg-primary-container hover:bg-[#ffd033] text-black border border-amber-300 shadow-[0_4px_16px_rgba(255,194,0,0.3)]'
              } disabled:opacity-50`}
            >
              <span className="material-symbols-outlined text-lg">
                {addedFeedback ? 'check_circle' : 'add_shopping_cart'}
              </span>
              <span>{addedFeedback ? '¡AGREGADO AL CARRITO!' : 'AGREGAR AL CARRITO'}</span>
            </button>

            <a
              href={getWhatsAppProductUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-display-hero uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,211,102,0.3)] transition-all font-extrabold"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.301-.15-1.767-.867-2.04-.966-.274-.101-.473-.15-.673.15-.197.295-.771.966-.944 1.162-.175.197-.349.222-.65.074-.301-.15-1.27-.467-2.42-1.485-.896-.795-1.501-1.777-1.677-2.077-.175-.3-.019-.461.13-.61.134-.133.301-.347.451-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.01-.371-.01-.571-.01-.2 0-.523.074-.797.372-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>COMPRAR DIRECTO POR WHATSAPP</span>
            </a>
          </div>

          {/* ==============================================================================
              CALCULADORA DE ENVÍO POR CÓDIGO POSTAL (CORREO ARGENTINO / ANDREANI / JUNÍN)
          ============================================================================== */}
          <div className="bg-[#141418] border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-label-telemetry text-xs uppercase text-white font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#FFC200]">local_shipping</span>
                CALCULAR COSTO Y TIEMPO DE ENVÍO
              </span>
              <span className="font-label-telemetry text-[10px] text-neutral-400">ARGENTINA</span>
            </div>

            <form onSubmit={handleCalculateShipping} className="flex gap-2">
              <input
                type="text"
                placeholder="Ingresá tu Código Postal (ej: 6000)"
                maxLength={8}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="flex-1 bg-[#1a1a20] border border-neutral-700 text-white font-label-telemetry text-xs px-3 py-2.5 rounded-xl placeholder:text-neutral-500 focus:outline-none focus:border-primary-container"
              />
              <button
                type="submit"
                disabled={calculatingShipping}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-label-telemetry text-xs uppercase font-bold rounded-xl border border-neutral-600 transition-colors shrink-0"
              >
                {calculatingShipping ? 'CALCULANDO...' : 'CALCULAR'}
              </button>
            </form>

            {shippingError && (
              <span className="text-red-400 text-xs font-label-telemetry">{shippingError}</span>
            )}

            {shippingQuotes && (
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800 animate-fadeIn">
                {shippingQuotes.map((q, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl flex items-center justify-between text-xs font-label-telemetry ${
                      q.isFree
                        ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                        : 'bg-[#1a1a20] border border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-white uppercase">{q.provider}</span>
                      <span className="text-[11px] text-neutral-400">{q.service}</span>
                      <span className="text-[10px] text-neutral-400">Entrega: {q.time}</span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-black text-sm ${
                          q.isFree ? 'text-emerald-400' : 'text-[#FFC200]'
                        }`}
                      >
                        {q.isFree ? 'GRATIS' : `$${Number(q.cost).toLocaleString('es-AR')}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ficha Técnica Rápida */}
          <div className="bg-[#141418] border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-2.5 font-label-telemetry text-xs">
            <span className="text-white font-bold uppercase tracking-wider pb-1 border-b border-neutral-800">
              ESPECIFICACIONES DEL MODELO
            </span>
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-400 uppercase">Marca:</span>
              <span className="text-white font-bold uppercase">{product.marca}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-400 uppercase">Escala:</span>
              <span className="text-white font-bold">{product.escala}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-400 uppercase">Año de Fabricación:</span>
              <span className="text-white font-bold">{product.anio || 2024}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-400 uppercase">Categoría / Línea:</span>
              <span className="text-primary-container font-bold uppercase">
                {product.categoria || 'Coleccionable'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-400 uppercase">Condición de Inventario:</span>
              <span className="text-emerald-400 font-extrabold uppercase">
                100% NUEVO // EN BLÍSTER CERRADO
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================================================
          DESCRIPCIÓN EXTENDIDA & COMPROMISO DE CALIDAD
      ============================================================================== */}
      <div className="bg-[#141418] border border-neutral-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-xl">
        <h2 className="font-display-hero text-xl sm:text-2xl uppercase text-white font-bold">
          DETALLES DE LA PIEZA &amp; CERTIFICACIÓN DE BLÍSTER
        </h2>
        <p className="font-body-md text-sm sm:text-base text-neutral-300 leading-relaxed">
          {product.descripcion || getDefaultProductDescription(product)}
        </p>
        <p className="font-body-sm text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-neutral-800 pt-3">
          En <strong>Wheels Zone</strong> comercializamos exclusivamente autitos de colección nuevos, 
          originales y sellados de fábrica. Cada unidad viaja en caja reforzada protegida con film 
          burbuja de alta densidad para evitar quiebres en la tarjeta o abolladuras en la burbuja plástica.
        </p>
      </div>

      {/* ==============================================================================
          MODELOS RELACIONADOS RECOMENDADOS
      ============================================================================== */}
      {relatedProducts.length > 0 && (
        <div className="flex flex-col gap-4 pt-4 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <h2 className="font-display-hero text-xl sm:text-2xl uppercase text-white font-bold">
              OTROS MODELOS DESTACADOS
            </h2>
            <Link
              href="/tienda"
              className="text-[#FFC200] font-label-telemetry text-xs uppercase hover:underline flex items-center gap-1"
            >
              <span>VER TODO EL CATÁLOGO</span>
              <span>&gt;</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.slice(0, 4).map((rel) => {
              const relSlug = getProductSlug(rel);
              return (
                <Link
                  key={rel.id}
                  href={`/tienda/${relSlug}`}
                  className="group bg-[#141418] hover:bg-[#1a1a20] border border-neutral-800 hover:border-[#FFC200] rounded-xl overflow-hidden flex flex-col p-3 transition-all"
                >
                  <div className="relative w-full aspect-square bg-[#0e0e11] rounded-lg overflow-hidden mb-2">
                    <Image
                      src={rel.imagen_url}
                      alt={rel.modelo}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </div>
                  <span className="font-label-telemetry text-[10px] text-neutral-400 uppercase truncate">
                    {rel.marca} • {rel.escala}
                  </span>
                  <span className="font-headline-md text-xs sm:text-sm uppercase text-white font-bold truncate group-hover:text-primary transition-colors">
                    {rel.modelo}
                  </span>
                  <span className="font-label-price text-sm sm:text-base text-[#FFC200] font-black mt-1">
                    ${rel.precio.toLocaleString('es-AR')}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Modal para Inspección HD */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:text-[#FFC200] text-3xl"
          >
            ✕
          </button>
          <div className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center">
            <Image
              src={product.imagen_url}
              alt={product.modelo}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
