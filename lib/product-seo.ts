import { Product } from './types';
import { INITIAL_PRODUCTS } from './mock-data';
import { fetchProducts } from './supabase';

/**
 * Normaliza y convierte un texto en un slug amigable para URLs y SEO
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Genera el slug canónico para un producto de Wheels Zone
 * Ejemplo: hot-wheels-porsche-904-carrera-gts-5bcb3c
 */
export function getProductSlug(product: Product): string {
  const brand = slugify(product.marca || 'diecast');
  const model = slugify(product.modelo || 'auto');
  const shortId = (product.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toLowerCase() || 'item';
  return `${brand}-${model}-${shortId}`;
}

/**
 * Obtiene todos los productos del catálogo (Supabase con fallback a mock-data)
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const prods = await fetchProducts();
    if (prods && prods.length > 0) return prods;
  } catch (err) {
    console.warn('Error fetching products for SEO:', err);
  }
  return INITIAL_PRODUCTS;
}

/**
 * Encuentra un producto a partir de su slug o identificador de forma ultra-resiliente
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getAllProducts();
  const cleanSlug = decodeURIComponent(slug).toLowerCase();

  // 1. Coincidencia exacta con slug canónico
  const exact = products.find((p) => getProductSlug(p) === cleanSlug);
  if (exact) return exact;

  // 2. Coincidencia directa por ID completo
  const byId = products.find((p) => p.id.toLowerCase() === cleanSlug);
  if (byId) return byId;

  // 3. Coincidencia por sufijo de ID corto
  const bySuffix = products.find((p) => {
    const shortId = (p.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toLowerCase();
    return shortId && (cleanSlug.endsWith(`-${shortId}`) || cleanSlug === shortId);
  });
  if (bySuffix) return bySuffix;

  // 4. Coincidencia semántica por modelo
  const byModel = products.find((p) => slugify(p.modelo) === cleanSlug);
  if (byModel) return byModel;

  return null;
}
