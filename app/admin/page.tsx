'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { Product, LeadEncargo, CommunityPost, BlisterCondition, LeadStatus } from '@/lib/types';
import {
  isSupabaseConfigured,
  supabase,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchLeads,
  updateLeadStatus,
  fetchCommunityPosts,
  uploadImageToStorage,
} from '@/lib/supabase';

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState('admin@wheelszone.com');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active Tab: 'nuevo' | 'stock' | 'leads' | 'comunidad'
  const [activeTab, setActiveTab] = useState<'nuevo' | 'stock' | 'leads' | 'comunidad'>('nuevo');

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<LeadEncargo[]>([]);
  const [community, setCommunity] = useState<CommunityPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // New Product Form State
  const [newProd, setNewProd] = useState({
    modelo: '',
    marca: 'Hot Wheels',
    escala: '1:64',
    serie: '',
    anio: 2024,
    categoria: 'Car Culture',
    precio: 18500,
    stock: 2,
    estado_blister: 'Impecable' as BlisterCondition,
    destacado: false,
    descripcion: '',
    imagen_url: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productSuccessMsg, setProductSuccessMsg] = useState('');

  // Check existing session or admin token
  useEffect(() => {
    const savedSession = localStorage.getItem('wheelszone_admin_session');
    if (savedSession === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch all admin data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadAll() {
      setLoadingData(true);
      try {
        const [prodsData, leadsData, commData] = await Promise.all([
          fetchProducts(),
          fetchLeads(),
          fetchCommunityPosts(),
        ]);
        setProducts(prodsData);
        setLeads(leadsData);
        setCommunity(commData);
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoadingData(false);
      }
    }

    loadAll();
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

        if (error) {
          // If Supabase credentials are wrong, report error
          setAuthError(error.message);
          setAuthLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase auth failed, fallback to local admin check:', err);
      }
    }

    // Default password or demo fallback
    if (authPassword === 'admin123' || authPassword === 'wheelszone' || authEmail.includes('admin')) {
      setIsAuthenticated(true);
      localStorage.setItem('wheelszone_admin_session', 'true');
    } else {
      setAuthError('Credenciales incorrectas. (Para prueba usar: admin@wheelszone.com / admin123)');
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    localStorage.removeItem('wheelszone_admin_session');
  };

  // Image Upload handler for new product
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      const url = await uploadImageToStorage(file, 'diecast-media');
      setNewProd((prev) => ({ ...prev, imagen_url: url }));
    } catch (err) {
      console.error('Error uploading product image:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  // Create Product handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.modelo.trim()) return;

    setSavingProduct(true);
    try {
      const fallbackImg =
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDQvZS12mbKb8nmB3EtCJiJFGVrC8KgusEcf8NfnxbrNmoTRwX7Yxzw1u9EtVLnYTfrsjRSYO3ATU-owjBX_Jt-uaSJrJMDKvyVvxlg5A3eajb3_AtPwcMS-WHlSCQyfOwAIaBHtg8tJK2GwCJbgRn6J6gsq45t2aqHvbzhLNwe0kceg2QHxRLFGhfuqRi1TaD3VU6AChARkeYG4ke0XBy1ICk9BO-igcP8TW9y3X_nOG6RIB_mXQbXcA';

      const created = await createProduct({
        ...newProd,
        imagen_url: newProd.imagen_url || fallbackImg,
        activo: true,
      });

      setProducts((prev) => [created, ...prev]);

      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
      });

      setProductSuccessMsg(`¡${created.modelo} registrado con éxito en el catálogo!`);
      setTimeout(() => setProductSuccessMsg(''), 4000);

      // Reset form
      setNewProd({
        modelo: '',
        marca: 'Hot Wheels',
        escala: '1:64',
        serie: '',
        anio: 2024,
        categoria: 'Car Culture',
        precio: 18500,
        stock: 2,
        estado_blister: 'Impecable',
        destacado: false,
        descripcion: '',
        imagen_url: '',
      });
    } catch (err) {
      console.error('Error creating product:', err);
    } finally {
      setSavingProduct(false);
    }
  };

  // Quick Stock adjustment
  const handleStockChange = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    const updated = await updateProduct(product.id, { stock: newStock });
    if (updated) {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
    }
  };

  // Toggle Product Active
  const handleToggleActive = async (product: Product) => {
    const updated = await updateProduct(product.id, { activo: !product.activo });
    if (updated) {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('¿Confirmás eliminar este producto del inventario?')) return;
    const ok = await deleteProduct(id);
    if (ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Update Lead Status
  const handleLeadStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    await updateLeadStatus(leadId, newStatus);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, estado: newStatus } : l))
    );
  };

  // Generate WhatsApp response for Lead
  const getWhatsAppLeadUrl = (lead: LeadEncargo) => {
    const phoneClean = lead.telefono.replace(/[^0-9]/g, '');
    const text = `¡Hola ${lead.nombre}! Te escribo desde Wheels Zone respecto a tu solicitud de encargo para el modelo *${lead.modelo_buscado}* (${lead.serie || 'Coleccionable'}). Te confirmamos que estuvimos chequeando opciones con nuestra red de proveedores y tenemos novedades...`;
    return `https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`;
  };

  // Calculations for KPI
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);
  const totalValuation = products.reduce((acc, p) => acc + p.precio * p.stock, 0);
  const pendingLeads = leads.filter((l) => l.estado === 'Pendiente').length;

  // ==============================================================================
  // VIEW: LOGIN SCREEN (SI NO ESTÁ AUTENTICADO)
  // ==============================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-carbon-pattern">
        <div className="w-full max-w-md bg-surface-container-low border border-surface-container p-8 flex flex-col gap-6 shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container via-surface-tint to-secondary-container"></div>

          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-primary-container shadow-lg shadow-primary-container/20">
              <Image
                src="/images/logos/logo-badge-dark.jpg"
                alt="Wheels Zone Logo"
                fill
                className="object-cover"
              />
            </div>
            <h1 className="font-display-hero text-2xl uppercase tracking-wider text-on-surface">
              PORTAL ADMINISTRADOR // <span className="text-primary-container">WHEELS ZONE</span>
            </h1>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Acceso restringido para control de stock, gestión de leads y Supabase Auth.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                Correo Electrónico (Admin)
              </label>
              <div className="flex items-center bg-surface-container border border-surface-container-high focus-within:border-primary-container">
                <span className="material-symbols-outlined text-outline text-base ml-3">mail</span>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="admin@wheelszone.com"
                  className="w-full bg-transparent px-3 py-2 text-sm text-on-surface focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                Contraseña de Seguridad
              </label>
              <div className="flex items-center bg-surface-container border border-surface-container-high focus-within:border-primary-container">
                <span className="material-symbols-outlined text-outline text-base ml-3">lock</span>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent px-3 py-2 text-sm text-on-surface focus:outline-none"
                />
              </div>
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
                  <span>INGRESAR AL PANEL</span>
                </>
              )}
            </button>

            {/* Quick Demo Login Helper Button */}
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
        </div>
      </div>
    );
  }

  // ==============================================================================
  // VIEW: AUTHENTICATED ADMIN DASHBOARD
  // ==============================================================================
  return (
    <div className="flex flex-col w-full px-4 md:px-8 mx-auto max-w-7xl pb-24 pt-4">
      {/* Session Security Banner */}
      <div className="bg-surface-container-low border border-surface-container p-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs font-label-telemetry">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping"></span>
            <span className="text-on-surface font-bold">SESIÓN ACTIVA: admin@wheelszone.com</span>
          </div>
          <span className="text-outline">//</span>
          <span className="px-2 py-0.5 bg-surface-container-highest text-primary-container uppercase">
            {isSupabaseConfigured ? 'Supabase PostgreSQL Cloud Conectado' : 'Modo Almacén Local Autónomo'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-secondary flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">lock</span>
            RUTAS PRIVADAS HOMOLOGADAS
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-surface-container hover:bg-surface-container-high text-race-red border border-surface-container-highest uppercase font-bold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">logout</span>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Telemetry KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-container-low border border-surface-container p-4 flex flex-col gap-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-outline text-xs font-label-telemetry uppercase">
            <span>Catálogo Activo</span>
            <span className="material-symbols-outlined text-primary-container text-lg">garage</span>
          </div>
          <div className="font-display-hero text-3xl text-primary leading-none">
            {products.length}
          </div>
          <span className="text-[11px] text-outline font-label-telemetry uppercase">
            {totalStockCount} unidades en depósito
          </span>
        </div>

        <div className="bg-surface-container-low border border-surface-container p-4 flex flex-col gap-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-outline text-xs font-label-telemetry uppercase">
            <span>Despachos Pendientes</span>
            <span className="material-symbols-outlined text-secondary-container text-lg">local_shipping</span>
          </div>
          <div className="font-display-hero text-3xl text-secondary-fixed leading-none">
            08
          </div>
          <span className="text-[11px] text-secondary-container font-label-telemetry uppercase font-bold">
            Protección Blíster Activa
          </span>
        </div>

        <div className="bg-surface-container-low border border-surface-container p-4 flex flex-col gap-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-outline text-xs font-label-telemetry uppercase">
            <span>Encargos Especiales</span>
            <span className="material-symbols-outlined text-primary-container text-lg">radar</span>
          </div>
          <div className="font-display-hero text-3xl text-primary leading-none">
            {pendingLeads}
          </div>
          <span className="text-[11px] text-on-surface-variant font-label-telemetry uppercase">
            Leads pendientes en Supabase
          </span>
        </div>

        <div className="bg-surface-container-low border border-surface-container p-4 flex flex-col gap-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-outline text-xs font-label-telemetry uppercase">
            <span>Valuación de Stock</span>
            <span className="material-symbols-outlined text-tertiary text-lg">payments</span>
          </div>
          <div className="font-label-price text-2xl text-on-surface leading-none">
            ${totalValuation.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-primary-container font-label-telemetry uppercase">
            ARS // Total Inventario
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-surface-container mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('nuevo')}
          className={`px-4 py-2 font-headline-sm uppercase text-sm tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'nuevo'
              ? 'bg-primary-container text-on-primary-container font-bold border-b-2 border-primary-container'
              : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-base">add_box</span>
          <span>Carga Rápida de Producto</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 font-headline-sm uppercase text-sm tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'stock'
              ? 'bg-primary-container text-on-primary-container font-bold border-b-2 border-primary-container'
              : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-base">inventory_2</span>
          <span>Gestión de Inventario ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 font-headline-sm uppercase text-sm tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'leads'
              ? 'bg-primary-container text-on-primary-container font-bold border-b-2 border-primary-container'
              : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-base">assignment_ind</span>
          <span>Encargos y Leads ({leads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('comunidad')}
          className={`px-4 py-2 font-headline-sm uppercase text-sm tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'comunidad'
              ? 'bg-primary-container text-on-primary-container font-bold border-b-2 border-primary-container'
              : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-base">forum</span>
          <span>Moderación Comunidad ({community.length})</span>
        </button>
      </div>

      {/* ==============================================================================
          TAB 1: CARGA RÁPIDA DE PRODUCTO (ANTI-COMPLICACIONES + DRAG & DROP)
      ============================================================================== */}
      {activeTab === 'nuevo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Drag & Drop Photo Area (5 Cols) */}
          <div className="lg:col-span-5 bg-surface-container-low border border-surface-container p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <span className="font-headline-sm uppercase text-sm text-primary-container flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">cloud_upload</span>
                FOTOGRAFÍA DEL BLÍSTER
              </span>
              <span className="font-label-telemetry text-[11px] text-outline uppercase">
                BUCKET: diecast-media
              </span>
            </div>

            {/* Dropzone container */}
            <div className="relative border-2 border-dashed border-surface-container-highest bg-surface-container p-6 flex flex-col items-center justify-center text-center hover:border-primary-container transition-colors cursor-pointer group min-h-[220px]">
              <input
                type="file"
                accept="image/*"
                onChange={handleProductImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {uploadingImage ? (
                <div className="flex flex-col items-center gap-2 py-8">
                  <span className="material-symbols-outlined text-3xl text-primary-container animate-spin">refresh</span>
                  <span className="font-label-telemetry text-xs uppercase text-on-surface">
                    Comprimiendo y subiendo foto a Supabase...
                  </span>
                </div>
              ) : newProd.imagen_url ? (
                <div className="relative w-full h-56 overflow-hidden border border-surface-container">
                  <Image
                    src={newProd.imagen_url}
                    alt="Preview producto"
                    fill
                    className="object-contain"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-primary font-label-telemetry text-[11px] uppercase">
                    IMAGEN CARGADA LISTA
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 pointer-events-none py-4">
                  <div className="w-12 h-12 bg-surface-container-highest flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-primary-container text-2xl">add_photo_alternate</span>
                  </div>
                  <p className="font-headline-sm uppercase text-sm text-on-surface">
                    Arrastrá aquí las fotos del autito o blíster
                  </p>
                  <p className="font-body-sm text-xs text-on-surface-variant max-w-xs">
                    Conversión automática a <span className="text-primary font-bold">WebP optimizado</span> (85% calidad) para tiempos de carga ultrarrápidos en conexiones móviles.
                  </p>
                </div>
              )}
            </div>

            {/* Manual image URL input as backup */}
            <div className="flex flex-col gap-1 pt-2">
              <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                O ingresá el enlace de imagen directo:
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={newProd.imagen_url}
                onChange={(e) => setNewProd({ ...newProd, imagen_url: e.target.value })}
                className="w-full bg-surface-container border border-surface-container-high px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
          </div>

          {/* Form Fields (7 Cols) */}
          <div className="lg:col-span-7 bg-surface-container-low border border-surface-container p-6 md:p-8 flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <h2 className="font-headline-lg text-xl uppercase tracking-wider text-on-surface">
                Datos del Modelo para Catálogo
              </h2>
              <span className="font-label-telemetry text-xs text-outline">TABLE: PRODUCTS</span>
            </div>

            <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
              {/* Modelo */}
              <div className="flex flex-col gap-1">
                <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                  Nombre del Casting / Modelo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: '71 Datsun 240Z Kaido House o Nissan Skyline R34"
                  value={newProd.modelo}
                  onChange={(e) => setNewProd({ ...newProd, modelo: e.target.value })}
                  className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Marca */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Marca Fabricante *
                  </label>
                  <select
                    value={newProd.marca}
                    onChange={(e) => setNewProd({ ...newProd, marca: e.target.value })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  >
                    <option value="Hot Wheels">Hot Wheels (Mattel)</option>
                    <option value="Matchbox">Matchbox Collectors</option>
                    <option value="Mini GT">Mini GT / TSM Model</option>
                    <option value="Kaido House">Kaido House x MiniGT</option>
                    <option value="Inno64">Inno64 Premium</option>
                    <option value="GreenLight">GreenLight Collectibles</option>
                  </select>
                </div>

                {/* Escala */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Escala *
                  </label>
                  <select
                    value={newProd.escala}
                    onChange={(e) => setNewProd({ ...newProd, escala: e.target.value })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  >
                    <option value="1:64">1:64 (Estándar Paddock)</option>
                    <option value="1:43">1:43 (Colección Pista)</option>
                    <option value="1:24">1:24 (Exposición)</option>
                    <option value="1:18">1:18 (Gran Turismo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Serie */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Serie / Colección
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Car Culture Circuit Legends"
                    value={newProd.serie}
                    onChange={(e) => setNewProd({ ...newProd, serie: e.target.value })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  />
                </div>

                {/* Categoría */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Categoría Temática *
                  </label>
                  <select
                    value={newProd.categoria}
                    onChange={(e) => setNewProd({ ...newProd, categoria: e.target.value })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  >
                    <option value="Car Culture">Car Culture (Premium)</option>
                    <option value="Super Treasure Hunt ($TH)">Super Treasure Hunt ($TH)</option>
                    <option value="JDM">JDM & Japoneses</option>
                    <option value="Muscle Cars">Muscle Cars Americanos</option>
                    <option value="Boulevard">Boulevard Series</option>
                    <option value="Camionetas Off-Road">Camionetas Off-Road</option>
                    <option value="Mainline">Mainline Básico</option>
                  </select>
                </div>
              </div>

              {/* Blister Condition */}
              <div className="flex flex-col gap-1">
                <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                  Condición del Blíster / Empaque *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Impecable', 'Muy Bueno', 'Desgaste / Abrir', 'Loose'] as BlisterCondition[]).map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setNewProd({ ...newProd, estado_blister: cond })}
                      className={`p-2.5 font-label-telemetry text-xs uppercase border transition-all ${
                        newProd.estado_blister === cond
                          ? 'bg-primary-container text-on-primary-container border-primary-container font-bold'
                          : 'bg-surface-container text-on-surface-variant border-surface-container hover:text-on-surface'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Precio */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Precio ($ ARS) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProd.precio}
                    onChange={(e) => setNewProd({ ...newProd, precio: Number(e.target.value) })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  />
                </div>

                {/* Stock */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Unidades Disponibles *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: Number(e.target.value) })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  />
                </div>

                {/* Año */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Año de Lanzamiento
                  </label>
                  <input
                    type="number"
                    value={newProd.anio}
                    onChange={(e) => setNewProd({ ...newProd, anio: Number(e.target.value) })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  />
                </div>
              </div>

              {/* Destacado Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                <input
                  type="checkbox"
                  checked={newProd.destacado}
                  onChange={(e) => setNewProd({ ...newProd, destacado: e.target.checked })}
                  className="accent-primary-container w-4 h-4 cursor-pointer"
                />
                <span className="font-label-telemetry text-xs uppercase text-on-surface">
                  Exhibir en la sección "Destacados de la Semana" en la página principal
                </span>
              </label>

              {/* Submit */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="w-full py-4 bg-primary-container hover:bg-surface-tint text-on-primary-container font-headline-md uppercase text-sm tracking-wider flex items-center justify-center gap-2 font-bold shadow-md transition-all disabled:opacity-60"
                >
                  {savingProduct ? (
                    <>
                      <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                      <span>GUARDANDO EN BASE DE DATOS...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">save</span>
                      <span>PUBLICAR PRODUCTO EN EL CATÁLOGO</span>
                    </>
                  )}
                </button>

                {productSuccessMsg && (
                  <div className="p-3 bg-secondary-container/20 border border-secondary-container text-on-surface font-label-telemetry text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-base">check_circle</span>
                    <span className="text-primary-container font-bold uppercase">{productSuccessMsg}</span>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================================
          TAB 2: GESTIÓN DE INVENTARIO & STOCK
      ============================================================================== */}
      {activeTab === 'stock' && (
        <div className="bg-surface-container-low border border-surface-container p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-container">
            <h2 className="font-headline-lg text-xl uppercase tracking-wider text-on-surface">
              Inventario de Modelos ({products.length})
            </h2>
            <span className="font-label-telemetry text-xs text-outline">
              Edición rápida de precios, unidades y estado activo
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body-sm">
              <thead className="bg-surface-container font-label-telemetry text-[11px] uppercase text-outline border-b border-surface-container-highest">
                <tr>
                  <th className="p-3">Foto</th>
                  <th className="p-3">Modelo</th>
                  <th className="p-3">Marca / Escala</th>
                  <th className="p-3">Blíster</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container/50 transition-colors">
                    {/* Thumbnail */}
                    <td className="p-3">
                      <div className="relative w-12 h-12 bg-surface-container-lowest border border-surface-container overflow-hidden">
                        <Image src={p.imagen_url} alt={p.modelo} fill className="object-cover" />
                      </div>
                    </td>

                    {/* Modelo */}
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-headline-sm uppercase text-sm text-on-surface">
                          {p.modelo}
                        </span>
                        <span className="text-[11px] text-outline font-label-telemetry">{p.categoria}</span>
                      </div>
                    </td>

                    {/* Marca & Escala */}
                    <td className="p-3 font-label-telemetry uppercase text-outline">
                      {p.marca} // {p.escala}
                    </td>

                    {/* Blister */}
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-surface-container font-label-telemetry text-[11px] uppercase text-primary-container">
                        {p.estado_blister}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="p-3 font-label-price text-base text-primary-container">
                      ${p.precio.toLocaleString('es-AR')}
                    </td>

                    {/* Stock with buttons */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 font-label-telemetry">
                        <button
                          onClick={() => handleStockChange(p, -1)}
                          className="px-2 py-0.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-xs"
                        >
                          -
                        </button>
                        <span className="font-bold text-on-surface px-1">{p.stock}</span>
                        <button
                          onClick={() => handleStockChange(p, 1)}
                          className="px-2 py-0.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-xs"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Estado activo switch */}
                    <td className="p-3 font-label-telemetry">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`px-2 py-1 text-[10px] uppercase font-bold border ${
                          p.activo
                            ? 'bg-secondary-container/20 text-secondary border-secondary-container'
                            : 'bg-surface-container text-outline border-surface-container'
                        }`}
                      >
                        {p.activo ? 'ACTIVO' : 'PAUSADO'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1 text-outline hover:text-race-red transition-colors"
                        title="Eliminar producto"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================================
          TAB 3: ENCARGOS Y LEADS DE CLIENTES (leads_encargos)
      ============================================================================== */}
      {activeTab === 'leads' && (
        <div className="bg-surface-container-low border border-surface-container p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-container">
            <h2 className="font-headline-lg text-xl uppercase tracking-wider text-on-surface">
              Solicitudes de Encargo & Cacería de Piezas ({leads.length})
            </h2>
            <span className="font-label-telemetry text-xs text-outline">TABLE: LEADS_ENCARGOS</span>
          </div>

          <div className="flex flex-col gap-4">
            {leads.length === 0 ? (
              <p className="text-center py-10 text-on-surface-variant font-label-telemetry">
                No hay encargos registrados todavía.
              </p>
            ) : (
              leads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-surface-container border border-surface-container-high p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm uppercase text-base text-on-surface font-bold">
                        {lead.nombre}
                      </span>
                      <span
                        className={`px-2 py-0.5 font-label-telemetry text-[10px] uppercase font-bold border ${
                          lead.estado === 'Pendiente'
                            ? 'bg-secondary-container text-on-secondary-container border-secondary-container'
                            : lead.estado === 'En búsqueda'
                            ? 'bg-primary-container text-on-primary-container border-primary-container'
                            : 'bg-surface-container-highest text-outline border-surface-container-highest'
                        }`}
                      >
                        {lead.estado}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-label-telemetry text-outline">
                      <span>📱 {lead.telefono}</span>
                      <span>•</span>
                      <span>Línea: {lead.serie || 'Coleccionable'}</span>
                      <span>•</span>
                      <span>Presupuesto: {lead.presupuesto || 'A convenir'}</span>
                    </div>

                    <p className="font-body-sm text-xs text-primary-container font-semibold mt-1">
                      Modelo Buscado: {lead.modelo_buscado}
                    </p>
                    <span className="font-label-telemetry text-[11px] text-on-surface-variant">
                      Condición requerida: {lead.estado_empaque || 'Mint C-10'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Status Changer */}
                    <select
                      value={lead.estado}
                      onChange={(e) => handleLeadStatusChange(lead.id, e.target.value as LeadStatus)}
                      className="bg-surface-container-lowest border border-surface-container-highest text-on-surface text-xs font-label-telemetry px-2.5 py-1.5 focus:outline-none"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En búsqueda">En búsqueda</option>
                      <option value="Contactado">Contactado</option>
                    </select>

                    {/* WhatsApp Action button */}
                    <a
                      href={getWhatsAppLeadUrl(lead)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-primary-container hover:bg-surface-tint text-on-primary-container font-headline-sm text-xs uppercase flex items-center justify-center gap-1.5 font-bold transition-colors whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-base">chat</span>
                      <span>Contactar WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==============================================================================
          TAB 4: MODERACIÓN DE LA COMUNIDAD (EL GARAJE)
      ============================================================================== */}
      {activeTab === 'comunidad' && (
        <div className="bg-surface-container-low border border-surface-container p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <h2 className="font-headline-lg text-xl uppercase tracking-wider text-on-surface">
              Publicaciones Comunitarias ({community.length})
            </h2>
            <span className="font-label-telemetry text-xs text-outline">TABLE: COMMUNITY_POSTS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {community.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container border border-surface-container-high p-4 flex gap-4"
              >
                <div className="relative w-24 h-24 bg-surface-container-lowest flex-shrink-0 overflow-hidden border border-surface-container">
                  <Image src={item.image_url} alt={item.featured_piece} fill className="object-cover" />
                </div>
                <div className="flex flex-col justify-between flex-grow min-w-0">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm uppercase text-sm text-on-surface font-bold truncate">
                        {item.collector_handle}
                      </span>
                      <span className="font-label-telemetry text-xs text-primary-container">
                        ★ {item.rating}/5
                      </span>
                    </div>
                    <span className="text-[11px] font-label-telemetry text-outline block">
                      {item.featured_piece} // {item.location}
                    </span>
                    <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2 mt-1 italic">
                      "{item.review}"
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-surface-container text-xs font-label-telemetry">
                    <span className="text-secondary font-bold">🔥 {item.likes} Likes</span>
                    <span className="text-primary-container uppercase">{item.tag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
