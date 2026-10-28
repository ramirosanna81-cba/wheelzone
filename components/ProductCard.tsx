'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import ProductCardImage from '@/components/ProductCardImage';
import { getProductSlug } from '@/lib/product-seo';
import { getDefaultProductDescription } from '@/lib/catalog-constants';

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
  priority?: boolean;
}

export default function ProductCard({ product, onOpenModal, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5492364275322';
  const productSlug = getProductSlug(product);

  const getWhatsAppProductUrl = (p: Product) => {
    const msg = `¡Hola Wheels Zone! Quiero comprar la siguiente pieza:\n*${p.modelo}*\nMarca: ${p.marca} | Escala: ${p.escala}\nPrecio: $${p.precio.toLocaleString('es-AR')}\nCondición: Nuevo en blíster original\nLink: https://www.wheelszone.com.ar/autos/${productSlug}\n¿Me confirman disponibilidad para despacho en caja protegida?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div
      key={product.id}
      className="group bg-surface-container-low border border-surface-container hover:border-primary-container/80 transition-all duration-300 flex flex-col relative shadow-md hover:shadow-xl rounded-none"
    >
      {/* Top Image area with badges */}
      <div
        className="relative w-full aspect-square bg-[#111114] overflow-hidden cursor-pointer"
        onClick={() => onOpenModal(product)}
        title="Hacé clic para ver la foto en alta resolución y detalles técnicos"
      >
        <ProductCardImage
          src={product.imagen_url}
          alt={`${product.modelo} - Escala ${product.escala} ${product.serie || product.marca}`}
          priority={priority}
        />

        {/* Badges superiores */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          <span className="bg-surface-container-highest/90 text-on-surface font-label-telemetry text-[10px] sm:text-[11px] px-2 py-0.5 uppercase tracking-wider backdrop-blur-xs">
            ESCALA {product.escala}
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

        {/* Badge: 100% Nuevo en Blíster Cerrado */}
        <div className="absolute top-2 right-2 z-10 pointer-events-none">
          <span className="font-label-telemetry text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 uppercase border bg-surface-container-lowest/90 text-primary-container border-primary-container/40 font-bold">
            100% NUEVO // CERRADO
          </span>
        </div>

        {/* Inspect button overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-10 bg-black/40">
          <span className="px-3 py-1.5 bg-black/90 text-white font-label-telemetry text-xs uppercase tracking-wider flex items-center gap-1 border border-primary-container shadow-xl">
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
          <h3 className="font-headline-md text-sm sm:text-base uppercase text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-1">
            <Link href={`/autos/${productSlug}`} className="hover:underline">
              {product.modelo}
            </Link>
          </h3>
          <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2">
            {product.descripcion || getDefaultProductDescription(product)}
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

          {/* 3 Cuotas Sin Interés */}
          <div className="flex items-center gap-1 text-[11px] font-label-telemetry text-cyan-400 font-bold">
            <span className="material-symbols-outlined text-xs">credit_card</span>
            <span>3 cuotas sin interés de ${Math.round(product.precio / 3).toLocaleString('es-AR')}</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={() => addItem(product)}
              disabled={product.stock <= 0}
              className="py-2 px-1 sm:py-2.5 sm:px-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest active:scale-95 disabled:opacity-50 text-on-surface font-headline-sm text-[11px] sm:text-xs uppercase flex items-center justify-center gap-1 transition-all border border-surface-container-highest shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
              <span>CARRITO</span>
            </button>
            <a
              href={getWhatsAppProductUrl(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-1 sm:py-2.5 sm:px-2 rounded-lg bg-[#128C7E] hover:bg-[#075E54] active:scale-95 text-white font-headline-sm text-[11px] sm:text-xs uppercase flex items-center justify-center gap-1 transition-all font-bold shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">chat</span>
              <span>WHATSAPP</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
