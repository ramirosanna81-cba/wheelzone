'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { Product, LeadEncargo, CommunityPost, BlisterCondition, LeadStatus, DestacadoTipo } from '@/lib/types';
import {
  isSupabaseConfigured,
  supabase,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchLeads,
  updateLead,
  updateLeadStatus,
  deleteLead,
  fetchCommunityPosts,
  deleteCommunityPost,
  toggleCommunityPostApproval,
  uploadImageToStorage,
} from '@/lib/supabase';
import {
  CATALOG_BRANDS,
  CATALOG_SCALES,
  CATALOG_THEMES,
  CATALOG_BLISTER_CONDITIONS,
  matchesBrand,
} from '@/lib/catalog-constants';

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState('admin@wheelszone.com');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active Tab: 'nuevo' | 'stock' | 'destacados' | 'leads' | 'comunidad'
  const [activeTab, setActiveTab] = useState<'nuevo' | 'stock' | 'destacados' | 'leads' | 'comunidad'>('nuevo');

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<LeadEncargo[]>([]);
  const [community, setCommunity] = useState<CommunityPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Inventory Stock Filter States
  const [stockSearch, setStockSearch] = useState('');
  const [stockBrand, setStockBrand] = useState('');
  const [stockScale, setStockScale] = useState('');
  const [stockCategory, setStockCategory] = useState('');
  const [stockBlister, setStockBlister] = useState('');
  const [stockStatus, setStockStatus] = useState<'all' | 'active' | 'inactive' | 'out_of_stock'>('all');

  const filteredStockProducts = useMemo(() => {
    return products.filter((p) => {
      if (stockSearch.trim()) {
        const q = stockSearch.toLowerCase();
        const match =
          p.modelo.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q) ||
          (p.serie && p.serie.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (stockBrand && !matchesBrand(p, stockBrand)) {
        return false;
      }
      if (stockScale && p.escala !== stockScale) {
        return false;
      }
      if (stockCategory && !p.categoria.toLowerCase().includes(stockCategory.toLowerCase())) {
        return false;
      }
      if (stockBlister && p.estado_blister !== stockBlister) {
        return false;
      }
      if (stockStatus === 'active' && !p.activo) return false;
      if (stockStatus === 'inactive' && p.activo) return false;
      if (stockStatus === 'out_of_stock' && p.stock > 0) return false;

      return true;
    });
  }, [products, stockSearch, stockBrand, stockScale, stockCategory, stockBlister, stockStatus]);

  const resetStockFilters = () => {
    setStockSearch('');
    setStockBrand('');
    setStockScale('');
    setStockCategory('');
    setStockBlister('');
    setStockStatus('all');
  };

  // Destacados Filter & Management States
  const [destacadosSearch, setDestacadosSearch] = useState('');
  const [destacadosFilter, setDestacadosFilter] = useState<'all' | 'destacados' | 'semanal' | 'mensual' | 'spotlight'>('destacados');

  const filteredDestacadosProducts = useMemo(() => {
    return products.filter((p) => {
      if (destacadosSearch.trim()) {
        const q = destacadosSearch.toLowerCase();
        const match =
          p.modelo.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q) ||
          (p.serie && p.serie.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (destacadosFilter === 'destacados') return p.destacado;
      if (destacadosFilter === 'semanal') return p.destacado && p.destacado_tipo === 'semanal';
      if (destacadosFilter === 'mensual') return p.destacado && p.destacado_tipo === 'mensual';
      if (destacadosFilter === 'spotlight') return p.destacado && (p.destacado_tipo === 'spotlight' || (p.hero_order !== undefined && p.hero_order > 0));
      return true; // 'all'
    });
  }, [products, destacadosSearch, destacadosFilter]);

  const heroSpotlightProducts = useMemo(() => {
    const list = products.filter((p) => p.destacado);
    return [...list].sort((a, b) => (a.hero_order || 99) - (b.hero_order || 99)).slice(0, 5);
  }, [products]);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // New Product Form State
  const [newProd, setNewProd] = useState({
    modelo: '',
    marca: CATALOG_BRANDS[0].value,
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

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savingEditProduct, setSavingEditProduct] = useState(false);
  const [editImageUploading, setEditImageUploading] = useState(false);

  // Edit Lead Modal State
  const [editingLead, setEditingLead] = useState<LeadEncargo | null>(null);
  const [savingEditLead, setSavingEditLead] = useState(false);

  // Check and listen to Supabase Auth session
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setIsAuthenticated(true);
            setAuthEmail(session.user.email || 'admin@wheelszone.com');
            return;
          }
        } catch (err) {
          console.warn('Error checking supabase session:', err);
        }
      }

      // Check fallback localStorage
      const savedSession = localStorage.getItem('wheelszone_admin_session');
      if (savedSession === 'true' && mounted) {
        setIsAuthenticated(true);
      }
    }

    checkSession();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
        showToast('Error cargando datos del panel.', 'error');
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
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });

        if (error) {
          setAuthError(`Error de Supabase: ${error.message}`);
          setAuthLoading(false);
          return;
        }

        if (data?.session) {
          setIsAuthenticated(true);
          localStorage.setItem('wheelszone_admin_session', 'true');
          setAuthLoading(false);
          showToast('Sesión de administrador iniciada correctamente.');
          return;
        }
      } catch (err: any) {
        console.warn('Supabase auth failed:', err);
        setAuthError(err?.message || 'Error de conexión con Supabase.');
        setAuthLoading(false);
        return;
      }
    }

    // Default password or demo fallback
    if (authPassword === 'admin123' || authPassword === 'wheelszone' || authEmail.includes('admin')) {
      setIsAuthenticated(true);
      localStorage.setItem('wheelszone_admin_session', 'true');
      showToast('Sesión demo iniciada.');
    } else {
      setAuthError('Credenciales incorrectas. (Usar: admin@wheelszone.com / admin123)');
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    localStorage.removeItem('wheelszone_admin_session');
    showToast('Sesión cerrada.', 'info');
  };

  // Image Upload handler for new product
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      const url = await uploadImageToStorage(file, 'diecast-media');
      setNewProd((prev) => ({ ...prev, imagen_url: url }));
      showToast('Imagen cargada correctamente.');
    } catch (err) {
      console.error('Error uploading product image:', err);
      showToast('Error al subir la imagen.', 'error');
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
      showToast(`¡${created.modelo} registrado con éxito!`);
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
      showToast('Error al crear el producto.', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  // Quick Stock adjustment
  const handleStockChange = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    const res = await updateProduct(product.id, { stock: newStock });
    if (res.success && res.product) {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? res.product! : p)));
    } else {
      showToast(res.error || 'Error al actualizar stock.', 'error');
    }
  };

  // Toggle Product Active
  const handleToggleActive = async (product: Product) => {
    const res = await updateProduct(product.id, { activo: !product.activo });
    if (res.success && res.product) {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? res.product! : p)));
      showToast(res.product.activo ? `"${product.modelo}" activado en tienda.` : `"${product.modelo}" pausado.`);
    } else {
      showToast(res.error || 'Error al actualizar estado.', 'error');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, modelo: string) => {
    if (!window.confirm(`¿Confirmás eliminar permanentemente "${modelo}" del catálogo y base de datos?`)) return;
    const res = await deleteProduct(id);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Producto "${modelo}" eliminado correctamente.`);
    } else {
      showToast(res.error || 'No se pudo eliminar el producto.', 'error');
      alert(res.error || 'No se pudo eliminar el producto.');
    }
  };

  // Edit Product Handlers
  const handleStartEditProduct = (p: Product) => {
    setEditingProduct({ ...p });
  };

  const handleEditProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !editingProduct) return;
    const file = e.target.files[0];
    setEditImageUploading(true);

    try {
      const url = await uploadImageToStorage(file, 'diecast-media');
      setEditingProduct((prev) => (prev ? { ...prev, imagen_url: url } : null));
      showToast('Nueva foto cargada para el producto.');
    } catch (err) {
      console.error('Error uploading product image:', err);
      showToast('Error al subir la imagen.', 'error');
    } finally {
      setEditImageUploading(false);
    }
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setSavingEditProduct(true);
    try {
      const res = await updateProduct(editingProduct.id, editingProduct);
      if (res.success && res.product) {
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? res.product! : p)));
        showToast(`Producto "${editingProduct.modelo}" actualizado con éxito.`);
        setEditingProduct(null);
      } else {
        showToast(res.error || 'Error al guardar cambios del producto.', 'error');
        alert(res.error || 'Error al guardar cambios.');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error inesperado al guardar.', 'error');
    } finally {
      setSavingEditProduct(false);
    }
  };

  // Handler to toggle product 'destacado' status directly with 1 click
  const handleToggleDestacado = async (product: Product) => {
    const newStatus = !product.destacado;
    const newTipo: DestacadoTipo | undefined = newStatus ? (product.destacado_tipo || 'general') : undefined;
    const newTag = newStatus ? (product.destacado_tag || '🔥 SPOTLIGHT DESTACADO') : undefined;

    try {
      const res = await updateProduct(product.id, {
        destacado: newStatus,
        destacado_tipo: newTipo,
        destacado_tag: newTag,
      });

      if (res.success && res.product) {
        setProducts((prev) => prev.map((p) => (p.id === product.id ? res.product! : p)));
        showToast(
          newStatus
            ? `"${product.modelo}" agregado a Destacados.`
            : `"${product.modelo}" removido de Destacados.`
        );
      } else {
        showToast(res.error || 'Error al actualizar destacado.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error inesperado.', 'error');
    }
  };

  const handleUpdateDestacadoMeta = async (
    productId: string,
    tipo: DestacadoTipo,
    tag?: string,
    heroOrder?: number
  ) => {
    try {
      const updates: Partial<Product> = {
        destacado: true,
        destacado_tipo: tipo,
      };
      if (tag !== undefined) updates.destacado_tag = tag;
      if (heroOrder !== undefined) updates.hero_order = heroOrder;

      const res = await updateProduct(productId, updates);
      if (res.success && res.product) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? res.product! : p)));
        showToast('Configuración de Destacado guardada.');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error al guardar configuración.', 'error');
    }
  };

  // Lead Handlers (Update & Delete)
  const handleLeadStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const res = await updateLead(leadId, { estado: newStatus });
    if (res.success && res.lead) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? res.lead! : l)));
      showToast(`Estado de encargo actualizado a: ${newStatus}`);
    } else {
      showToast(res.error || 'Error al actualizar estado del encargo.', 'error');
    }
  };

  const handleDeleteLead = async (leadId: string, leadNombre: string) => {
    if (!window.confirm(`¿Confirmás eliminar el encargo de ${leadNombre}? Esta acción removerá el registro.`)) return;
    const res = await deleteLead(leadId);
    if (res.success) {
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      showToast(`Encargo de ${leadNombre} eliminado.`);
    } else {
      showToast(res.error || 'Error al eliminar el encargo.', 'error');
    }
  };

  const handleStartEditLead = (lead: LeadEncargo) => {
    setEditingLead({ ...lead });
  };

  const handleSaveLeadEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    setSavingEditLead(true);
    try {
      const res = await updateLead(editingLead.id, editingLead);
      if (res.success && res.lead) {
        setLeads((prev) => prev.map((l) => (l.id === editingLead.id ? res.lead! : l)));
        showToast('Encargo actualizado correctamente.');
        setEditingLead(null);
      } else {
        showToast(res.error || 'Error al actualizar el encargo.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error inesperado.', 'error');
    } finally {
      setSavingEditLead(false);
    }
  };

  // Community Moderation Handlers (Delete & Toggle Approval)
  const handleDeleteCommunityPost = async (id: string, author: string) => {
    if (!window.confirm(`¿Confirmás eliminar la publicación de ${author}? Esta acción es permanente.`)) return;
    const res = await deleteCommunityPost(id);
    if (res.success) {
      setCommunity((prev) => prev.filter((item) => item.id !== id));
      showToast(`Publicación de ${author} eliminada de la comunidad.`);
    } else {
      showToast(res.error || 'Error al eliminar publicación.', 'error');
      alert(res.error || 'Error al eliminar publicación.');
    }
  };

  const handleToggleCommunityApproval = async (item: CommunityPost) => {
    const nextApproved = !item.approved;
    const ok = await toggleCommunityPostApproval(item.id, nextApproved);
    if (ok) {
      setCommunity((prev) => prev.map((p) => (p.id === item.id ? { ...p, approved: nextApproved } : p)));
      showToast(nextApproved ? 'Publicación aprobada y visible.' : 'Publicación ocultada.', 'info');
    } else {
      showToast('Error al cambiar estado de moderación.', 'error');
    }
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
    <div className="flex flex-col w-full px-3 sm:px-6 md:px-8 mx-auto max-w-7xl pb-24 pt-3 sm:pt-4 overflow-x-hidden">
      {/* Session Security Banner */}
      <div className="bg-surface-container-low border border-surface-container p-2.5 sm:p-3 mb-6 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-xs font-label-telemetry">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping shrink-0"></span>
            <span className="text-on-surface font-bold text-[11px] sm:text-xs">SESIÓN ACTIVA: admin@wheelszone.com</span>
          </div>
          <span className="text-outline hidden sm:inline">//</span>
          <span className="px-2 py-0.5 bg-surface-container-highest text-primary-container uppercase text-[10px] sm:text-xs truncate">
            {isSupabaseConfigured ? 'Supabase PostgreSQL Cloud Conectado' : 'Modo Almacén Local'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-secondary hidden md:flex items-center gap-1 text-[11px]">
            <span className="material-symbols-outlined text-sm">lock</span>
            RUTAS PRIVADAS
          </span>
          <button
            onClick={handleLogout}
            className="px-2.5 sm:px-3 py-1 bg-surface-container hover:bg-surface-container-high text-race-red border border-surface-container-highest uppercase font-bold flex items-center gap-1 text-[11px] sm:text-xs"
          >
            <span className="material-symbols-outlined text-xs">logout</span>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Telemetry KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-surface-container-low border border-surface-container p-3 sm:p-4 flex flex-col gap-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-outline text-[10px] sm:text-xs font-label-telemetry uppercase">
            <span className="truncate">Catálogo Activo</span>
            <span className="material-symbols-outlined text-primary-container text-base sm:text-lg shrink-0">garage</span>
          </div>
          <div className="font-display-hero text-2xl sm:text-3xl text-primary leading-none">
            {products.length}
          </div>
          <span className="text-[10px] sm:text-[11px] text-outline font-label-telemetry uppercase truncate">
            {totalStockCount} unid. en depósito
          </span>
        </div>

        <div className="bg-surface-container-low border border-surface-container p-3 sm:p-4 flex flex-col gap-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-outline text-[10px] sm:text-xs font-label-telemetry uppercase">
            <span className="truncate">Despachos</span>
            <span className="material-symbols-outlined text-secondary-container text-base sm:text-lg shrink-0">local_shipping</span>
          </div>
          <div className="font-display-hero text-2xl sm:text-3xl text-secondary-fixed leading-none">
            08
          </div>
          <span className="text-[10px] sm:text-[11px] text-secondary-container font-label-telemetry uppercase font-bold truncate">
            Blíster C-10 Activo
          </span>
        </div>

        <div className="bg-surface-container-low border border-surface-container p-3 sm:p-4 flex flex-col gap-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-outline text-[10px] sm:text-xs font-label-telemetry uppercase">
            <span className="truncate">Encargos</span>
            <span className="material-symbols-outlined text-primary-container text-base sm:text-lg shrink-0">radar</span>
          </div>
          <div className="font-display-hero text-2xl sm:text-3xl text-primary leading-none">
            {pendingLeads}
          </div>
          <span className="text-[10px] sm:text-[11px] text-on-surface-variant font-label-telemetry uppercase truncate">
            Leads pendientes
          </span>
        </div>

        <div className="bg-surface-container-low border border-surface-container p-3 sm:p-4 flex flex-col gap-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-outline text-[10px] sm:text-xs font-label-telemetry uppercase">
            <span className="truncate">Valuación Stock</span>
            <span className="material-symbols-outlined text-tertiary text-base sm:text-lg shrink-0">payments</span>
          </div>
          <div className="font-label-price text-lg sm:text-2xl text-on-surface leading-none truncate">
            ${totalValuation.toLocaleString('es-AR')}
          </div>
          <span className="text-[10px] sm:text-[11px] text-primary-container font-label-telemetry uppercase truncate">
            ARS // Inventario
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-surface-container mb-6 overflow-x-auto pb-2 no-scrollbar -mx-3 sm:mx-0 px-3 sm:px-0">
        <button
          onClick={() => setActiveTab('nuevo')}
          className={`px-3 sm:px-4 py-2 font-headline-sm uppercase text-xs sm:text-sm tracking-wider flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'nuevo'
              ? 'bg-primary-container text-on-primary-container font-bold border-b-2 border-primary-container'
              : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-sm sm:text-base">add_box</span>
          <span>Carga Rápida</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`px-3 sm:px-4 py-2 font-headline-sm uppercase text-xs sm:text-sm tracking-wider flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'stock'
              ? 'bg-primary-container text-on-primary-container font-bold border-b-2 border-primary-container'
              : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-sm sm:text-base">inventory_2</span>
          <span>Inventario ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('destacados')}
          className={`px-3 sm:px-4 py-2 font-headline-sm uppercase text-xs sm:text-sm tracking-wider flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'destacados'
              ? 'bg-primary-container text-on-primary-container font-bold border-b-2 border-primary-container'
              : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-sm sm:text-base">stars</span>
          <span>Destacados & Hero ({products.filter((p) => p.destacado).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`px-3 sm:px-4 py-2 font-headline-sm uppercase text-xs sm:text-sm tracking-wider flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'leads'
              ? 'bg-primary-container text-on-primary-container font-bold border-b-2 border-primary-container'
              : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-sm sm:text-base">assignment_ind</span>
          <span>Encargos ({leads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('comunidad')}
          className={`px-3 sm:px-4 py-2 font-headline-sm uppercase text-xs sm:text-sm tracking-wider flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'comunidad'
              ? 'bg-primary-container text-on-primary-container font-bold border-b-2 border-primary-container'
              : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-sm sm:text-base">forum</span>
          <span>Comunidad ({community.length})</span>
        </button>
      </div>

      {/* ==============================================================================
          TAB 1: CARGA RÁPIDA DE PRODUCTO (ANTI-COMPLICACIONES + DRAG & DROP)
      ============================================================================== */}
      {activeTab === 'nuevo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          {/* Drag & Drop Photo Area (5 Cols) */}
          <div className="lg:col-span-5 bg-surface-container-low border border-surface-container p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <span className="font-headline-sm uppercase text-xs sm:text-sm text-primary-container flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">cloud_upload</span>
                FOTOGRAFÍA DEL BLÍSTER
              </span>
              <span className="font-label-telemetry text-[10px] sm:text-[11px] text-outline uppercase">
                BUCKET: diecast-media
              </span>
            </div>

            {/* Dropzone container */}
            <div className="relative border-2 border-dashed border-surface-container-highest bg-surface-container p-4 sm:p-6 flex flex-col items-center justify-center text-center hover:border-primary-container transition-colors cursor-pointer group min-h-[200px] sm:min-h-[220px]">
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
          <div className="lg:col-span-7 bg-surface-container-low border border-surface-container p-4 sm:p-6 md:p-8 flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <h2 className="font-headline-lg text-lg sm:text-xl uppercase tracking-wider text-on-surface">
                Datos del Modelo para Catálogo
              </h2>
              <span className="font-label-telemetry text-[11px] sm:text-xs text-outline">TABLE: PRODUCTS</span>
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
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant flex items-center justify-between">
                    <span>Marca y Categoría Principal *</span>
                    <span className="text-[10px] text-primary-container">SINCRONIZADO CON TIENDA</span>
                  </label>
                  <select
                    value={newProd.marca}
                    onChange={(e) => setNewProd({ ...newProd, marca: e.target.value })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  >
                    {CATALOG_BRANDS.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
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
                    {CATALOG_SCALES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
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
                  <div className="flex items-center justify-between">
                    <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                      Temática / Categoría *
                    </label>
                    <span className="text-[10px] font-label-telemetry text-outline">
                      Elegí de la lista o escribí una propia
                    </span>
                  </div>
                  <input
                    type="text"
                    list="theme-suggestions-quick"
                    value={newProd.categoria}
                    onChange={(e) => setNewProd({ ...newProd, categoria: e.target.value })}
                    placeholder="Ej: Línea Premium, JDM, Básicos, Dakar..."
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  />
                  <datalist id="theme-suggestions-quick">
                    {CATALOG_THEMES.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Blister Condition */}
              <div className="flex flex-col gap-1">
                <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                  Condición del Blíster / Empaque *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {CATALOG_BLISTER_CONDITIONS.map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setNewProd({ ...newProd, estado_blister: cond })}
                      className={`p-2.5 font-label-telemetry text-xs uppercase border transition-all text-center ${
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
          TAB 2: GESTIÓN DE INVENTARIO & STOCK CON FILTROS SINCRONIZADOS
      ============================================================================== */}
      {activeTab === 'stock' && (
        <div className="bg-surface-container-low border border-surface-container p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-surface-container">
            <div className="flex flex-col gap-0.5">
              <h2 className="font-headline-lg text-xl uppercase tracking-wider text-on-surface flex items-center gap-2">
                <span>Inventario de Modelos</span>
                <span className="text-primary-container text-base font-label-telemetry">
                  ({filteredStockProducts.length} de {products.length})
                </span>
              </h2>
              <span className="font-label-telemetry text-xs text-outline">
                Filtros sincronizados con la tienda en tiempo real
              </span>
            </div>

            {(stockSearch || stockBrand || stockScale || stockCategory || stockBlister || stockStatus !== 'all') && (
              <button
                onClick={resetStockFilters}
                className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-on-surface font-label-telemetry text-xs uppercase flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                <span>Restablecer Filtros</span>
              </button>
            )}
          </div>

          {/* Synchronized Filter Toolbar */}
          <div className="bg-surface-container/60 border border-surface-container-high p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-surface-container">
              <span className="font-label-telemetry text-xs uppercase text-primary-container font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">tune</span>
                Filtros Telemétricos de Inventario
              </span>
              <span className="font-label-telemetry text-[11px] text-outline uppercase">
                {filteredStockProducts.length} coincidencias
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Search text */}
              <div className="flex flex-col gap-1 lg:col-span-2">
                <label className="font-label-telemetry text-[11px] uppercase text-on-surface-variant">
                  Búsqueda Rápida
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Casting, modelo, serie..."
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-surface-container-highest text-on-surface px-3 py-2 pl-8 text-xs focus:outline-none focus:border-primary-container"
                  />
                  <span className="material-symbols-outlined absolute left-2 top-2 text-outline text-base pointer-events-none">
                    search
                  </span>
                </div>
              </div>

              {/* Filter Marca / Linea */}
              <div className="flex flex-col gap-1">
                <label className="font-label-telemetry text-[11px] uppercase text-on-surface-variant">
                  Marca / Línea
                </label>
                <select
                  value={stockBrand}
                  onChange={(e) => setStockBrand(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-highest text-on-surface px-2.5 py-2 text-xs focus:outline-none focus:border-primary-container"
                >
                  <option value="">Todas las marcas</option>
                  {CATALOG_BRANDS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Escala */}
              <div className="flex flex-col gap-1">
                <label className="font-label-telemetry text-[11px] uppercase text-on-surface-variant">
                  Escala
                </label>
                <select
                  value={stockScale}
                  onChange={(e) => setStockScale(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-highest text-on-surface px-2.5 py-2 text-xs focus:outline-none focus:border-primary-container"
                >
                  <option value="">Todas las escalas</option>
                  {CATALOG_SCALES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Categoria / Temática */}
              <div className="flex flex-col gap-1">
                <label className="font-label-telemetry text-[11px] uppercase text-on-surface-variant">
                  Temática Motorsport
                </label>
                <select
                  value={stockCategory}
                  onChange={(e) => setStockCategory(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-highest text-on-surface px-2.5 py-2 text-xs focus:outline-none focus:border-primary-container"
                >
                  <option value="">Todas las categorías</option>
                  {CATALOG_THEMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Estado Activo / Stock */}
              <div className="flex flex-col gap-1">
                <label className="font-label-telemetry text-[11px] uppercase text-on-surface-variant">
                  Disponibilidad
                </label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value as any)}
                  className="w-full bg-surface-container-lowest border border-surface-container-highest text-on-surface px-2.5 py-2 text-xs focus:outline-none focus:border-primary-container"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Solo Activos (En Tienda)</option>
                  <option value="inactive">Solo Pausados (Ocultos)</option>
                  <option value="out_of_stock">Solo Sin Stock (0 unid.)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[680px] text-left text-xs font-body-sm">
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
                {filteredStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-outline">search_off</span>
                        <p className="font-headline-sm uppercase text-sm text-on-surface">
                          No se encontraron modelos con los filtros seleccionados
                        </p>
                        <button
                          onClick={resetStockFilters}
                          className="mt-2 px-3 py-1.5 bg-primary-container text-on-primary-container text-xs font-label-telemetry uppercase font-bold"
                        >
                          Mostrar todos los modelos
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStockProducts.map((p) => (
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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStartEditProduct(p)}
                          className="p-1.5 text-outline hover:text-primary-container hover:bg-surface-container transition-colors border border-transparent hover:border-surface-container-highest"
                          title="Modificar todos los campos del producto"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.modelo)}
                          className="p-1.5 text-outline hover:text-race-red hover:bg-surface-container transition-colors border border-transparent hover:border-race-red/30"
                          title="Eliminar producto"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================================
          TAB EXTRA: GESTOR DE DESTACADOS & HERO SPOTLIGHT ("LO MÁS CALIENTE")
      ============================================================================== */}
      {activeTab === 'destacados' && (
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Header & Overview */}
          <div className="bg-surface-container-low border border-surface-container p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 border-b border-surface-container">
              <div>
                <h2 className="font-headline-lg text-lg sm:text-2xl uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <span className="text-primary-container">⭐</span>
                  <span>Gestor de Destacados & Hero</span>
                </h2>
                <p className="text-xs text-on-surface-variant font-body-sm mt-1">
                  Controlá qué modelos aparecen en el gran Blíster 3D rotativo del Hero y organizá las piezas para el carrusel de la página de inicio.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-primary-container/20 border border-primary-container text-primary-container font-label-telemetry text-[11px] sm:text-xs uppercase font-bold">
                  {products.filter((p) => p.destacado).length} ACTIVOS EN DESTACADOS
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-surface-container border border-surface-container-highest flex flex-col">
                <span className="text-xs text-outline font-label-telemetry uppercase">Hero Spotlight</span>
                <span className="text-2xl font-display-hero text-primary-container">
                  {heroSpotlightProducts.length} / 5
                </span>
                <span className="text-[10px] text-on-surface-variant">Rotan en el blíster 3D</span>
              </div>
              <div className="p-3 bg-surface-container border border-surface-container-highest flex flex-col">
                <span className="text-xs text-outline font-label-telemetry uppercase">Drops Semanales</span>
                <span className="text-2xl font-display-hero text-secondary">
                  {products.filter((p) => p.destacado && p.destacado_tipo === 'semanal').length}
                </span>
                <span className="text-[10px] text-on-surface-variant">Badge 🔥 Semanal</span>
              </div>
              <div className="p-3 bg-surface-container border border-surface-container-highest flex flex-col">
                <span className="text-xs text-outline font-label-telemetry uppercase">Joyas del Mes</span>
                <span className="text-2xl font-display-hero text-amber-400">
                  {products.filter((p) => p.destacado && p.destacado_tipo === 'mensual').length}
                </span>
                <span className="text-[10px] text-on-surface-variant">Badge 💎 Mensual / STH</span>
              </div>
              <div className="p-3 bg-surface-container border border-surface-container-highest flex flex-col">
                <span className="text-xs text-outline font-label-telemetry uppercase">Carrusel General</span>
                <span className="text-2xl font-display-hero text-on-surface">
                  {products.filter((p) => p.destacado).length}
                </span>
                <span className="text-[10px] text-on-surface-variant">En sección Destacados</span>
              </div>
            </div>
          </div>

          {/* Section 1: Hero 3D Blister Spotlight Order & Badges */}
          <div className="bg-surface-container-low border border-surface-container p-6 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-surface-container">
              <div>
                <h3 className="font-headline-lg text-lg uppercase tracking-wider text-primary-container flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">local_fire_department</span>
                  <span>Slots del Blíster Hero ("Lo más caliente" - Máx 5 autos)</span>
                </h3>
                <p className="text-xs text-on-surface-variant font-body-sm">
                  Estos autos van pasando automáticamente en el blíster con barra de telemetría y resplandor reactivo.
                </p>
              </div>
            </div>

            {heroSpotlightProducts.length === 0 ? (
              <div className="p-8 border border-dashed border-surface-container-highest text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-outline">auto_awesome</span>
                <p className="text-sm text-on-surface-variant font-label-telemetry">
                  No tenés ningún auto asignado al Hero Spotlight. Marcá autos abajo como "Destacado" para que aparezcan acá.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {heroSpotlightProducts.map((p, idx) => (
                  <div
                    key={p.id}
                    className="bg-surface-container border border-surface-container-highest p-3 flex flex-col justify-between gap-3 relative group"
                  >
                    {/* Slot badge */}
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-primary-container text-black font-label-telemetry text-xs font-black uppercase tracking-wider rounded">
                        SLOT #{idx + 1} {idx === 0 ? '★ PRINCIPAL' : ''}
                      </span>
                      <button
                        onClick={() => handleUpdateDestacadoMeta(p.id, p.destacado_tipo || 'general', p.destacado_tag, 99)}
                        className="text-outline hover:text-race-red transition-colors text-xs"
                        title="Quitar este auto del Hero"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-full h-32 bg-surface-container-lowest border border-surface-container overflow-hidden">
                      <Image
                        src={p.imagen_url}
                        alt={p.modelo}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate" title={p.modelo}>
                        {p.modelo}
                      </span>
                      <span className="text-[11px] text-outline truncate">{p.marca} // {p.categoria}</span>
                      <span className="text-sm font-extrabold text-[#FFC200] mt-1">
                        ${p.precio.toLocaleString('es-AR')}
                      </span>
                    </div>

                    {/* Tag Selector */}
                    <div className="flex flex-col gap-1 pt-2 border-t border-surface-container-highest">
                      <label className="text-[10px] uppercase font-label-telemetry text-outline">
                        Etiqueta del Blíster:
                      </label>
                      <select
                        value={p.destacado_tag || '🔥 HOT DROP DE LA SEMANA'}
                        onChange={(e) => handleUpdateDestacadoMeta(p.id, p.destacado_tipo || 'semanal', e.target.value, p.hero_order || (idx + 1))}
                        className="bg-surface-container-low border border-surface-container-highest text-white text-[11px] px-2 py-1.5 focus:outline-none focus:border-primary-container"
                      >
                        <option value="🔥 HOT DROP DE LA SEMANA">🔥 HOT DROP DE LA SEMANA</option>
                        <option value="💎 JOYA DEL MES // $TH RAREZA">💎 JOYA DEL MES // $TH</option>
                        <option value="⚡ RECIÉN LLEGADO // ÚLTIMA UNIDAD">⚡ RECIÉN LLEGADO // ÚLTIMA UNIDAD</option>
                        <option value="🏎️ ICONO BOULEVARD // PREMIUM">🏎️ ICONO BOULEVARD</option>
                        <option value="🏁 EDICIÓN ESPECIAL // COLECCIONISTA">🏁 EDICIÓN ESPECIAL</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Catalog Quick Toggle Table */}
          <div className="bg-surface-container-low border border-surface-container p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-container">
              <div>
                <h3 className="font-headline-lg text-lg uppercase tracking-wider text-on-surface">
                  Catálogo Rápido: Activar / Configurar Destacados
                </h3>
                <p className="text-xs text-on-surface-variant font-body-sm">
                  Hacé 1 clic en la estrella para incluir cualquier auto en el carrusel y elegí su tipo de vigencia.
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-base">search</span>
                <input
                  type="text"
                  placeholder="Buscar modelo o marca..."
                  value={destacadosSearch}
                  onChange={(e) => setDestacadosSearch(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-highest pl-9 pr-3 py-1.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setDestacadosFilter('destacados')}
                className={`px-3 py-1 text-xs font-label-telemetry uppercase tracking-wider border transition-all ${
                  destacadosFilter === 'destacados'
                    ? 'bg-primary-container text-black font-bold border-primary-container'
                    : 'bg-surface-container text-outline border-surface-container-highest hover:text-white'
                }`}
              >
                ⭐ Solo Destacados ({products.filter((p) => p.destacado).length})
              </button>
              <button
                onClick={() => setDestacadosFilter('semanal')}
                className={`px-3 py-1 text-xs font-label-telemetry uppercase tracking-wider border transition-all ${
                  destacadosFilter === 'semanal'
                    ? 'bg-secondary-container text-white font-bold border-secondary-container'
                    : 'bg-surface-container text-outline border-surface-container-highest hover:text-white'
                }`}
              >
                🔥 Semanal ({products.filter((p) => p.destacado && p.destacado_tipo === 'semanal').length})
              </button>
              <button
                onClick={() => setDestacadosFilter('mensual')}
                className={`px-3 py-1 text-xs font-label-telemetry uppercase tracking-wider border transition-all ${
                  destacadosFilter === 'mensual'
                    ? 'bg-amber-400 text-black font-bold border-amber-400'
                    : 'bg-surface-container text-outline border-surface-container-highest hover:text-white'
                }`}
              >
                💎 Mensual ({products.filter((p) => p.destacado && p.destacado_tipo === 'mensual').length})
              </button>
              <button
                onClick={() => setDestacadosFilter('spotlight')}
                className={`px-3 py-1 text-xs font-label-telemetry uppercase tracking-wider border transition-all ${
                  destacadosFilter === 'spotlight'
                    ? 'bg-sky-500 text-white font-bold border-sky-500'
                    : 'bg-surface-container text-outline border-surface-container-highest hover:text-white'
                }`}
              >
                ⚡ Hero Spotlight ({heroSpotlightProducts.length})
              </button>
              <button
                onClick={() => setDestacadosFilter('all')}
                className={`px-3 py-1 text-xs font-label-telemetry uppercase tracking-wider border transition-all ${
                  destacadosFilter === 'all'
                    ? 'bg-surface-bright text-white font-bold border-white/50'
                    : 'bg-surface-container text-outline border-surface-container-highest hover:text-white'
                }`}
              >
                Mostrar Todos ({products.length})
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-surface-container no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full min-w-[680px] text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-surface-container-highest font-label-telemetry text-outline uppercase tracking-wider">
                    <th className="p-3 w-16 text-center">Destacado</th>
                    <th className="p-3 w-16">Foto</th>
                    <th className="p-3">Modelo & Categoría</th>
                    <th className="p-3">Precio</th>
                    <th className="p-3">Tipo de Destacado</th>
                    <th className="p-3">Slot Hero</th>
                    <th className="p-3">Etiqueta de Insignia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {filteredDestacadosProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-outline font-label-telemetry">
                        No se encontraron productos con el filtro aplicado.
                      </td>
                    </tr>
                  ) : (
                    filteredDestacadosProducts.map((p) => (
                      <tr
                        key={p.id}
                        className={`hover:bg-surface-container transition-colors ${
                          p.destacado ? 'bg-primary-container/[0.04]' : ''
                        }`}
                      >
                        {/* 1-Click Toggle Star */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleToggleDestacado(p)}
                            title={p.destacado ? 'Quitar de Destacados' : 'Marcar como Destacado'}
                            className={`p-1.5 rounded transition-transform active:scale-90 ${
                              p.destacado
                                ? 'text-primary-container hover:text-amber-300'
                                : 'text-neutral-600 hover:text-neutral-400'
                            }`}
                          >
                            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: p.destacado ? '"FILL" 1' : '"FILL" 0' }}>
                              star
                            </span>
                          </button>
                        </td>

                        {/* Thumbnail */}
                        <td className="p-3">
                          <div className="relative w-12 h-12 bg-surface-container-lowest border border-surface-container overflow-hidden">
                            <Image
                              src={p.imagen_url}
                              alt={p.modelo}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>

                        {/* Model */}
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-sm">{p.modelo}</span>
                            <span className="text-outline text-[11px]">{p.marca} // {p.categoria} ({p.escala})</span>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="p-3 font-label-price text-sm font-bold text-primary-container">
                          ${p.precio.toLocaleString('es-AR')}
                        </td>

                        {/* Tipo Selector */}
                        <td className="p-3">
                          <select
                            disabled={!p.destacado}
                            value={p.destacado_tipo || 'general'}
                            onChange={(e) => handleUpdateDestacadoMeta(p.id, e.target.value as DestacadoTipo, p.destacado_tag, p.hero_order)}
                            className="bg-surface-container border border-surface-container-highest text-on-surface text-xs px-2 py-1 focus:outline-none focus:border-primary-container disabled:opacity-40"
                          >
                            <option value="general">⭐ General (Carrusel)</option>
                            <option value="semanal">🔥 Semanal (Drop de la Semana)</option>
                            <option value="mensual">💎 Mensual (Joya del Mes)</option>
                            <option value="spotlight">⚡ Spotlight Hero</option>
                          </select>
                        </td>

                        {/* Hero Slot Selector */}
                        <td className="p-3">
                          <select
                            disabled={!p.destacado}
                            value={p.hero_order ? String(p.hero_order) : '0'}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              handleUpdateDestacadoMeta(p.id, p.destacado_tipo || 'spotlight', p.destacado_tag, val > 0 ? val : undefined);
                            }}
                            className="bg-surface-container border border-surface-container-highest text-on-surface text-xs px-2 py-1 focus:outline-none focus:border-primary-container disabled:opacity-40"
                          >
                            <option value="0">Fuera del Hero</option>
                            <option value="1">Slot #1 (Principal)</option>
                            <option value="2">Slot #2</option>
                            <option value="3">Slot #3</option>
                            <option value="4">Slot #4</option>
                            <option value="5">Slot #5</option>
                          </select>
                        </td>

                        {/* Tag */}
                        <td className="p-3">
                          <input
                            type="text"
                            disabled={!p.destacado}
                            placeholder="Ej: 🔥 HOT DROP DE LA SEMANA"
                            value={p.destacado_tag || ''}
                            onChange={(e) => handleUpdateDestacadoMeta(p.id, p.destacado_tipo || 'general', e.target.value, p.hero_order)}
                            className="bg-surface-container border border-surface-container-highest text-on-surface text-xs px-2 py-1 w-full max-w-[220px] focus:outline-none focus:border-primary-container disabled:opacity-40"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================================
          TAB 3: ENCARGOS Y LEADS DE CLIENTES (leads_encargos)
      ============================================================================== */}
      {activeTab === 'leads' && (
        <div className="bg-surface-container-low border border-surface-container p-4 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-surface-container">
            <h2 className="font-headline-lg text-lg sm:text-xl uppercase tracking-wider text-on-surface">
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
                  className="bg-surface-container border border-surface-container-high p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-headline-sm uppercase text-sm sm:text-base text-on-surface font-bold">
                        {lead.nombre}
                      </span>
                      <span
                        className={`px-2 py-0.5 font-label-telemetry text-[10px] uppercase font-bold border ${
                          lead.estado === 'Pendiente'
                            ? 'bg-secondary-container text-on-secondary-container border-secondary-container'
                            : lead.estado === 'En búsqueda'
                            ? 'bg-primary-container text-on-primary-container border-primary-container'
                            : lead.estado === 'Completado'
                            ? 'bg-emerald-900/40 text-emerald-300 border-emerald-600'
                            : lead.estado === 'Sin respuesta' || lead.estado === 'Cancelado'
                            ? 'bg-race-red/20 text-race-red border-race-red/40'
                            : 'bg-surface-container-highest text-outline border-surface-container-highest'
                        }`}
                      >
                        {lead.estado}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-label-telemetry text-outline">
                      <span>📱 {lead.telefono}</span>
                      {lead.email && (
                        <>
                          <span>•</span>
                          <span>✉️ {lead.email}</span>
                        </>
                      )}
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

                    {lead.notas_admin && (
                      <div className="mt-2 p-2 bg-surface-container-lowest border border-surface-container-highest text-xs font-label-telemetry text-amber-300 flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-sm shrink-0">note</span>
                        <span><strong>Nota interna:</strong> {lead.notas_admin}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-stretch sm:items-center gap-2">
                    {/* Status Changer */}
                    <select
                      value={lead.estado}
                      onChange={(e) => handleLeadStatusChange(lead.id, e.target.value as LeadStatus)}
                      className="bg-surface-container-lowest border border-surface-container-highest text-on-surface text-xs font-label-telemetry px-2.5 py-1.5 focus:outline-none flex-grow sm:flex-grow-0"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En búsqueda">En búsqueda</option>
                      <option value="Contactado">Contactado</option>
                      <option value="Completado">Completado</option>
                      <option value="Sin respuesta">Sin respuesta</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>

                    {/* WhatsApp Action button */}
                    <a
                      href={getWhatsAppLeadUrl(lead)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-primary-container hover:bg-surface-tint text-on-primary-container font-headline-sm text-xs uppercase flex items-center justify-center gap-1 font-bold transition-colors whitespace-nowrap flex-grow sm:flex-grow-0"
                    >
                      <span className="material-symbols-outlined text-sm">chat</span>
                      <span>WhatsApp</span>
                    </a>

                    {/* Editar Encargo */}
                    <button
                      onClick={() => handleStartEditLead(lead)}
                      className="px-2.5 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-surface-container-highest font-label-telemetry text-xs uppercase flex items-center justify-center gap-1 transition-colors"
                      title="Editar notas y detalles del encargo"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>Editar</span>
                    </button>

                    {/* Eliminar Encargo */}
                    <button
                      onClick={() => handleDeleteLead(lead.id, lead.nombre)}
                      className="p-1.5 text-outline hover:text-race-red hover:bg-surface-container-highest transition-colors border border-surface-container-highest"
                      title="Eliminar encargo"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
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
        <div className="bg-surface-container-low border border-surface-container p-4 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <h2 className="font-headline-lg text-lg sm:text-xl uppercase tracking-wider text-on-surface">
              Publicaciones Comunitarias ({community.length})
            </h2>
            <span className="font-label-telemetry text-xs text-outline">TABLE: COMMUNITY_POSTS</span>
          </div>

          {community.length === 0 ? (
            <div className="p-8 text-center text-outline font-label-telemetry bg-surface-container border border-surface-container">
              No hay publicaciones comunitarias registradas aún.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {community.map((item) => (
                <div
                  key={item.id}
                  className={`bg-surface-container border p-3 sm:p-4 flex flex-col xs:flex-row gap-3 sm:gap-4 relative ${
                    item.approved
                      ? 'border-surface-container-high'
                      : 'border-amber-500/60 bg-amber-950/10'
                  }`}
                >
                  <div className="relative w-full xs:w-24 h-40 xs:h-24 bg-surface-container-lowest flex-shrink-0 overflow-hidden border border-surface-container">
                    <Image src={item.image_url} alt={item.featured_piece} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col justify-between flex-grow min-w-0">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-headline-sm uppercase text-sm text-on-surface font-bold truncate">
                          {item.collector_handle}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-label-telemetry text-xs text-primary-container">
                            ★ {item.rating}/5
                          </span>
                          {/* Approval badge */}
                          <button
                            onClick={() => handleToggleCommunityApproval(item)}
                            className={`text-[10px] uppercase font-label-telemetry px-2 py-0.5 border font-bold transition-all ${
                              item.approved
                                ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500 hover:bg-emerald-800/40'
                                : 'bg-amber-500 text-black border-amber-400 hover:bg-amber-400 animate-pulse'
                            }`}
                            title={item.approved ? 'Hacer clic para ocultar de la web' : 'Hacer clic para aprobar y publicar'}
                          >
                            {item.approved ? '✓ Publicado' : '⏳ Aprobar'}
                          </button>
                        </div>
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
                      <div className="flex items-center gap-2">
                        <span className="text-primary-container uppercase">{item.tag}</span>
                        {/* Delete community message button */}
                        <button
                          onClick={() => handleDeleteCommunityPost(item.id, item.collector_handle)}
                          className="p-1 text-outline hover:text-race-red transition-colors"
                          title="Eliminar publicación permanentemente"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==============================================================================
          MODAL: EDITAR PRODUCTO (GESTIÓN DE INVENTARIO COMPLETA)
      ============================================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="w-full max-w-3xl bg-surface-container-low border border-surface-container p-4 sm:p-6 shadow-2xl relative my-4 sm:my-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container via-surface-tint to-secondary-container"></div>

            <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-4 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-primary-container shrink-0">edit_document</span>
                <h3 className="font-headline-md uppercase text-base sm:text-lg text-on-surface tracking-wider truncate">
                  Modificar // {editingProduct.modelo}
                </h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 min-h-[40px] min-w-[40px] flex items-center justify-center text-outline hover:text-on-surface transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Modelo */}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Nombre del Modelo *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.modelo}
                    onChange={(e) => setEditingProduct({ ...editingProduct, modelo: e.target.value })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  />
                </div>

                {/* Marca */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant flex items-center justify-between">
                    <span>Marca y Categoría Principal *</span>
                    <span className="text-[10px] text-primary-container">SINCRONIZADO CON TIENDA</span>
                  </label>
                  <select
                    value={editingProduct.marca}
                    onChange={(e) => setEditingProduct({ ...editingProduct, marca: e.target.value })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  >
                    {CATALOG_BRANDS.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Escala */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Escala *
                  </label>
                  <select
                    value={editingProduct.escala}
                    onChange={(e) => setEditingProduct({ ...editingProduct, escala: e.target.value })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  >
                    {CATALOG_SCALES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categoria */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                      Temática / Categoría *
                    </label>
                    <span className="text-[10px] font-label-telemetry text-outline">
                      Elegí o escribí
                    </span>
                  </div>
                  <input
                    type="text"
                    list="theme-suggestions-edit"
                    value={editingProduct.categoria}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoria: e.target.value })}
                    placeholder="Ej: Línea Premium, JDM, Básicos..."
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  />
                  <datalist id="theme-suggestions-edit">
                    {CATALOG_THEMES.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>

                {/* Serie */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Serie / Colección
                  </label>
                  <input
                    type="text"
                    value={editingProduct.serie || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, serie: e.target.value })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  />
                </div>

                {/* Precio */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Precio ($ ARS) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingProduct.precio}
                    onChange={(e) => setEditingProduct({ ...editingProduct, precio: Number(e.target.value) })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  />
                </div>

                {/* Stock */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Stock Disponible *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
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
                    value={editingProduct.anio}
                    onChange={(e) => setEditingProduct({ ...editingProduct, anio: Number(e.target.value) })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  />
                </div>

                {/* Estado del Blister */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Estado del Blíster
                  </label>
                  <select
                    value={editingProduct.estado_blister}
                    onChange={(e) => setEditingProduct({ ...editingProduct, estado_blister: e.target.value as BlisterCondition })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  >
                    {CATALOG_BLISTER_CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles: Destacado y Activo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-surface-container border border-surface-container-high">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingProduct.destacado}
                    onChange={(e) => setEditingProduct({ ...editingProduct, destacado: e.target.checked })}
                    className="accent-primary-container w-4 h-4 cursor-pointer"
                  />
                  <span className="font-label-telemetry text-xs uppercase text-on-surface">
                    Exhibir en "Destacados" de la Home
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingProduct.activo}
                    onChange={(e) => setEditingProduct({ ...editingProduct, activo: e.target.checked })}
                    className="accent-secondary-container w-4 h-4 cursor-pointer"
                  />
                  <span className="font-label-telemetry text-xs uppercase text-on-surface">
                    Producto Activo (Visible en Tienda)
                  </span>
                </label>
              </div>

              {/* Imagen del Producto */}
              <div className="flex flex-col gap-2 p-3 bg-surface-container border border-surface-container-high">
                <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                  Fotografía de la Pieza
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-20 h-20 bg-surface-container-lowest border border-surface-container flex-shrink-0 overflow-hidden">
                    {editingProduct.imagen_url ? (
                      <Image src={editingProduct.imagen_url} alt="Preview" fill className="object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-outline text-3xl flex items-center justify-center h-full">
                        image
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-grow w-full">
                    <input
                      type="text"
                      placeholder="URL pública de la imagen"
                      value={editingProduct.imagen_url}
                      onChange={(e) => setEditingProduct({ ...editingProduct, imagen_url: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-surface-container-highest px-3 py-1.5 text-xs text-on-surface focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-label-telemetry uppercase cursor-pointer flex items-center gap-1.5 border border-surface-container-highest">
                        <span className="material-symbols-outlined text-sm">upload</span>
                        <span>{editImageUploading ? 'Subiendo...' : 'Subir nueva foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditProductImageUpload}
                          disabled={editImageUploading}
                          className="hidden"
                        />
                      </label>
                      {editImageUploading && <span className="text-xs text-primary-container animate-pulse">Cargando a Supabase...</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="flex flex-col gap-1">
                <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                  Descripción y Detalles Técnicos (Ruedas, librea, tampografía)
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.descripcion || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, descripcion: e.target.value })}
                  className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-telemetry text-xs uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEditProduct}
                  className="px-6 py-2 bg-primary-container hover:bg-surface-tint text-on-primary-container font-headline-md uppercase text-xs tracking-wider flex items-center gap-2 font-bold shadow-md transition-all disabled:opacity-60"
                >
                  {savingEditProduct ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                      <span>GUARDANDO...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">save</span>
                      <span>GUARDAR CAMBIOS</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================================
          MODAL: EDITAR ENCARGO DE CLIENTE (LEAD)
      ============================================================================== */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="w-full max-w-xl bg-surface-container-low border border-surface-container p-4 sm:p-6 shadow-2xl relative my-4 sm:my-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary-container via-primary-container to-surface-tint"></div>

            <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-4 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-secondary shrink-0">assignment</span>
                <h3 className="font-headline-md uppercase text-base sm:text-lg text-on-surface tracking-wider truncate">
                  Editar // {editingLead.nombre}
                </h3>
              </div>
              <button
                onClick={() => setEditingLead(null)}
                className="p-1 min-h-[40px] min-w-[40px] flex items-center justify-center text-outline hover:text-on-surface transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveLeadEdit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Nombre del Coleccionista
                  </label>
                  <input
                    type="text"
                    value={editingLead.nombre}
                    onChange={(e) => setEditingLead({ ...editingLead, nombre: e.target.value })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editingLead.telefono}
                    onChange={(e) => setEditingLead({ ...editingLead, telefono: e.target.value })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Modelo Buscado
                  </label>
                  <input
                    type="text"
                    value={editingLead.modelo_buscado}
                    onChange={(e) => setEditingLead({ ...editingLead, modelo_buscado: e.target.value })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Línea / Serie
                  </label>
                  <input
                    type="text"
                    value={editingLead.serie || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, serie: e.target.value })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Presupuesto Máximo
                  </label>
                  <input
                    type="text"
                    value={editingLead.presupuesto || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, presupuesto: e.target.value })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="font-label-telemetry text-xs uppercase text-on-surface-variant">
                    Estado del Encargo
                  </label>
                  <select
                    value={editingLead.estado}
                    onChange={(e) => setEditingLead({ ...editingLead, estado: e.target.value as LeadStatus })}
                    className="w-full bg-surface-container border border-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En búsqueda">En búsqueda</option>
                    <option value="Contactado">Contactado</option>
                    <option value="Completado">Completado</option>
                    <option value="Sin respuesta">Sin respuesta</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Notas internas del administrador */}
              <div className="flex flex-col gap-1">
                <label className="font-label-telemetry text-xs uppercase text-amber-300">
                  Notas Internas de Gestión (Solo visibles para el administrador)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej: Proveedor cotizó $24.000 el 18/10. Esperando respuesta de cliente..."
                  value={editingLead.notas_admin || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, notas_admin: e.target.value })}
                  className="w-full bg-surface-container border border-amber-500/30 px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-telemetry text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEditLead}
                  className="px-6 py-2 bg-secondary-container hover:bg-secondary text-on-secondary font-headline-md uppercase text-xs tracking-wider flex items-center gap-2 font-bold shadow-md transition-all disabled:opacity-60"
                >
                  {savingEditLead ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                      <span>GUARDANDO...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">save</span>
                      <span>ACTUALIZAR ENCARGO</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================================
          TOAST FEEDBACK FLOTANTE
      ============================================================================== */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 border shadow-2xl transition-all font-label-telemetry text-xs uppercase tracking-wider ${
            toast.type === 'error'
              ? 'bg-race-red/90 text-white border-white/20'
              : toast.type === 'info'
              ? 'bg-surface-container-highest text-on-surface border-surface-container'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'check_circle'}
          </span>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
