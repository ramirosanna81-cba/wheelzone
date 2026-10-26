import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllProducts, getProductBySlug, getProductSlug } from '@/lib/product-seo';
import { getDefaultProductDescription } from '@/lib/catalog-constants';
import ProductDetailClient from '@/components/ProductDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-renderiza los slugs estáticos para máxima velocidad y LCP óptimo
 */
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({
    slug: getProductSlug(p),
  }));
}

/**
 * Generación dinámica de metadatos estricta según las especificaciones SEO
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Producto no encontrado | Wheels Zone',
      description: 'El modelo solicitado no se encuentra en el catálogo.',
    };
  }

  const modelName = product.modelo;
  const title = `${modelName} ${product.escala} - ${product.marca}`;
  const description = `Comprá ${modelName} marca ${product.marca} escala ${product.escala}. Modelo nuevo en blíster cerrado con envíos a todo el país o retiro en Junín.`;
  const canonicalUrl = `/tienda/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Wheels Zone`,
      description,
      url: `https://wheelszone.com.ar/tienda/${slug}`,
      type: 'website',
      images: [
        {
          url: product.imagen_url,
          width: 800,
          height: 800,
          alt: `${modelName} - ${product.marca} escala ${product.escala}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.imagen_url],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getAllProducts();
  const relatedProducts = allProducts.filter(
    (p) => p.id !== product.id && (p.marca === product.marca || p.categoria === product.categoria)
  );

  // Schema.org Product estructurado oficial con NewCondition e InStock
  const productSchemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.modelo} ${product.escala} (${product.marca})`,
    image: [product.imagen_url],
    description: product.descripcion || getDefaultProductDescription(product),
    brand: {
      '@type': 'Brand',
      name: product.marca,
    },
    itemCondition: 'https://schema.org/NewCondition',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ARS',
      price: product.precio,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `https://wheelszone.com.ar/tienda/${slug}`,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'HobbyShop',
        name: 'Wheels Zone',
      },
    },
  };

  // Schema.org BreadcrumbList para navegación en Google
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://wheelszone.com.ar',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tienda',
        item: 'https://wheelszone.com.ar/tienda',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.marca,
        item: `https://wheelszone.com.ar/tienda?marca=${encodeURIComponent(product.marca)}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.modelo,
        item: `https://wheelszone.com.ar/tienda/${slug}`,
      },
    ],
  };

  return (
    <div className="w-full bg-[#0d0d10] text-on-surface py-6 sm:py-10">
      {/* Schema.org Inyecciones JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchemaJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col gap-6">
        {/* Breadcrumbs navegables */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-label-telemetry text-xs text-neutral-400 flex-wrap">
          <Link href="/" className="hover:text-primary-container transition-colors">
            Inicio
          </Link>
          <span className="text-neutral-600">/</span>
          <Link href="/tienda" className="hover:text-primary-container transition-colors">
            Tienda
          </Link>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-300 uppercase">{product.marca}</span>
          <span className="text-neutral-600">/</span>
          <span className="text-primary-container font-bold truncate max-w-xs uppercase">
            {product.modelo}
          </span>
        </nav>

        {/* Componente Interactivo de Ficha de Producto */}
        <ProductDetailClient
          product={product}
          relatedProducts={relatedProducts}
          slug={slug}
        />
      </div>
    </div>
  );
}
