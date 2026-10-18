'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';

export default function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    discount10,
    totalWithDiscount,
    isCartOpen,
    closeCart,
    getWhatsAppCheckoutUrl,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'envio' | 'retiro'>('envio');

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    const url = getWhatsAppCheckoutUrl(customerName, shippingCity, deliveryMethod);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-surface-container-lowest border-l border-surface-container-high h-full flex flex-col z-10 shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-surface-container-low border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-xl">shopping_cart</span>
            <div>
              <h2 className="font-headline-md uppercase text-on-surface tracking-wider text-lg">
                Paddock Carrito ({totalItems})
              </h2>
              <span className="text-xs font-label-telemetry text-primary-container uppercase">
                Embalaje Blindado C-10 Incluido
              </span>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {items.length === 0 ? (
            <div className="my-auto text-center py-12 flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-outline text-3xl">remove_shopping_cart</span>
              </div>
              <p className="font-headline-md text-on-surface uppercase text-lg">Tu carrito está vacío</p>
              <p className="font-body-sm text-on-surface-variant max-w-xs">
                Explorá el catálogo y asegurá las piezas más codiciadas antes de que se agoten en pista.
              </p>
              <button
                onClick={closeCart}
                className="mt-2 px-6 py-2.5 bg-primary-container text-on-primary-container font-headline-sm uppercase text-sm tracking-wider hover:bg-surface-tint transition-colors"
              >
                Ir a la Tienda
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="bg-surface-container-low border border-surface-container p-3 flex gap-3 relative group"
              >
                {/* Product thumbnail */}
                <div className="relative w-20 h-20 bg-surface-container-lowest flex-shrink-0 overflow-hidden border border-surface-container">
                  <Image
                    src={product.imagen_url}
                    alt={product.modelo}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-label-telemetry uppercase text-primary-container truncate">
                      {product.marca} // {product.escala}
                    </span>
                    <h4 className="font-headline-sm uppercase text-on-surface text-sm truncate leading-tight">
                      {product.modelo}
                    </h4>
                    <span className="text-[10px] text-outline font-label-telemetry uppercase mt-0.5">
                      Blíster: {product.estado_blister}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity controls */}
                    <div className="flex items-center bg-surface-container border border-surface-container-highest">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="px-2 py-0.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-xs"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-label-telemetry font-bold text-on-surface">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="px-2 py-0.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <span className="font-label-price text-primary-container text-base">
                      ${(product.precio * quantity).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeItem(product.id)}
                  className="absolute top-2 right-2 text-outline hover:text-race-red transition-colors"
                  title="Quitar"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer with totals and WhatsApp Action */}
        {items.length > 0 && (
          <div className="p-4 bg-surface-container border-t border-surface-container-high flex flex-col gap-3">
            {/* Delivery Method Toggle */}
            <div className="grid grid-cols-2 gap-1.5 font-label-telemetry text-xs uppercase">
              <button
                type="button"
                onClick={() => setDeliveryMethod('envio')}
                className={`py-1.5 px-2 flex items-center justify-center gap-1 border transition-colors ${
                  deliveryMethod === 'envio'
                    ? 'bg-primary-container text-on-primary-container border-primary-container font-bold'
                    : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-sm">local_shipping</span>
                <span>Envío Blindado</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod('retiro')}
                className={`py-1.5 px-2 flex items-center justify-center gap-1 border transition-colors ${
                  deliveryMethod === 'retiro'
                    ? 'bg-primary-container text-on-primary-container border-primary-container font-bold'
                    : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-sm">storefront</span>
                <span>Retiro en Junín</span>
              </button>
            </div>

            {deliveryMethod === 'retiro' ? (
              <div className="p-2 bg-surface-container-lowest border border-surface-container text-xs font-label-telemetry flex items-center gap-1.5 text-primary-container">
                <span className="material-symbols-outlined text-sm text-secondary">location_on</span>
                <span>Punto de Retiro: Rioja 281, Junín, Argentina (Sin Costo)</span>
              </div>
            ) : null}

            {/* Quick customer data for order */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Tu nombre..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-surface-container-lowest px-3 py-1.5 text-xs text-on-surface placeholder:text-outline border border-surface-container-highest focus:outline-none focus:border-primary-container"
              />
              <input
                type="text"
                placeholder={deliveryMethod === 'retiro' ? "Junín (Retiro)" : "Ciudad de envío..."}
                value={deliveryMethod === 'retiro' ? "Rioja 281, Junín" : shippingCity}
                disabled={deliveryMethod === 'retiro'}
                onChange={(e) => setShippingCity(e.target.value)}
                className="bg-surface-container-lowest px-3 py-1.5 text-xs text-on-surface placeholder:text-outline border border-surface-container-highest focus:outline-none focus:border-primary-container disabled:opacity-60"
              />
            </div>

            {/* Price Breakdown */}
            <div className="flex flex-col gap-1 text-xs font-label-telemetry uppercase">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal ({totalItems} piezas):</span>
                <span>${subtotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">savings</span>
                  10% OFF Transferencia:
                </span>
                <span>-${discount10.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-on-surface pt-1 border-t border-surface-container-highest">
                <span className="font-headline-sm uppercase text-sm">Total Transferencia:</span>
                <span className="font-label-price text-primary-container text-xl">
                  ${totalWithDiscount.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Direct WhatsApp Action Button */}
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-gradient-to-r from-primary-container via-surface-tint to-secondary-container text-surface-container-lowest font-headline-md uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-lg">chat</span>
              <span>COMPRAR VÍA WHATSAPP</span>
            </button>

            <div className="flex items-center justify-between text-[11px] font-label-telemetry text-outline">
              <span>💳 Aceptamos Transferencias y MP</span>
              <button
                onClick={clearCart}
                className="underline hover:text-race-red transition-colors"
              >
                Vaciar Carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
