import React from 'react';
import type { Metadata } from 'next';
import EventosClient from './EventosClient';
import { fetchEvents } from '@/lib/supabase';
import { INITIAL_EVENTS } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Agenda de Ferias y Eventos Diecast | Stand Oficial Wheels Zone',
  description:
    'Consultá el cronograma de ferias, plazas y eventos diecast donde podés encontrar el stand de Wheels Zone. Coleccionables Hot Wheels, Super Treasure Hunts ($TH), RLC y más.',
  alternates: {
    canonical: '/eventos',
  },
  openGraph: {
    title: 'Agenda de Ferias y Eventos Diecast | Stand Oficial Wheels Zone',
    description:
      'Calendario oficial de ferias, convenciones y encuentros de coleccionistas Hot Wheels y autos a escala en Argentina.',
    url: 'https://wheelszone.com.ar/eventos',
    type: 'website',
    images: [
      {
        url: '/images/logos/logo-swoosh-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Agenda de Ferias y Eventos Diecast - Wheels Zone',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agenda de Ferias y Eventos Diecast | Wheels Zone',
    description:
      'Calendario oficial de ferias y eventos diecast donde encontrar el stand oficial de Wheels Zone.',
    images: ['/images/logos/logo-swoosh-banner.jpg'],
  },
};

export default async function EventosPage() {
  let initialEvents = INITIAL_EVENTS;

  try {
    const fetched = await fetchEvents(true);
    if (fetched && fetched.length > 0) {
      initialEvents = fetched;
    }
  } catch (err) {
    console.warn('Error fetching events on server:', err);
  }

  // Schema.org EventSeries JSON-LD
  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EventSeries',
    name: 'Agenda de Ferias y Eventos Diecast - Wheels Zone',
    description:
      'Encuentros y ferias de coleccionismo automotriz diecast y stand oficial de Wheels Zone.',
    url: 'https://wheelszone.com.ar/eventos',
    organizer: {
      '@type': 'Organization',
      name: 'Wheels Zone',
      url: 'https://wheelszone.com.ar',
    },
    event: initialEvents.slice(0, 10).map((evt) => ({
      '@type': 'Event',
      name: evt.title,
      startDate: evt.start_date,
      endDate: evt.end_date || evt.start_date,
      location: {
        '@type': 'Place',
        name: evt.title,
        address: {
          '@type': 'PostalAddress',
          addressLocality: evt.city,
          addressCountry: 'AR',
        },
      },
      image: evt.image_url,
      description: `Feria Diecast en ${evt.city}. Stand oficial Wheels Zone. Horario: ${evt.time_text}.`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />
      <EventosClient initialEvents={initialEvents} />
    </>
  );
}
