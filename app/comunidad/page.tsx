'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { CommunityPost } from '@/lib/types';
import { fetchCommunityPosts, createCommunityPost, likeCommunityPost, uploadImageToStorage } from '@/lib/supabase';

export default function ComunidadPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string>('Todas');

  // Form states
  const [handle, setHandle] = useState('');
  const [location, setLocation] = useState('');
  const [featuredPiece, setFeaturedPiece] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState('');
  const [tag, setTag] = useState('Vitrina Completa');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Captcha states
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [isVerifyingCaptcha, setIsVerifyingCaptcha] = useState(false);
  const [captchaError, setCaptchaError] = useState<string>('');
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCommunityPosts();
        setPosts(data.filter((p) => p.approved));
      } catch (err) {
        console.error('Error fetching community posts:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const validateAndSetFile = (file: File) => {
    setFileError('');
    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Formato no soportado. Por favor usá JPG, WebP o PNG.');
      return false;
    }

    // Validar peso: Máx 5 MB
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setFileError('La imagen supera el límite máximo de 5 MB. Por favor elegí una más liviana.');
      return false;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    return true;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFileError('');
  };

  // Verificación interactiva del CAPTCHA
  const handleVerifyCaptchaClick = () => {
    if (captchaToken) return;
    setIsVerifyingCaptcha(true);
    setCaptchaError('');

    setTimeout(() => {
      // Token firmado con timestamp para verificación en servidor (/api/verify-captcha)
      const token = `telemetry-pass-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setCaptchaToken(token);
      setIsVerifyingCaptcha(false);
    }, 750);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaptchaError('');

    // Validación obligatoria de CAPTCHA
    if (!captchaToken) {
      setCaptchaError('Por favor completá la verificación anti-spam antes de publicar.');
      return;
    }

    // Validación de imagen requerida
    if (!imageFile && !imagePreview) {
      setFileError('Por favor subí una foto de tu colección.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Validar Token de CAPTCHA en el Servidor (Backend)
      const verifyRes = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        setCaptchaError(verifyData.error || 'Fallo de verificación de seguridad en el servidor.');
        setCaptchaToken('');
        setSubmitting(false);
        return;
      }

      // 2. Procesar subida de imagen
      let finalImageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDF2NhhFy6SanXbIHpoaBx06hWWeCFYGZGEhFt1XBmW9McHDN2KRyOw_hhmHX5HbQrZYS_jQD0HxwUXeV6jww1Q0kuYyRBVqwoOPaw7rfOP3S7tbfbSzkHpP1ApiFS9LrkU65mvAd6vK3IZhMVnxo_WYaU3on3vb3oTAjUw-i8ZJs7XyGRE0AfnQcsxBqJfbWZcIpN1hVvOVgTmO9EEl_l8FRvIaO0Wgmohb4wz_eTz9mQKyQDqOANznw';

      if (imageFile) {
        finalImageUrl = await uploadImageToStorage(imageFile);
      } else if (imagePreview) {
        finalImageUrl = imagePreview;
      }

      // 3. Guardar publicación en base de datos (con approved: false para moderación)
      await createCommunityPost({
        collector_handle: handle.startsWith('@') ? handle : `@${handle}`,
        location,
        featured_piece: featuredPiece,
        rating,
        review,
        tag,
        image_url: finalImageUrl,
      });

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFC200', '#E51937', '#FFFFFF'],
      });

      setSubmitSuccess(true);
      setHandle('');
      setLocation('');
      setFeaturedPiece('');
      setReview('');
      setImageFile(null);
      setImagePreview('');
      setCaptchaToken('');
      setFileError('');

      // Auto-hide success after 8 seconds
      setTimeout(() => setSubmitSuccess(false), 8000);
    } catch (err: any) {
      console.error('Error submitting community post:', err);
      setCaptchaError('Ocurrió un error al procesar el envío. Intentá nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const updatedLikes = await likeCommunityPost(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: updatedLikes } : p))
      );
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const TAGS = ['Todas', 'Vitrina Completa', 'Unboxing Blíster', 'Custom Mod', 'STH Caza'];

  const filteredPosts = activeTag === 'Todas' ? posts : posts.filter((p) => p.tag === activeTag);

  return (
    <div className="flex flex-col w-full pb-20">
      {/* ==============================================================================
          PADDOCK HERO SECTION
      ============================================================================== */}
      <section className="relative w-full bg-surface-container-lowest text-on-surface overflow-hidden px-3 sm:px-6 md:px-8 py-8 sm:py-12 border-b border-surface-container">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-container/10 via-transparent to-primary-container/10 opacity-70 pointer-events-none"></div>
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 bottom-0 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8 z-10">
          {/* Breadcrumb & Telemetry Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 font-label-telemetry text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-surface-container-low px-2.5 sm:px-3 py-1.5 text-primary-container border border-surface-container">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse shrink-0"></span>
              <span className="truncate">ZONA PADDOCK VERIFICADA // TELEMETRÍA</span>
            </div>
            <div className="text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm sm:text-base text-secondary-container">shield</span>
              <span>420+ VITRINAS HOMOLOGADAS</span>
            </div>
          </div>

          {/* Heading */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6">
            <div className="flex flex-col gap-2 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 font-label-telemetry text-[11px] sm:text-xs text-secondary uppercase tracking-widest font-bold">
                <span className="material-symbols-outlined text-sm sm:text-base">sports_motorsports</span>
                <span>COMUNIDAD OFICIAL WHEELS ZONE</span>
              </div>
              <h1 className="font-display-hero text-3xl xs:text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight text-on-surface leading-none">
                EL GARAJE DE LOS <span className="text-primary-container">CLIENTES</span>
              </h1>
              <p className="font-body-lg text-xs sm:text-sm md:text-base text-on-surface-variant max-w-2xl leading-relaxed">
                El santuario de los coleccionistas de alta fidelidad. Exhibí tus piezas RLC, STH y dioramas de precisión, explorá vitrinas reales verificadas y celebrá el culto die-cast 1:64.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <a
                href="#boxes-ingreso"
                className="inline-flex items-center justify-center gap-2 bg-primary-container text-on-primary-container px-5 sm:px-6 py-3 sm:py-3.5 font-headline-sm uppercase text-xs sm:text-sm tracking-wider font-bold shadow-md hover:bg-surface-tint transition-all"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">add_a_photo</span>
                <span>Subir Mi Vitrina</span>
              </a>
              <a
                href="#galeria"
                className="inline-flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-5 sm:px-6 py-3 sm:py-3.5 font-headline-sm uppercase text-xs sm:text-sm tracking-wider border border-surface-container-highest transition-colors"
              >
                <span className="material-symbols-outlined text-base sm:text-lg text-primary-container">tune</span>
                <span>Explorar Vitrinas</span>
              </a>
            </div>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 pt-4 border-t border-surface-container">
            <div className="bg-surface-container-low border border-surface-container p-3 sm:p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between text-outline text-[10px] sm:text-xs font-label-telemetry uppercase">
                <span className="truncate">Vitrinas Activas</span>
                <span className="material-symbols-outlined text-primary-container text-base sm:text-lg shrink-0">garage_home</span>
              </div>
              <div className="font-display-hero text-2xl sm:text-3xl text-on-surface leading-none">428</div>
              <span className="text-[10px] sm:text-[11px] text-secondary font-label-telemetry truncate">+14 esta semana</span>
            </div>

            <div className="bg-surface-container-low border border-surface-container p-3 sm:p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between text-outline text-[10px] sm:text-xs font-label-telemetry uppercase">
                <span className="truncate">Satisfacción</span>
                <span className="material-symbols-outlined text-primary-container text-base sm:text-lg shrink-0">stars</span>
              </div>
              <div className="font-display-hero text-2xl sm:text-3xl text-primary-container leading-none">
                4.9<span className="text-xs sm:text-sm text-on-surface-variant font-normal">/5</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-on-surface-variant font-label-telemetry truncate">390+ reseñas</span>
            </div>

            <div className="bg-surface-container-low border border-surface-container p-3 sm:p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between text-outline text-[10px] sm:text-xs font-label-telemetry uppercase">
                <span className="truncate">Blíster C-10</span>
                <span className="material-symbols-outlined text-secondary-container text-base sm:text-lg shrink-0">verified_user</span>
              </div>
              <div className="font-display-hero text-2xl sm:text-3xl text-on-surface leading-none">100%</div>
              <span className="text-[10px] sm:text-[11px] text-on-surface-variant font-label-telemetry truncate">Garantía embalaje</span>
            </div>

            <div className="bg-surface-container-low border border-surface-container p-3 sm:p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between text-outline text-[10px] sm:text-xs font-label-telemetry uppercase">
                <span className="truncate">NPS Coleccionista</span>
                <span className="material-symbols-outlined text-primary-container text-base sm:text-lg shrink-0">recommend</span>
              </div>
              <div className="font-display-hero text-2xl sm:text-3xl text-secondary-container leading-none">98%</div>
              <span className="text-[10px] sm:text-[11px] text-on-surface-variant font-label-telemetry truncate">Recomiendan</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================================
          FORMULARIO: BOXES DE INGRESO (SUMÁ TU GARAJE)
      ============================================================================== */}
      <section className="w-full bg-surface px-3 sm:px-6 md:px-8 py-10 sm:py-16 border-b border-surface-container" id="boxes-ingreso">
        <div className="max-w-4xl mx-auto bg-surface-container-low border border-surface-container p-4 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-6 shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary-container via-primary-container to-secondary-container"></div>

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-label-telemetry text-[11px] sm:text-xs uppercase text-secondary-container tracking-wider flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-sm sm:text-base">build_circle</span>
                PIT CREW // SUBMISSION SYSTEM
              </span>
              <span className="font-label-telemetry text-[10px] sm:text-xs uppercase text-primary-container bg-surface-container-highest px-2 py-0.5">
                SLOT ACTIVO #2024-WZ
              </span>
            </div>
            <h2 className="font-headline-lg text-xl xs:text-2xl md:text-3xl uppercase tracking-wide text-on-surface">
              BOXES DE INGRESO // <span className="text-primary-container">SUMÁ TU GARAJE</span>
            </h2>
            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
              Compartí tu setup, la llegada de un STH codiciado o tu última vitrina. Las publicaciones se incorporan directamente a la telemetría comunitaria.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Handle */}
              <div className="flex flex-col gap-1">
                <label className="font-label-telemetry text-xs uppercase text-on-surface">
                  Coleccionista / Handle <span className="text-secondary-container">*</span>
                </label>
                <div className="relative flex items-center bg-surface-container border border-surface-container-high focus-within:border-primary-container">
                  <span className="material-symbols-outlined text-outline text-base ml-3 shrink-0">person</span>
                  <input
                    type="text"
                    required
                    placeholder="Ej. @diecast_gonzalo o Facundo M."
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full bg-transparent px-3 py-2 text-on-surface text-sm focus:outline-none placeholder:text-outline"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1">
                <label className="font-label-telemetry text-xs uppercase text-on-surface">
                  Ubicación / Ciudad <span className="text-secondary-container">*</span>
                </label>
                <div className="relative flex items-center bg-surface-container border border-surface-container-high focus-within:border-primary-container">
                  <span className="material-symbols-outlined text-outline text-base ml-3 shrink-0">location_on</span>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Rosario, Santa Fe o CABA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent px-3 py-2 text-on-surface text-sm focus:outline-none placeholder:text-outline"
                  />
                </div>
              </div>
            </div>

            {/* Featured Piece */}
            <div className="flex flex-col gap-1">
              <label className="font-label-telemetry text-xs uppercase text-on-surface">
                Pieza Destacada del Garaje <span className="text-secondary-container">*</span>
              </label>
              <div className="relative flex items-center bg-surface-container border border-surface-container-high focus-within:border-primary-container">
                <span className="material-symbols-outlined text-outline text-base ml-3 shrink-0">directions_car</span>
                <input
                  type="text"
                  required
                  placeholder="Ej. Nissan Skyline GT-R R34 STH / Kaido House Datsun 510"
                  value={featuredPiece}
                  onChange={(e) => setFeaturedPiece(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-on-surface text-sm focus:outline-none placeholder:text-outline"
                />
              </div>
            </div>

            {/* Rating Stars Selector */}
            <div className="flex flex-col gap-1">
              <span className="font-label-telemetry text-xs uppercase text-on-surface">
                Calificación de la Experiencia y Empaque
              </span>
              <div className="flex flex-wrap items-center gap-3 bg-surface-container border border-surface-container-high p-2.5 sm:p-3">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <span
                        className={`material-symbols-outlined text-2xl ${
                          star <= rating ? 'text-primary-container' : 'text-outline'
                        }`}
                        style={{ fontVariationSettings: star <= rating ? '"FILL" 1' : '"FILL" 0' }}
                      >
                        star
                      </span>
                    </button>
                  ))}
                </div>
                <span className="font-label-telemetry text-xs text-primary-container font-bold uppercase">
                  {rating === 5 ? '5 / 5 // IMPECABLE (C-10)' : `${rating} / 5 ESTRELLAS`}
                </span>
              </div>
            </div>

            {/* Review Testimonial */}
            <div className="flex flex-col gap-1">
              <label className="font-label-telemetry text-xs uppercase text-on-surface">
                Testimonio / Estado de Recepción y Vitrina <span className="text-secondary-container">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Contanos cómo llegó protegido el producto, cómo lo exhibís y qué tal el nivel de detalle..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full bg-surface-container border border-surface-container-high p-3 text-on-surface text-sm focus:outline-none focus:border-primary-container placeholder:text-outline"
              ></textarea>
            </div>

            {/* Tag Selection (Responsive Grid / Wrap for Mobile) */}
            <div className="flex flex-col gap-1.5">
              <span className="font-label-telemetry text-xs uppercase text-on-surface">
                Categoría de la Publicación <span className="text-secondary-container">*</span>
              </span>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {['Vitrina Completa', 'Unboxing Blíster', 'Custom Mod', 'STH Caza'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={`w-full sm:w-auto px-3 py-2 sm:py-1.5 font-label-telemetry text-[11px] sm:text-xs uppercase border transition-all text-center flex items-center justify-center gap-1.5 ${
                      tag === t
                        ? 'bg-primary-container text-on-primary-container border-primary-container font-bold shadow-sm'
                        : 'bg-surface-container text-on-surface-variant border-surface-container-high hover:text-on-surface hover:border-surface-container-highest'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tag === t ? '#251a00' : '#ffe5b0' }}></span>
                    <span className="truncate">{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload with Thumbnail Preview & Change/Remove Buttons */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-label-telemetry text-xs uppercase text-on-surface">
                  Fotografía Real de tu Vitrina o Modelo <span className="text-secondary-container">*</span>
                </label>
                {fileError && (
                  <span className="text-race-red text-[11px] font-label-telemetry font-bold">
                    {fileError}
                  </span>
                )}
              </div>

              {imagePreview ? (
                /* Instant Thumbnail Preview with quick actions */
                <div className="relative w-full rounded-lg border border-surface-container-highest bg-surface-container-lowest overflow-hidden flex flex-col p-3 sm:p-4 gap-3">
                  <div className="relative w-full h-48 sm:h-64 rounded bg-[#0b0b0b] overflow-hidden flex items-center justify-center">
                    <Image
                      src={imagePreview}
                      alt="Thumbnail de la colección"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/85 backdrop-blur-sm border border-emerald-500/50 text-emerald-400 font-label-telemetry text-[10px] uppercase font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      IMAGEN CARGADA
                    </div>
                  </div>

                  {/* Quick Action Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-surface-container">
                    <span className="text-xs font-label-telemetry text-outline truncate max-w-[200px] sm:max-w-xs">
                      {imageFile?.name || 'Fotografía seleccionada'} ({( (imageFile?.size || 0) / (1024 * 1024) ).toFixed(2)} MB)
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-telemetry text-xs uppercase cursor-pointer border border-surface-container-highest flex items-center gap-1 transition-colors">
                        <span className="material-symbols-outlined text-sm text-primary-container">sync</span>
                        <span>Cambiar Foto</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-300 font-label-telemetry text-xs uppercase border border-red-800/60 flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Dropzone Area */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed p-4 sm:p-6 text-center flex flex-col items-center justify-center relative transition-all cursor-pointer rounded-lg ${
                    isDragging
                      ? 'border-primary-container bg-primary-container/10 scale-[1.01]'
                      : 'border-surface-container-highest bg-surface-container hover:border-primary-container'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center gap-1.5 pointer-events-none px-2">
                    <span className="material-symbols-outlined text-primary-container text-3xl sm:text-4xl animate-bounce">
                      add_photo_alternate
                    </span>
                    <span className="font-headline-sm uppercase text-xs sm:text-sm text-on-surface text-center">
                      Hacé clic o arrastrá aquí la foto de tu colección
                    </span>
                    <span className="text-[11px] sm:text-xs text-primary font-label-telemetry text-center tracking-wider">
                      Conversión automática a WebP optimizado (Máx. 1200px) para carga ultrarrápida
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ==============================================================================
                3. INTEGRACIÓN DE CAPTCHA (TONOS OSCUROS & ACENTO AMARILLO RACING)
            ============================================================================== */}
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-label-telemetry text-xs uppercase text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary-container text-sm">shield</span>
                  <span>Verificación Anti-Spam Pit Crew <span className="text-secondary-container">*</span></span>
                </label>
                <span className="text-[10px] font-label-telemetry text-outline">
                  TELEMETRY PROTOCOL v3
                </span>
              </div>

              {/* Contenedor Turnstile si está la key en el entorno */}
              {turnstileSiteKey && (
                <div
                  id="turnstile-container"
                  className="my-1 flex items-center justify-center min-h-[65px] bg-[#0d0d10] border border-surface-container-high p-2"
                ></div>
              )}

              {/* Widget Anti-Bot Telemétrico Interactivo (Racing Style) */}
              <div
                onClick={handleVerifyCaptchaClick}
                className={`flex items-center justify-between p-3 sm:p-3.5 border transition-all cursor-pointer rounded select-none ${
                  captchaToken
                    ? 'bg-emerald-950/20 border-emerald-500/60'
                    : 'bg-[#101014] border-neutral-800 hover:border-primary-container'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${
                      captchaToken
                        ? 'bg-emerald-500 border-emerald-400 text-black scale-105'
                        : isVerifyingCaptcha
                        ? 'bg-neutral-800 border-primary-container'
                        : 'bg-neutral-900 border-neutral-700'
                    }`}
                  >
                    {captchaToken ? (
                      <span className="material-symbols-outlined text-base font-bold">check</span>
                    ) : isVerifyingCaptcha ? (
                      <span className="material-symbols-outlined text-sm text-primary-container animate-spin">sync</span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-primary-container/40"></span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-telemetry text-xs sm:text-sm uppercase tracking-wider text-on-surface font-semibold">
                      {captchaToken
                        ? 'Verificación completada: Coleccionista humano verificado'
                        : isVerifyingCaptcha
                        ? 'Verificando telemetría anti-spam...'
                        : 'No soy un robot (Hacé clic para verificar)'}
                    </span>
                    <span className="text-[10px] text-outline font-label-telemetry">
                      Protección contra bots y spam malicioso
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className="font-headline-sm text-xs text-primary-container tracking-wider">
                    WZ<span className="text-secondary-container">SHIELD</span>
                  </span>
                  <span className="text-[9px] text-outline uppercase font-label-telemetry">
                    Cloud Security
                  </span>
                </div>
              </div>

              {captchaError && (
                <div className="flex items-center gap-1.5 text-race-red text-xs font-label-telemetry">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  <span>{captchaError}</span>
                </div>
              )}
            </div>

            {/* Submit button */}
            <div className="flex flex-col gap-2 pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 sm:py-4 bg-primary-container hover:bg-surface-tint active:scale-[0.99] text-on-primary-container font-headline-md uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 font-bold shadow-md transition-all disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-base sm:text-lg animate-spin">refresh</span>
                    <span>SUBIENDO AL GARAJE...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base sm:text-lg">publish</span>
                    <span>PUBLICAR EN EL GARAJE DE CLIENTES</span>
                  </>
                )}
              </button>

              {submitSuccess && (
                <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/60 text-on-surface font-label-telemetry text-xs flex items-center gap-2.5 rounded-sm">
                  <span className="material-symbols-outlined text-emerald-400 text-lg shrink-0">check_circle</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-emerald-400 font-bold uppercase text-[11px] sm:text-xs">
                      ¡FOTO Y RESEÑA ENVIADAS CORRECTAMENTE!
                    </span>
                    <span className="text-neutral-300 text-[10px] sm:text-[11px] font-sans">
                      Tu publicación fue enviada a revisión y será visible en la vitrina una vez aprobada por el equipo de Wheels Zone.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* ==============================================================================
          GALERÍA DE LA COMUNIDAD (INTERACTIVA EN TIEMPO REAL)
      ============================================================================== */}
      <section className="w-full px-3 sm:px-6 md:px-8 mx-auto max-w-7xl py-10 sm:py-16" id="galeria">
        <div className="flex flex-col gap-6">
          {/* Gallery Header and Tag Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-container">
            <div className="flex flex-col gap-1">
              <h2 className="font-display-hero text-2xl sm:text-3xl uppercase tracking-tight text-on-surface">
                VITRINAS DE LA COMUNIDAD ({filteredPosts.length})
              </h2>
              <span className="font-label-telemetry text-[11px] sm:text-xs uppercase text-outline">
                FOTOS REALES DE COMPRADORES VERIFICADOS
              </span>
            </div>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTag(t)}
                  className={`px-2.5 sm:px-3 py-1 font-label-telemetry text-[11px] sm:text-xs uppercase border transition-colors ${
                    activeTag === t
                      ? 'bg-primary-container text-on-primary-container border-primary-container font-bold'
                      : 'bg-surface-container text-on-surface-variant border-surface-container hover:text-on-surface'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 sm:h-96 bg-surface-container-low animate-pulse border border-surface-container"></div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-surface-container-low border border-surface-container p-8 sm:p-14 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-surface-container-high border border-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-primary-container">camera_alt</span>
              </div>
              <div className="flex flex-col gap-1.5 max-w-md">
                <h3 className="font-headline-md text-lg sm:text-xl uppercase text-on-surface">
                  Sé el primero en exhibir tu vitrina
                </h3>
                <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Sumá la foto de tu colección o unboxing de tu última pieza adquirida en Wheels Zone usando el formulario de Boxes de arriba.
                </p>
              </div>
              <a
                href="#boxes-ingreso"
                className="mt-2 px-5 py-2.5 bg-primary-container hover:bg-surface-tint text-on-primary-container font-headline-sm uppercase text-xs tracking-wider font-bold transition-all"
              >
                Subir Mi Colección
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="group bg-surface-container-low border border-surface-container hover:border-surface-container-highest transition-all duration-300 flex flex-col overflow-hidden shadow-lg"
                >
                  {/* Photo with tag badge */}
                  <div className="relative w-full h-52 xs:h-60 sm:h-64 bg-surface-container-lowest overflow-hidden">
                    <Image
                      src={post.image_url}
                      alt={post.featured_piece}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-primary-container text-on-primary-container font-label-telemetry text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 uppercase font-bold tracking-wider">
                        {post.tag}
                      </span>
                    </div>
                  </div>

                  {/* Post details */}
                  <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3 sm:gap-4">
                    <div className="flex flex-col gap-2">
                      {/* User Header */}
                      <div className="flex items-center justify-between border-b border-surface-container pb-2 gap-2">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-headline-sm uppercase text-xs sm:text-sm text-on-surface font-bold truncate">
                              {post.collector_handle}
                            </span>
                            <span className="material-symbols-outlined text-primary-container text-sm shrink-0" title="Coleccionista Verificado">
                              verified
                            </span>
                          </div>
                          <span className="font-body-sm text-[11px] sm:text-xs text-outline flex items-center gap-1 truncate">
                            <span className="material-symbols-outlined text-xs shrink-0">location_on</span>
                            <span className="truncate">{post.location}</span>
                          </span>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center text-primary-container shrink-0">
                          {Array.from({ length: post.rating }).map((_, i) => (
                            <span
                              key={i}
                              className="material-symbols-outlined text-xs sm:text-sm"
                              style={{ fontVariationSettings: '"FILL" 1' }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Featured Model badge */}
                      <div className="flex items-center gap-1.5 font-label-telemetry text-xs text-primary-container">
                        <span className="material-symbols-outlined text-sm shrink-0">directions_car</span>
                        <span className="uppercase font-bold truncate">{post.featured_piece}</span>
                      </div>

                      {/* Review text */}
                      <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed italic line-clamp-4">
                        "{post.review}"
                      </p>
                    </div>

                    {/* Bottom Like and date strip */}
                    <div className="flex items-center justify-between pt-2 border-t border-surface-container">
                      <span className="font-label-telemetry text-[10px] sm:text-[11px] text-outline">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString('es-AR') : 'Reciente'}
                      </span>

                      {/* Fire / Like Button */}
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors font-label-telemetry text-xs uppercase border border-surface-container"
                      >
                        <span className="material-symbols-outlined text-secondary text-sm sm:text-base" style={{ fontVariationSettings: '"FILL" 1' }}>
                          local_fire_department
                        </span>
                        <span className="font-bold">{post.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
