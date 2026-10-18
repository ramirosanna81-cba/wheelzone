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
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let finalImageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDF2NhhFy6SanXbIHpoaBx06hWWeCFYGZGEhFt1XBmW9McHDN2KRyOw_hhmHX5HbQrZYS_jQD0HxwUXeV6jww1Q0kuYyRBVqwoOPaw7rfOP3S7tbfbSzkHpP1ApiFS9LrkU65mvAd6vK3IZhMVnxo_WYaU3on3vb3oTAjUw-i8ZJs7XyGRE0AfnQcsxBqJfbWZcIpN1hVvOVgTmO9EEl_l8FRvIaO0Wgmohb4wz_eTz9mQKyQDqOANznw';

      if (imageFile) {
        finalImageUrl = await uploadImageToStorage(imageFile);
      } else if (imagePreview) {
        finalImageUrl = imagePreview;
      }

      const newPost = await createCommunityPost({
        collector_handle: handle.startsWith('@') ? handle : `@${handle}`,
        location,
        featured_piece: featuredPiece,
        rating,
        review,
        tag,
        image_url: finalImageUrl,
      });

      setPosts((prev) => [newPost, ...prev]);

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

      // Auto-hide success after 4 seconds
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      console.error('Error submitting community post:', err);
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
      <section className="relative w-full bg-surface-container-lowest text-on-surface overflow-hidden px-4 md:px-8 py-12 border-b border-surface-container">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-container/10 via-transparent to-primary-container/10 opacity-70 pointer-events-none"></div>
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 bottom-0 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto flex flex-col gap-8 z-10">
          {/* Breadcrumb & Telemetry Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 font-label-telemetry text-xs uppercase tracking-widest">
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 text-primary-container border border-surface-container">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span>ZONA PADDOCK VERIFICADA // TELEMETRÍA COMUNITARIA</span>
            </div>
            <div className="text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-secondary-container">shield</span>
              <span>420+ VITRINAS HOMOLOGADAS EN PISTA</span>
            </div>
          </div>

          {/* Heading */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 font-label-telemetry text-xs text-secondary uppercase tracking-widest font-bold">
                <span className="material-symbols-outlined text-base">sports_motorsports</span>
                <span>COMUNIDAD OFICIAL WHEELS ZONE</span>
              </div>
              <h1 className="font-display-hero text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight text-on-surface leading-none">
                EL GARAJE DE LOS <span className="text-primary-container">CLIENTES</span>
              </h1>
              <p className="font-body-lg text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
                El santuario de los coleccionistas de alta fidelidad. Exhibí tus piezas RLC, STH y dioramas de precisión, explorá vitrinas reales verificadas y celebrá el culto die-cast 1:64.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#boxes-ingreso"
                className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-6 py-3.5 font-headline-sm uppercase text-sm tracking-wider font-bold shadow-md hover:bg-surface-tint transition-all"
              >
                <span className="material-symbols-outlined text-lg">add_a_photo</span>
                <span>Subir Mi Vitrina</span>
              </a>
              <a
                href="#galeria"
                className="inline-flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-6 py-3.5 font-headline-sm uppercase text-sm tracking-wider border border-surface-container-highest transition-colors"
              >
                <span className="material-symbols-outlined text-lg text-primary-container">tune</span>
                <span>Explorar Vitrinas</span>
              </a>
            </div>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-surface-container">
            <div className="bg-surface-container-low border border-surface-container p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between text-outline text-xs font-label-telemetry uppercase">
                <span>Vitrinas Activas</span>
                <span className="material-symbols-outlined text-primary-container text-lg">garage_home</span>
              </div>
              <div className="font-display-hero text-3xl text-on-surface leading-none">428</div>
              <span className="text-[11px] text-secondary font-label-telemetry">+14 inspeccionadas esta semana</span>
            </div>

            <div className="bg-surface-container-low border border-surface-container p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between text-outline text-xs font-label-telemetry uppercase">
                <span>Score de Satisfacción</span>
                <span className="material-symbols-outlined text-primary-container text-lg">stars</span>
              </div>
              <div className="font-display-hero text-3xl text-primary-container leading-none">
                4.9<span className="text-sm text-on-surface-variant font-normal">/5</span>
              </div>
              <span className="text-[11px] text-on-surface-variant font-label-telemetry">390+ reseñas auditadas</span>
            </div>

            <div className="bg-surface-container-low border border-surface-container p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between text-outline text-xs font-label-telemetry uppercase">
                <span>Blíster C-10 Intactos</span>
                <span className="material-symbols-outlined text-secondary-container text-lg">verified_user</span>
              </div>
              <div className="font-display-hero text-3xl text-on-surface leading-none">100%</div>
              <span className="text-[11px] text-on-surface-variant font-label-telemetry">Garantía de embalaje</span>
            </div>

            <div className="bg-surface-container-low border border-surface-container p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between text-outline text-xs font-label-telemetry uppercase">
                <span>Net Promoter Score</span>
                <span className="material-symbols-outlined text-primary-container text-lg">recommend</span>
              </div>
              <div className="font-display-hero text-3xl text-secondary-container leading-none">98%</div>
              <span className="text-[11px] text-on-surface-variant font-label-telemetry">Recomiendan a coleccionistas</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================================
          FORMULARIO: BOXES DE INGRESO (SUMÁ TU GARAJE)
      ============================================================================== */}
      <section className="w-full bg-surface px-4 md:px-8 py-16 border-b border-surface-container" id="boxes-ingreso">
        <div className="max-w-4xl mx-auto bg-surface-container-low border border-surface-container p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary-container via-primary-container to-secondary-container"></div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-label-telemetry text-xs uppercase text-secondary-container tracking-wider flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-base">build_circle</span>
                PIT CREW // SUBMISSION SYSTEM
              </span>
              <span className="font-label-telemetry text-xs uppercase text-primary-container bg-surface-container-highest px-2 py-0.5">
                SLOT ACTIVO #2024-WZ
              </span>
            </div>
            <h2 className="font-headline-lg text-2xl md:text-3xl uppercase tracking-wide text-on-surface">
              BOXES DE INGRESO // <span className="text-primary-container">SUMÁ TU GARAJE</span>
            </h2>
            <p className="font-body-md text-xs text-on-surface-variant">
              Compartí tu setup, la llegada de un STH codiciado o tu última vitrina. Las publicaciones se incorporan directamente a la telemetría comunitaria.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Handle */}
              <div className="flex flex-col gap-1">
                <label className="font-label-telemetry text-xs uppercase text-on-surface">
                  Coleccionista / Handle <span className="text-secondary-container">*</span>
                </label>
                <div className="relative flex items-center bg-surface-container border border-surface-container-high focus-within:border-primary-container">
                  <span className="material-symbols-outlined text-outline text-base ml-3">person</span>
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
                  <span className="material-symbols-outlined text-outline text-base ml-3">location_on</span>
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
                <span className="material-symbols-outlined text-outline text-base ml-3">directions_car</span>
                <input
                  type="text"
                  required
                  placeholder="Ej. Nissan Skyline GT-R R34 STH 2024 / Kaido House Datsun 510"
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
              <div className="flex items-center gap-4 bg-surface-container border border-surface-container-high p-3">
                <div className="flex items-center gap-1">
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
                placeholder="Contale a la comunidad cómo llegó protegido tu blíster, cómo lo exhibís o el nivel de detalle de tu casting..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full bg-surface-container border border-surface-container-high p-3 text-on-surface text-sm focus:outline-none focus:border-primary-container placeholder:text-outline"
              ></textarea>
            </div>

            {/* Tag Selection */}
            <div className="flex flex-col gap-1">
              <span className="font-label-telemetry text-xs uppercase text-on-surface">
                Categoría de la Publicación
              </span>
              <div className="flex flex-wrap gap-2">
                {['Vitrina Completa', 'Unboxing Blíster', 'Custom Mod', 'STH Caza'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={`px-3 py-1.5 font-label-telemetry text-xs uppercase border transition-colors ${
                      tag === t
                        ? 'bg-primary-container text-on-primary-container border-primary-container font-bold'
                        : 'bg-surface-container text-on-surface-variant border-surface-container hover:text-on-surface'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload with Drag & Drop / Preview */}
            <div className="flex flex-col gap-1">
              <label className="font-label-telemetry text-xs uppercase text-on-surface">
                Fotografía Real de tu Vitrina o Modelo
              </label>
              <div className="border-2 border-dashed border-surface-container-highest bg-surface-container p-4 text-center flex flex-col items-center justify-center relative hover:border-primary-container transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {imagePreview ? (
                  <div className="relative w-full h-44 overflow-hidden border border-surface-container">
                    <Image
                      src={imagePreview}
                      alt="Preview subida"
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-primary-container font-label-telemetry text-[10px] uppercase">
                      FOTO LISTA PARA SUBIR
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 py-4 pointer-events-none">
                    <span className="material-symbols-outlined text-primary-container text-3xl">add_photo_alternate</span>
                    <span className="font-headline-sm uppercase text-sm text-on-surface">
                      Hacé clic o arrastrá aquí la foto de tu colección
                    </span>
                    <span className="text-[11px] text-outline font-label-telemetry">
                      Formatos JPG, PNG, WebP (Se comprime automáticamente para alta velocidad)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit button */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary-container hover:bg-surface-tint text-on-primary-container font-headline-md uppercase text-sm tracking-wider flex items-center justify-center gap-2 font-bold shadow-md transition-all disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                    <span>SUBIENDO AL GARAJE...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">publish</span>
                    <span>PUBLICAR EN EL GARAJE DE CLIENTES</span>
                  </>
                )}
              </button>

              {submitSuccess && (
                <div className="p-3 bg-secondary-container/20 border border-secondary-container text-on-surface font-label-telemetry text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-base">check_circle</span>
                  <span className="text-primary-container font-bold uppercase">
                    ¡VITRINA PUBLICADA EXITOSAMENTE EN EL GARAJE DE WHEELS ZONE!
                  </span>
                </div>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* ==============================================================================
          GALERÍA DE LA COMUNIDAD (INTERACTIVA EN TIEMPO REAL)
      ============================================================================== */}
      <section className="w-full px-4 md:px-8 mx-auto max-w-7xl py-16" id="galeria">
        <div className="flex flex-col gap-6">
          {/* Gallery Header and Tag Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-container">
            <div className="flex flex-col gap-1">
              <h2 className="font-display-hero text-3xl uppercase tracking-tight text-on-surface">
                VITRINAS DE LA COMUNIDAD ({filteredPosts.length})
              </h2>
              <span className="font-label-telemetry text-xs uppercase text-outline">
                FOTOS REALES DE COMPRADORES VERIFICADOS
              </span>
            </div>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTag(t)}
                  className={`px-3 py-1 font-label-telemetry text-xs uppercase border transition-colors ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-96 bg-surface-container-low animate-pulse border border-surface-container"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="group bg-surface-container-low border border-surface-container hover:border-surface-container-highest transition-all duration-300 flex flex-col overflow-hidden shadow-lg"
                >
                  {/* Photo with tag badge */}
                  <div className="relative w-full h-64 bg-surface-container-lowest overflow-hidden">
                    <Image
                      src={post.image_url}
                      alt={post.featured_piece}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-primary-container text-on-primary-container font-label-telemetry text-xs px-2.5 py-0.5 uppercase font-bold tracking-wider">
                        {post.tag}
                      </span>
                    </div>
                  </div>

                  {/* Post details */}
                  <div className="p-5 flex flex-col flex-grow justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      {/* User Header */}
                      <div className="flex items-center justify-between border-b border-surface-container pb-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-headline-sm uppercase text-sm text-on-surface font-bold">
                              {post.collector_handle}
                            </span>
                            <span className="material-symbols-outlined text-primary-container text-sm" title="Coleccionista Verificado">
                              verified
                            </span>
                          </div>
                          <span className="font-body-sm text-xs text-outline flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            {post.location}
                          </span>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center text-primary-container">
                          {Array.from({ length: post.rating }).map((_, i) => (
                            <span
                              key={i}
                              className="material-symbols-outlined text-sm"
                              style={{ fontVariationSettings: '"FILL" 1' }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Featured Model badge */}
                      <div className="flex items-center gap-1.5 font-label-telemetry text-xs text-primary-container">
                        <span className="material-symbols-outlined text-sm">directions_car</span>
                        <span className="uppercase font-bold truncate">{post.featured_piece}</span>
                      </div>

                      {/* Review text */}
                      <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed italic">
                        "{post.review}"
                      </p>
                    </div>

                    {/* Bottom Like and date strip */}
                    <div className="flex items-center justify-between pt-2 border-t border-surface-container">
                      <span className="font-label-telemetry text-[11px] text-outline">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString('es-AR') : 'Reciente'}
                      </span>

                      {/* Fire / Like Button */}
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors font-label-telemetry text-xs uppercase border border-surface-container"
                      >
                        <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: '"FILL" 1' }}>
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
