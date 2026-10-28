import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllProducts } from '@/lib/product-seo';
import CategoryViewClient from '@/components/CategoryViewClient';

import { CATEGORY_DEFINITIONS } from '@/lib/categories-config';

interface PageProps {
  params: Promise<{ categoria: string }>;
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_DEFINITIONS).map((categoria) => ({
    categoria,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria } = await params;
  const config = CATEGORY_DEFINITIONS[categoria];

  if (!config) {
    return {
      title: 'Colección no encontrada | Wheels Zone',
      description: 'La categoría solicitada no se encuentra disponible.',
    };
  }

  const canonicalUrl = `/coleccion/${categoria}`;

  return {
    title: config.seoTitle,
    description: config.description,
    keywords: config.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${config.seoTitle} | Wheels Zone`,
      description: config.description,
      url: `https://www.wheelszone.com.ar/coleccion/${categoria}`,
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `Wheels Zone - ${config.title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.seoTitle,
      description: config.description,
      images: ['/og-image.jpg'],
    },
  };
}

export default async function ColeccionCategoryPage({ params }: PageProps) {
  const { categoria } = await params;
  const config = CATEGORY_DEFINITIONS[categoria];

  if (!config) {
    notFound();
  }

  const allProducts = await getAllProducts();
  const categoryProducts = allProducts.filter((p) => config.filterFn(p));

  // Breadcrumb Schema.org
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://www.wheelszone.com.ar',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Catálogo',
        item: 'https://www.wheelszone.com.ar/tienda',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: config.title,
        item: `https://www.wheelszone.com.ar/coleccion/${categoria}`,
      },
    ],
  };

  // CollectionPage Schema.org
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: config.title,
    description: config.description,
    url: `https://www.wheelszone.com.ar/coleccion/${categoria}`,
    isPartOf: {
      '@type': 'Store',
      name: 'Wheels Zone',
      url: 'https://www.wheelszone.com.ar',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <CategoryViewClient
        products={categoryProducts}
        categorySlug={categoria}
        categoryTitle={config.title}
        categoryDescription={config.description}
      />
    </>
  );
}
