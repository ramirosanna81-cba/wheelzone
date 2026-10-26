import { MetadataRoute } from 'next';
import { getAllProducts, getProductSlug } from '@/lib/product-seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://wheelszone.com.ar';
  const currentDate = new Date().toISOString();

  // 1. Rutas estáticas de la plataforma
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tienda`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/showroom`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/eventos`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/comunidad`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // 2. Rutas dinámicas de fichas de producto (/tienda/[slug])
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getAllProducts();
    productRoutes = products
      .filter((p) => p.activo !== false)
      .map((p) => ({
        url: `${baseUrl}/tienda/${getProductSlug(p)}`,
        lastModified: p.created_at || currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
  } catch (err) {
    console.warn('Error generando sitemap de productos:', err);
  }

  return [...staticRoutes, ...productRoutes];
}

