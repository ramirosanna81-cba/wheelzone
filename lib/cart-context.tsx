'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from './types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount20: number;
  discount10?: number;
  totalWithDiscount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  getWhatsAppCheckoutUrl: (customerName?: string, shippingCity?: string, deliveryMethod?: 'envio' | 'retiro') => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'wheelszone_cart_items_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load cart from storage', e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to storage', e);
    }
  }, [items]);

  const addItem = (product: Product, quantity = 1) => {
    const maxAvailable = product.stock ?? 1;
    if (maxAvailable <= 0) return;

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, maxAvailable);
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQty }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, maxAvailable) }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxAvailable = item.product.stock ?? 99;
          return { ...item, quantity: Math.min(quantity, maxAvailable) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.product.precio * item.quantity, 0);
  const discount20 = Math.round(subtotal * 0.20);
  const totalWithDiscount = subtotal - discount20;

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const getWhatsAppCheckoutUrl = (customerName = '', shippingCity = '', deliveryMethod: 'envio' | 'retiro' = 'envio') => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5492364275322';
    let message = `🔥 *ORDEN DE COMPRA // WHEELS ZONE*\n\n`;
    message += `¡Hola Wheels Zone! Quiero confirmar la compra de las siguientes piezas de colección:\n\n`;

    items.forEach((item, index) => {
      message += `${index + 1}. *${item.product.modelo}*\n`;
      message += `   Marca: ${item.product.marca} | Escala: ${item.product.escala}\n`;
      message += `   Blíster: ${item.product.estado_blister}\n`;
      message += `   Cant: ${item.quantity} x $${item.product.precio.toLocaleString('es-AR')} = $${(item.product.precio * item.quantity).toLocaleString('es-AR')}\n\n`;
    });

    message += `📦 *Total de piezas:* ${totalItems}\n`;
    message += `💵 *Subtotal:* $${subtotal.toLocaleString('es-AR')}\n`;
    message += `⚡ *20% OFF Transferencia:* -$${discount20.toLocaleString('es-AR')}\n`;
    message += `🏁 *TOTAL A ABONAR:* $${totalWithDiscount.toLocaleString('es-AR')}\n\n`;

    if (customerName) message += `👤 *Coleccionista:* ${customerName}\n`;
    if (deliveryMethod === 'retiro') {
      message += `📍 *Modalidad:* Retiro sin costo en Showroom (Rioja 281, Junín, Argentina)\n`;
    } else {
      message += `📦 *Modalidad:* Envío blindado a domicilio\n`;
      if (shippingCity) message += `📍 *Destino de envío:* ${shippingCity}\n`;
    }

    message += `\n¿Me confirman los datos bancarios y disponibilidad para entrega/despacho? Gracias!`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount20,
        discount10: discount20,
        totalWithDiscount,
        isCartOpen,
        openCart,
        closeCart,
        getWhatsAppCheckoutUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
