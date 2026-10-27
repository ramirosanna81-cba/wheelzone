'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductCardImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export default function ProductCardImage({
  src,
  alt,
  priority = false,
}: ProductCardImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#111114]">
      {/* Skeleton Shimmer animado mientras la imagen descarga */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-neutral-900 via-neutral-800/60 to-neutral-900 animate-pulse flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 opacity-50">
            <span className="material-symbols-outlined text-neutral-600 text-3xl animate-bounce">
              directions_car
            </span>
            <span className="font-label-telemetry text-[9px] uppercase tracking-wider text-neutral-500">
              Cargando modelo...
            </span>
          </div>
        </div>
      )}


      {/* Imagen optimizada con fade-in suave */}
      <Image
        src={hasError ? '/images/logos/logo-badge-dark.jpg' : src}
        alt={alt}
        fill
        priority={priority}
        unoptimized={src.startsWith('data:')}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={`object-contain p-2 group-hover:scale-105 transition-all duration-300 relative z-0 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
      />
    </div>
  );
}
