'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DiecastEvent } from '@/lib/types';
import {
  isSupabaseConfigured,
  supabase,
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventActive,
  uploadImageToStorage,
} from '@/lib/supabase';
import EventCard from '@/components/EventCard';

export default function AdminEventosPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState('admin@wheelszone.com');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Data & Loading States
  const [events, setEvents] = useState<DiecastEvent[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [tableMissing, setTableMissing] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'special'>('all');

  // Form State (New or Edit)
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    city: 'Junín',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    time_text: '15:00 hs',
    image_url: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=600&q=80',
    is_special: false,
    special_text: 'ESPECIAL DÍA DE LA MADRE',
    maps_url: '',
    is_active: true,
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Check Supabase session & local session
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      if (isSupabaseConfigured && supabase) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setIsAuthenticated(true);
            setAuthEmail(session.user.email || 'admin@wheelszone.com');
            return;
          }
        } catch (err) {
          console.warn('Error checking supabase session:', err);
        }
      }

      const savedSession = localStorage.getItem('wheelszone_admin_session');
      if (savedSession === 'true' && mounted) {
        setIsAuthenticated(true);
      }
    }

    checkSession();

    if (isSupabaseConfigured && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setIsAuthenticated(true);
          setAuthEmail(session.user.email || 'admin@wheelszone.com');
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          localStorage.removeItem('wheelszone_admin_session');
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch all events when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      setLoadingData(true);
      try {
        const data = await fetchEvents(false);
        setEvents(data);

        // Check if public.events table exists in Supabase
        if (isSupabaseConfigured && supabase) {
          const { error: checkError } = await supabase.from('events').select('id').limit(1);
          if (checkError && (checkError.code === 'PGRST205' || checkError.message?.includes('schema cache'))) {
            setTableMissing(true);
          } else if (!checkError) {
            setTableMissing(false);
          }
        }
      } catch (err) {
        console.error('Error cargando eventos:', err);
        showToast('Error al cargar la agenda de eventos.', 'error');
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });

        if (!error) {
          setIsAuthenticated(true);
          localStorage.setItem('wheelszone_admin_session', 'true');
          setAuthLoading(false);
          return;
        } else {
          setAuthError(error.message);
        }
      } catch (err: any) {
        setAuthError(err?.message || 'Error al iniciar sesión');
      }
    }

    // Demo / fallback auth
    if (authPassword === 'admin123' || authPassword === 'wheelszone2025' || authPassword === 'diecast') {
      setIsAuthenticated(true);
      localStorage.setItem('wheelszone_admin_session', 'true');
      setAuthError('');
    } else {
      setAuthError('Credenciales incorrectas. Para modo demo usá contraseña: admin123');
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('wheelszone_admin_session');
    setIsAuthenticated(false);
  };

  // Image upload handler targeting 'events' bucket
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      const publicUrl = await uploadImageToStorage(file, 'events');
      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      showToast('Foto cargada y optimizada para el evento.');
    } catch (err: any) {
      console.error('Error subiendo imagen de evento:', err);
      showToast('Error al procesar la imagen.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Reset form to defaults
  const resetForm = () => {
    setFormData({
      title: '',
      city: 'Junín',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      time_text: '15:00 hs',
      image_url: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=600&q=80',
      is_special: false,
      special_text: 'ESPECIAL DÍA DE LA MADRE',
      maps_url: '',
      is_active: true,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Edit Event button clicked
  const handleEditClick = (evt: DiecastEvent) => {
    setIsEditing(true);
    setEditingId(evt.id);
    setFormData({
      title: evt.title,
      city: evt.city,
      start_date: evt.start_date,
      end_date: evt.end_date || '',
      time_text: evt.time_text || '15:00 hs',
      image_url: evt.image_url,
      is_special: evt.is_special,
      special_text: evt.special_text || 'ESPECIAL DÍA DE LA MADRE',
      maps_url: evt.maps_url || '',
      is_active: evt.is_active,
    });
    // Scroll smoothly to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save Event (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('El título del evento es obligatorio.', 'error');
      return;
    }
    if (!formData.city.trim()) {
      showToast('La ciudad es obligatoria.', 'error');
      return;
    }
    if (!formData.start_date) {
      showToast('La fecha del evento es obligatoria.', 'error');
      return;
    }

    setFormSaving(true);

    try {
      if (isEditing && editingId) {
        // Update existing
        const res = await updateEvent(editingId, {
          title: formData.title.trim().toUpperCase(),
          city: formData.city.trim(),
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          time_text: formData.time_text.trim(),
          image_url: formData.image_url,
          is_special: formData.is_special,
          special_text: formData.is_special ? formData.special_text.trim().toUpperCase() : null,
          maps_url: formData.maps_url.trim() || null,
          is_active: formData.is_active,
        });

        if (res.success && res.event) {
          setEvents((prev) => prev.map((e) => (e.id === editingId ? res.event! : e)));
          showToast(`Evento "${res.event.title}" actualizado correctamente.`);
          resetForm();
        } else {
          showToast(res.error || 'Error al actualizar el evento.', 'error');
        }
      } else {
        // Create new
        const res = await createEvent({
          title: formData.title.trim().toUpperCase(),
          city: formData.city.trim(),
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          time_text: formData.time_text.trim() || '15:00 hs',
          image_url: formData.image_url,
          is_special: formData.is_special,
          special_text: formData.is_special ? formData.special_text.trim().toUpperCase() : null,
          maps_url: formData.maps_url.trim() || null,
          is_active: formData.is_active,
        });

        if (res.success && res.event) {
          setEvents((prev) => [res.event!, ...prev]);
          if (res.error) {
            showToast(res.error, 'error');
          } else {
            showToast(`Evento "${res.event.title}" publicado con éxito.`);
          }
          resetForm();
        } else {
          showToast(res.error || 'Error al crear el evento.', 'error');
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Error inesperado al guardar evento.', 'error');
    } finally {
      setFormSaving(false);
    }
  };

  // Toggle active status directly
  const handleToggleActive = async (evt: DiecastEvent) => {
    const newStatus = !evt.is_active;
    const res = await updateEvent(evt.id, { is_active: newStatus });
    if (res.success && res.event) {
      setEvents((prev) => prev.map((e) => (e.id === evt.id ? res.event! : e)));
      showToast(
        newStatus ? `"${evt.title}" ahora está VISIBLE en /eventos.` : `"${evt.title}" fue PAUSADO.`
      );
    } else {
      showToast('Error al cambiar el estado del evento.', 'error');
    }
  };

  // Toggle special status directly
  const handleToggleSpecial = async (evt: DiecastEvent) => {
    const newSpecial = !evt.is_special;
    const res = await updateEvent(evt.id, {
      is_special: newSpecial,
      special_text: newSpecial ? evt.special_text || 'ESPECIAL DÍA DE LA MADRE' : null,
    });
    if (res.success && res.event) {
      setEvents((prev) => prev.map((e) => (e.id === evt.id ? res.event! : e)));
      showToast(
        newSpecial ? `"${evt.title}" marcado como ESPECIAL.` : `"${evt.title}" marcado como normal.`
      );
    } else {
      showToast('Error al modificar evento especial.', 'error');
    }
  };

  // Delete event with confirmation
  const handleDeleteEvent = async (evt: DiecastEvent) => {
    if (!confirm(`¿Estás seguro de que querés eliminar el evento "${evt.title}"?`)) {
      return;
    }
    const res = await deleteEvent(evt.id);
    if (res.success) {
      setEvents((prev) => prev.filter((e) => e.id !== evt.id));
      showToast(`Evento "${evt.title}" eliminado.`);
      if (editingId === evt.id) {
        resetForm();
      }
    } else {
      showToast(res.error || 'Error al eliminar el evento.', 'error');
    }
  };

  // Filtered events list
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          e.title.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          (e.special_text && e.special_text.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (statusFilter === 'active') return e.is_active;
      if (statusFilter === 'inactive') return !e.is_active;
      if (statusFilter === 'special') return e.is_special;
      return true;
    });
  }, [events, searchTerm, statusFilter]);

  // Live preview dummy object
  const previewEvent: DiecastEvent = {
    id: 'preview-evt',
    title: formData.title.trim().toUpperCase() || 'PLAZA SAN CAYETANO',
    city: formData.city.trim() || 'Junín',
    start_date: formData.start_date || '2026-10-04',
    end_date: formData.end_date || null,
    time_text: formData.time_text.trim() || '15:00 hs',
    image_url: formData.image_url,
    is_special: formData.is_special,
    special_text: formData.special_text.trim().toUpperCase() || 'ESPECIAL DÍA DE LA MADRE',
    maps_url: formData.maps_url.trim() || null,
    is_active: formData.is_active,
  };

  // ==============================================================================
  // VIEW: LOGIN SCREEN (IF NOT AUTHENTICATED)
  // ==============================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-20 relative">
        <div className="w-full max-w-md bg-surface-container-low border border-surface-container p-6 sm:p-8 shadow-2xl relative">
          <div className="flex flex-col items-center gap-3 text-center mb-6">
            <div className="relative h-12 w-44">
              <Image
                src="/images/logos/logo-swoosh-transparent.webp"
                alt="Wheels Zone Logo"
                fill
                sizes="176px"
                className="object-contain"
                priority
              />
            </div>
            <span className="font-display-hero text-xl uppercase tracking-wider text-white font-extrabold mt-1">
              ADMINISTRACIÓN DE EVENTOS
            </span>
            <span className="text-xs text-neutral-400 font-label-telemetry uppercase">
              GESTIÓN DE LA AGENDA Y FERIAS DIECAST
            </span>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-label-telemetry uppercase text-outline mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                className="w-full bg-surface-container border border-surface-container-highest px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>

            <div>
              <label className="block text-xs font-label-telemetry uppercase text-outline mb-1">
                Contraseña de Seguridad
              </label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-surface-container border border-surface-container-highest px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>

            {authError && (
              <div className="p-2.5 bg-error-container/30 border border-error text-error text-xs font-label-telemetry flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-primary-container hover:bg-surface-tint text-on-primary-container font-headline-md uppercase text-sm tracking-wider flex items-center justify-center gap-2 font-bold transition-all shadow-md mt-2 disabled:opacity-60"
            >
              {authLoading ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                  <span>VERIFICANDO SESIÓN...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">login</span>
                  <span>INGRESAR A EVENTOS</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthEmail('admin@wheelszone.com');
                setAuthPassword('admin123');
                setIsAuthenticated(true);
                localStorage.setItem('wheelszone_admin_session', 'true');
              }}
              className="w-full py-2 bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface text-xs font-label-telemetry uppercase tracking-wider border border-surface-container transition-colors"
            >
              ⚡ Acceso Rápido Modo Demostración
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-surface-container text-center">
            <Link
              href="/eventos"
              className="text-xs text-neutral-400 hover:text-white flex items-center justify-center gap-1 font-label-telemetry uppercase"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Volver a la vista pública de Eventos</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // VIEW: AUTHENTICATED ADMIN EVENTOS DASHBOARD
  // ==============================================================================
  return (
    <div className="flex flex-col w-full px-3 sm:px-6 md:px-8 mx-auto max-w-7xl pb-24 pt-4 sm:pt-6 overflow-x-hidden text-on-surface">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold border transition-all ${
            toastType === 'success'
              ? 'bg-[#18181b] border-emerald-500/80 text-emerald-400 shadow-[0_4px_24px_rgba(16,185,129,0.3)]'
              : 'bg-[#18181b] border-race-red text-red-400 shadow-[0_4px_24px_rgba(229,25,55,0.3)]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toastType === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar: Nav between Admin and Public */}
      <div className="bg-[#141416] border border-neutral-800 p-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs font-label-telemetry rounded-xl">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/admin"
            className="px-3 py-1 bg-surface-container hover:bg-surface-container-high text-white font-bold flex items-center gap-1 border border-neutral-700 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Panel Admin Principal</span>
          </Link>

          <span className="text-neutral-600 hidden sm:inline">|</span>

          <Link
            href="/eventos"
            target="_blank"
            className="px-3 py-1 bg-primary-container/10 hover:bg-primary-container/20 text-[#FFC200] font-bold flex items-center gap-1 border border-primary-container/30 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            <span>Ver Vista Pública (/eventos)</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] truncate">{authEmail}</span>
          </div>

          <button
            onClick={handleLogout}
            className="px-2.5 py-1 bg-surface-container hover:bg-neutral-800 text-race-red border border-neutral-700 uppercase font-bold flex items-center gap-1 text-[11px] rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-xs">logout</span>
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Supabase Missing Table Alert Banner */}
      {tableMissing && (
        <div className="bg-gradient-to-r from-red-950/70 via-neutral-900 to-amber-950/70 border border-amber-600/70 p-4 sm:p-5 rounded-2xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_4px_24px_rgba(229,25,55,0.2)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-2xl text-[#FFC200]">database</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-display-hero text-base uppercase font-black tracking-wide">
                  PASO REQUERIDO: CREAR TABLA &apos;EVENTS&apos; EN SUPABASE
                </span>
                <span className="bg-race-red text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                  Acción requerida
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
                La tabla de base de datos y el bucket de imágenes aún no fueron creados en tu proyecto de Supabase. Por eso el sistema arroja el error <code className="text-[#FFC200] font-mono text-[11px] bg-black/40 px-1 py-0.5 rounded">Could not find table public.events</code>. Ejecutá la migración en el editor SQL para activarlo en 30 segundos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
            <a
              href="https://supabase.com/dashboard/project/olkumxhhhcviuuhevaag/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial px-4 py-2.5 bg-[#FFC200] hover:bg-[#e6af00] text-black font-display-hero uppercase font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 select-none"
            >
              <span>Abrir SQL Editor</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-display-hero uppercase font-bold text-xs sm:text-sm rounded-xl border border-neutral-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">code</span>
              <span>Ver y Copiar SQL</span>
            </button>
          </div>
        </div>
      )}

      {/* SQL Migration Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#141416] border border-neutral-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#18181c]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FFC200] text-xl">terminal</span>
                <span className="font-display-hero text-lg uppercase font-bold text-white">
                  Script SQL de Migración (Supabase)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex flex-col gap-3">
              <p className="text-xs text-neutral-300">
                1. Copiá el siguiente código.<br />
                2. Abrí el <a href="https://supabase.com/dashboard/project/olkumxhhhcviuuhevaag/sql/new" target="_blank" rel="noopener noreferrer" className="text-[#FFC200] underline font-bold">SQL Editor de tu Supabase</a>.<br />
                3. Pegalo y presioná <strong className="text-white">Run</strong> (o Ctrl + Enter).
              </p>

              <pre className="p-3 bg-[#0a0a0c] border border-neutral-800 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto select-all max-h-80">
{`-- 1. Crear tabla de eventos
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    time_text VARCHAR(50) NOT NULL DEFAULT '15:00 hs',
    image_url TEXT NOT NULL,
    is_special BOOLEAN NOT NULL DEFAULT FALSE,
    special_text VARCHAR(80) NULL,
    maps_url TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (start_date ASC);
CREATE INDEX IF NOT EXISTS idx_events_active ON public.events (is_active);

-- 3. Habilitar RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
DROP POLICY IF EXISTS "Lectura pública de eventos" ON public.events;
CREATE POLICY "Lectura pública de eventos" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Operaciones autenticadas para administradores" ON public.events;
DROP POLICY IF EXISTS "Operaciones completas para eventos" ON public.events;
CREATE POLICY "Operaciones completas para eventos" ON public.events FOR ALL USING (true) WITH CHECK (true);

-- 5. Bucket de Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('events', 'events', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 6. Políticas del bucket en storage.objects
DROP POLICY IF EXISTS "Lectura pública de eventos" ON storage.objects;
DROP POLICY IF EXISTS "Lectura pública bucket events" ON storage.objects;
CREATE POLICY "Lectura pública bucket events" ON storage.objects FOR SELECT USING (bucket_id = 'events');

DROP POLICY IF EXISTS "Subida para bucket events" ON storage.objects;
CREATE POLICY "Subida para bucket events" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'events');

DROP POLICY IF EXISTS "Actualización para bucket events" ON storage.objects;
CREATE POLICY "Actualización para bucket events" ON storage.objects FOR UPDATE USING (bucket_id = 'events');

DROP POLICY IF EXISTS "Eliminación para bucket events" ON storage.objects;
CREATE POLICY "Eliminación para bucket events" ON storage.objects FOR DELETE USING (bucket_id = 'events');`}
              </pre>
            </div>

            <div className="p-4 border-t border-neutral-800 bg-[#18181c] flex items-center justify-between gap-3">
              <span className="text-xs text-neutral-400">
                Archivo disponible en: <code className="text-[#FFC200]">supabase_events_migration.sql</code>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const code = `-- 1. Crear tabla de eventos
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    time_text VARCHAR(50) NOT NULL DEFAULT '15:00 hs',
    image_url TEXT NOT NULL,
    is_special BOOLEAN NOT NULL DEFAULT FALSE,
    special_text VARCHAR(80) NULL,
    maps_url TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (start_date ASC);
CREATE INDEX IF NOT EXISTS idx_events_active ON public.events (is_active);

-- 3. Habilitar RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
DROP POLICY IF EXISTS "Lectura pública de eventos" ON public.events;
CREATE POLICY "Lectura pública de eventos" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Operaciones autenticadas para administradores" ON public.events;
DROP POLICY IF EXISTS "Operaciones completas para eventos" ON public.events;
CREATE POLICY "Operaciones completas para eventos" ON public.events FOR ALL USING (true) WITH CHECK (true);

-- 5. Bucket de Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('events', 'events', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 6. Políticas del bucket en storage.objects
DROP POLICY IF EXISTS "Lectura pública de eventos" ON storage.objects;
DROP POLICY IF EXISTS "Lectura pública bucket events" ON storage.objects;
CREATE POLICY "Lectura pública bucket events" ON storage.objects FOR SELECT USING (bucket_id = 'events');

DROP POLICY IF EXISTS "Subida para bucket events" ON storage.objects;
CREATE POLICY "Subida para bucket events" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'events');

DROP POLICY IF EXISTS "Actualización para bucket events" ON storage.objects;
CREATE POLICY "Actualización para bucket events" ON storage.objects FOR UPDATE USING (bucket_id = 'events');

DROP POLICY IF EXISTS "Eliminación para bucket events" ON storage.objects;
CREATE POLICY "Eliminación para bucket events" ON storage.objects FOR DELETE USING (bucket_id = 'events');`;
                    navigator.clipboard.writeText(code);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 3000);
                  }}
                  className="px-4 py-2 bg-[#FFC200] hover:bg-[#e6af00] text-black font-display-hero uppercase font-black text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedSql ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedSql ? '¡Copiado al Portapapeles!' : 'Copiar Código SQL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-xl"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-[#161618] border border-neutral-800 rounded-xl p-3 sm:p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-label-telemetry uppercase">
            <span>Total Ferias</span>
            <span className="material-symbols-outlined text-primary-container text-lg">calendar_month</span>
          </div>
          <div className="font-display-hero text-2xl sm:text-3xl text-white font-black leading-none">
            {events.length}
          </div>
          <span className="text-[11px] text-neutral-400 font-label-telemetry uppercase">
            En la base de datos
          </span>
        </div>

        <div className="bg-[#161618] border border-neutral-800 rounded-xl p-3 sm:p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-label-telemetry uppercase">
            <span>Activos en Web</span>
            <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
          </div>
          <div className="font-display-hero text-2xl sm:text-3xl text-emerald-400 font-black leading-none">
            {events.filter((e) => e.is_active).length}
          </div>
          <span className="text-[11px] text-neutral-400 font-label-telemetry uppercase">
            Visibles al público
          </span>
        </div>

        <div className="bg-[#161618] border border-neutral-800 rounded-xl p-3 sm:p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-label-telemetry uppercase">
            <span>Eventos Especiales</span>
            <span className="material-symbols-outlined text-race-red text-lg">stars</span>
          </div>
          <div className="font-display-hero text-2xl sm:text-3xl text-[#FFC200] font-black leading-none">
            {events.filter((e) => e.is_special).length}
          </div>
          <span className="text-[11px] text-neutral-400 font-label-telemetry uppercase">
            Con badge destacado
          </span>
        </div>

        <div className="bg-[#161618] border border-neutral-800 rounded-xl p-3 sm:p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-label-telemetry uppercase">
            <span>Storage Bucket</span>
            <span className="material-symbols-outlined text-primary-container text-lg">cloud_upload</span>
          </div>
          <div className="font-display-hero text-xl sm:text-2xl text-white font-bold leading-none truncate">
            events
          </div>
          <span className="text-[11px] text-neutral-400 font-label-telemetry uppercase">
            {isSupabaseConfigured ? 'Supabase Conectado' : 'Almacén Local'}
          </span>
        </div>
      </div>

      {/* Main Grid: Form (Col Left) + Live Preview & Events List (Col Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* ========================================================================
            FORM SECTION (5 cols)
        ======================================================================== */}
        <div className="lg:col-span-5 bg-[#141416] border border-neutral-800 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <span className="font-display-hero uppercase text-base sm:text-lg text-primary-container font-black flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xl">
                {isEditing ? 'edit_calendar' : 'add_circle'}
              </span>
              {isEditing ? 'EDITAR EVENTO' : 'CARGAR NUEVO EVENTO'}
            </span>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-neutral-400 hover:text-white font-label-telemetry uppercase"
              >
                Cancelar Edición
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitForm} className="flex flex-col gap-3.5">
            {/* Title / Venue Name */}
            <div>
              <label className="block text-xs font-label-telemetry uppercase text-neutral-400 mb-1">
                Título o Lugar del Evento <span className="text-race-red">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: PLAZA SAN CAYETANO"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full bg-[#1c1c20] border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-primary-container uppercase font-bold"
              />
            </div>

            {/* City & Time Text Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-label-telemetry uppercase text-neutral-400 mb-1">
                  Ciudad o Localidad <span className="text-race-red">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Junín, San Jerónimo"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="w-full bg-[#1c1c20] border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-primary-container font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-label-telemetry uppercase text-neutral-400 mb-1">
                  Horario <span className="text-race-red">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: 15:00 hs o 14 a 19 hs"
                  value={formData.time_text}
                  onChange={(e) => setFormData({ ...formData, time_text: e.target.value })}
                  required
                  className="w-full bg-[#1c1c20] border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-primary-container font-medium"
                />
              </div>
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-label-telemetry uppercase text-neutral-400 mb-1">
                  Fecha de Inicio <span className="text-race-red">*</span>
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="w-full bg-[#1c1c20] border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-container font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-label-telemetry uppercase text-neutral-400 mb-1">
                  Fecha de Fin <span className="text-neutral-500">(Opcional)</span>
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full bg-[#1c1c20] border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-container font-medium"
                />
              </div>
            </div>

            {/* Image Upload for Events Bucket */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-label-telemetry uppercase text-neutral-400">
                  Foto del Evento / Stand
                </label>
                <span className="text-[10px] text-[#FFC200] font-label-telemetry uppercase">
                  Bucket: events
                </span>
              </div>

              <div className="relative border-2 border-dashed border-neutral-700 hover:border-primary-container bg-[#1c1c20] p-3 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer group transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {uploadingImage ? (
                  <div className="flex items-center gap-2 py-3 text-primary-container font-bold text-xs uppercase">
                    <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                    <span>Subiendo y optimizando a WebP...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-2">
                    <span className="material-symbols-outlined text-2xl text-neutral-400 group-hover:text-primary-container">
                      add_a_photo
                    </span>
                    <span className="text-xs text-neutral-300 font-semibold">
                      Arrastrá o seleccioná una foto
                    </span>
                  </div>
                )}
              </div>

              {/* Direct Image URL input */}
              <input
                type="url"
                placeholder="O pegá la URL directa de la imagen..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full bg-[#1c1c20] border border-neutral-700/80 rounded-xl px-3 py-1.5 text-xs text-neutral-300 placeholder:text-neutral-500 focus:outline-none focus:border-primary-container mt-1.5 font-mono"
              />
            </div>

            {/* Google Maps URL */}
            <div>
              <label className="block text-xs font-label-telemetry uppercase text-neutral-400 mb-1">
                Enlace de Google Maps <span className="text-neutral-500">(Opcional)</span>
              </label>
              <input
                type="url"
                placeholder="https://maps.google.com/?q=..."
                value={formData.maps_url}
                onChange={(e) => setFormData({ ...formData, maps_url: e.target.value })}
                className="w-full bg-[#1c1c20] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-primary-container font-mono"
              />
            </div>

            {/* Special Event Checkbox & Text */}
            <div className="p-3 bg-[#18181c] border border-neutral-800 rounded-xl flex flex-col gap-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.is_special}
                  onChange={(e) => setFormData({ ...formData, is_special: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-600 text-race-red focus:ring-race-red cursor-pointer"
                />
                <span className="text-xs font-display-hero uppercase tracking-wider text-white font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#FFC200]">stars</span>
                  ¿Es un Evento Especial o Encuentro Exclusivo?
                </span>
              </label>

              {formData.is_special && (
                <div>
                  <label className="block text-[11px] font-label-telemetry uppercase text-neutral-400 mb-1">
                    Texto del Badge Especial
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: ESPECIAL DÍA DE LA MADRE o ENCUENTRO EXCLUSIVO"
                    value={formData.special_text}
                    onChange={(e) => setFormData({ ...formData, special_text: e.target.value })}
                    className="w-full bg-[#202024] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-bold focus:outline-none focus:border-primary-container"
                  />
                  <div className="flex gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, special_text: 'ESPECIAL DÍA DE LA MADRE' })}
                      className="px-2 py-0.5 bg-red-950/60 hover:bg-red-900 text-red-300 text-[10px] rounded border border-red-800 font-bold"
                    >
                      🎁 Día de la Madre
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, special_text: 'ENCUENTRO EXCLUSIVO' })}
                      className="px-2 py-0.5 bg-amber-950/60 hover:bg-amber-900 text-amber-300 text-[10px] rounded border border-amber-800 font-bold"
                    >
                      ⚡ Encuentro Exclusivo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Is Active Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-[#18181c] border border-neutral-800 rounded-xl">
              <span className="text-xs font-label-telemetry uppercase text-neutral-300 font-bold">
                Estado: Publicar inmediatamente
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={formSaving}
                className="flex-1 py-3 bg-[#FFC200] hover:bg-[#e6af00] text-black font-display-hero uppercase text-sm font-black tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {formSaving ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                    <span>GUARDANDO...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">
                      {isEditing ? 'save' : 'publish'}
                    </span>
                    <span>{isEditing ? 'ACTUALIZAR EVENTO' : 'PUBLICAR EVENTO'}</span>
                  </>
                )}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-display-hero uppercase text-sm font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* Real-Time Live Preview */}
          <div className="mt-4 pt-4 border-t border-neutral-800 flex flex-col gap-2">
            <span className="text-xs font-label-telemetry uppercase text-[#FFC200] font-black flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">preview</span>
              VISTA PREVIA EN VIVO (CÓMO SE VE EN /EVENTOS)
            </span>
            <div className="p-2 bg-[#0B0B0B] rounded-xl border border-neutral-800/80">
              <EventCard event={previewEvent} />
            </div>
          </div>
        </div>

        {/* ========================================================================
            LIST OF EVENTS (7 cols)
        ======================================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Search & Filter Bar */}
          <div className="bg-[#141416] border border-neutral-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined text-neutral-400 absolute left-3 top-2.5 text-base pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar por plaza o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1c1c20] border border-neutral-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-400 focus:outline-none focus:border-primary-container"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-label-telemetry uppercase font-bold whitespace-nowrap transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-neutral-700 text-white'
                    : 'text-neutral-400 hover:text-white bg-neutral-900'
                }`}
              >
                Todos ({events.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-lg text-xs font-label-telemetry uppercase font-bold whitespace-nowrap transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-emerald-600 text-white'
                    : 'text-neutral-400 hover:text-white bg-neutral-900'
                }`}
              >
                Activos ({events.filter((e) => e.is_active).length})
              </button>
              <button
                onClick={() => setStatusFilter('special')}
                className={`px-2.5 py-1 rounded-lg text-xs font-label-telemetry uppercase font-bold whitespace-nowrap transition-colors ${
                  statusFilter === 'special'
                    ? 'bg-race-red text-white'
                    : 'text-neutral-400 hover:text-white bg-neutral-900'
                }`}
              >
                Especiales ({events.filter((e) => e.is_special).length})
              </button>
            </div>
          </div>

          {/* Events List */}
          {loadingData ? (
            <div className="py-16 text-center text-neutral-400 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-3xl animate-spin text-[#FFC200]">
                refresh
              </span>
              <span className="text-xs uppercase font-label-telemetry">Cargando eventos...</span>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`bg-[#141416] border rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                    evt.is_active
                      ? 'border-neutral-800 hover:border-neutral-700'
                      : 'border-neutral-800/40 opacity-60'
                  }`}
                >
                  {/* Event Summary */}
                  <div className="flex-1 w-full sm:w-auto">
                    <EventCard event={evt} />
                  </div>

                  {/* Actions Column */}
                  <div className="flex sm:flex-col items-center justify-end gap-1.5 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                    {/* Toggle Active Status */}
                    <button
                      onClick={() => handleToggleActive(evt)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-display-hero font-bold uppercase tracking-wider flex items-center gap-1 transition-colors w-full justify-center ${
                        evt.is_active
                          ? 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border border-neutral-700'
                      }`}
                      title={evt.is_active ? 'Click para pausar evento' : 'Click para activar evento'}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {evt.is_active ? 'visibility' : 'visibility_off'}
                      </span>
                      <span>{evt.is_active ? 'Activo' : 'Pausado'}</span>
                    </button>

                    {/* Toggle Special Status */}
                    <button
                      onClick={() => handleToggleSpecial(evt)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-display-hero font-bold uppercase tracking-wider flex items-center gap-1 transition-colors w-full justify-center ${
                        evt.is_special
                          ? 'bg-amber-950/70 hover:bg-amber-900 text-[#FFC200] border border-amber-800/60'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border border-neutral-700'
                      }`}
                      title="Alternar evento especial"
                    >
                      <span className="material-symbols-outlined text-xs">stars</span>
                      <span>{evt.is_special ? 'Especial' : 'Normal'}</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleEditClick(evt)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-display-hero font-bold uppercase tracking-wider bg-surface-container hover:bg-surface-container-high text-white border border-neutral-700 flex items-center gap-1 transition-colors w-full justify-center"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span>
                      <span>Editar</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteEvent(evt)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-display-hero font-bold uppercase tracking-wider bg-red-950/50 hover:bg-red-900 text-race-red border border-red-900/60 flex items-center gap-1 transition-colors w-full justify-center"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                      <span>Borrar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#141416] border border-neutral-800 rounded-2xl p-8 text-center flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-3xl text-neutral-500">
                search_off
              </span>
              <span className="text-sm uppercase font-bold text-neutral-300">
                No se encontraron eventos con los filtros aplicados
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

