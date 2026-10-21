import { createClient } from '@supabase/supabase-js';
import { Product, LeadEncargo, CommunityPost, LeadStatus } from './types';
import { INITIAL_PRODUCTS, INITIAL_LEADS, INITIAL_COMMUNITY_POSTS } from './mock-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('tu-proyecto')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==============================================================================
// LOCAL STORAGE STORE HELPERS (GRACEFUL OFFLINE / DEMO FALLBACK)
// ==============================================================================
const STORAGE_KEYS = {
  PRODUCTS: 'wheelszone_products_v1',
  LEADS: 'wheelszone_leads_v1',
  COMMUNITY: 'wheelszone_community_v1',
};

function getLocalData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Error saving to localStorage:', err);
  }
}

// ==============================================================================
// DATA SERVICES: PRODUCTS
// ==============================================================================
export async function fetchProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setLocalData(STORAGE_KEYS.PRODUCTS, data);
        return data as Product[];
      }
    } catch (err) {
      console.warn('Supabase fetch products error, using local fallback:', err);
    }
  }

  // Fallback to local storage or initial seed
  return getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (!error && data) {
        return data as Product;
      }
    } catch (err) {
      console.warn('Supabase insert product error, using local fallback:', err);
    }
  }

  const current = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updated = [newProduct, ...current];
  setLocalData(STORAGE_KEYS.PRODUCTS, updated);
  return newProduct;
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<{ success: boolean; product?: Product; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const current = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const updatedList = current.map((p) => (p.id === id ? { ...p, ...(data as Product) } : p));
        setLocalData(STORAGE_KEYS.PRODUCTS, updatedList);
        return { success: true, product: data as Product };
      }

      if (error) {
        console.warn('Supabase update product error:', error);
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      console.warn('Supabase update product exception:', err);
      return { success: false, error: err.message || 'Error al actualizar producto' };
    }
  }

  const current = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
  setLocalData(STORAGE_KEYS.PRODUCTS, updated);
  const found = updated.find((p) => p.id === id);
  return { success: true, product: found };
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      // Intentar borrado en Supabase
      const { data, error } = await supabase.from('products').delete().eq('id', id).select();

      if (error) {
        console.error('Supabase delete product error:', error);
        return { success: false, error: error.message };
      }

      if (data && data.length > 0) {
        const current = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        setLocalData(STORAGE_KEYS.PRODUCTS, current.filter((p) => p.id !== id));
        return { success: true };
      }

      // Si data está vacío (0 filas eliminadas), verificar sesión
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return {
          success: false,
          error: 'Tu sesión de administrador ha expirado o no estás autenticado en Supabase. Por favor, reingresá al panel.',
        };
      }

      return {
        success: false,
        error: 'No se encontró el producto en la base de datos para eliminar.',
      };
    } catch (err: any) {
      console.warn('Supabase delete product exception, using local fallback:', err);
      return { success: false, error: err.message || 'Error al eliminar producto' };
    }
  }

  const current = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updated = current.filter((p) => p.id !== id);
  setLocalData(STORAGE_KEYS.PRODUCTS, updated);
  return { success: true };
}

// ==============================================================================
// DATA SERVICES: LEADS / ENCARGOS ESPECIALES
// ==============================================================================
export async function fetchLeads(): Promise<LeadEncargo[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('leads_encargos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as LeadEncargo[];
      }
    } catch (err) {
      console.warn('Supabase fetch leads error, using local fallback:', err);
    }
  }

  return getLocalData<LeadEncargo[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
}

export async function createLead(lead: Omit<LeadEncargo, 'id' | 'created_at' | 'estado'>): Promise<LeadEncargo> {
  const newLead: LeadEncargo = {
    ...lead,
    id: `lead-${Date.now()}`,
    estado: 'Pendiente',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('leads_encargos')
        .insert([{ ...lead, estado: 'Pendiente' }])
        .select()
        .single();

      if (!error && data) {
        return data as LeadEncargo;
      }
    } catch (err) {
      console.warn('Supabase insert lead error, using local fallback:', err);
    }
  }

  const current = getLocalData<LeadEncargo[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
  const updated = [newLead, ...current];
  setLocalData(STORAGE_KEYS.LEADS, updated);
  return newLead;
}

export async function updateLead(
  id: string,
  updates: Partial<LeadEncargo>
): Promise<{ success: boolean; lead?: LeadEncargo; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('leads_encargos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const current = getLocalData<LeadEncargo[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
        const updatedList = current.map((l) => (l.id === id ? { ...l, ...(data as LeadEncargo) } : l));
        setLocalData(STORAGE_KEYS.LEADS, updatedList);
        return { success: true, lead: data as LeadEncargo };
      }

      if (error) {
        console.warn('Supabase update lead error:', error);
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      console.warn('Supabase update lead exception:', err);
      return { success: false, error: err.message || 'Error al actualizar encargo' };
    }
  }

  const current = getLocalData<LeadEncargo[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
  const updated = current.map((l) => (l.id === id ? { ...l, ...updates } : l));
  setLocalData(STORAGE_KEYS.LEADS, updated);
  const found = updated.find((l) => l.id === id);
  return { success: true, lead: found };
}

export async function updateLeadStatus(id: string, status: LeadStatus, adminNotes?: string): Promise<boolean> {
  const res = await updateLead(id, { estado: status, ...(adminNotes !== undefined ? { notas_admin: adminNotes } : {}) });
  return res.success;
}

export async function deleteLead(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('leads_encargos').delete().eq('id', id).select();

      if (!error && data && data.length > 0) {
        const current = getLocalData<LeadEncargo[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
        setLocalData(STORAGE_KEYS.LEADS, current.filter((l) => l.id !== id));
        return { success: true };
      }

      // Si RLS bloquea el borrado permanente por falta de policy DELETE en Supabase,
      // actualizamos el estado a 'Cancelado' como fallback para que no moleste
      if (!error && (!data || data.length === 0)) {
        await supabase.from('leads_encargos').update({ estado: 'Cancelado' }).eq('id', id);
        const current = getLocalData<LeadEncargo[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
        setLocalData(STORAGE_KEYS.LEADS, current.filter((l) => l.id !== id));
        return { success: true };
      }

      if (error) {
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      console.warn('Supabase delete lead error, using local fallback:', err);
    }
  }

  const current = getLocalData<LeadEncargo[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
  const updated = current.filter((l) => l.id !== id);
  setLocalData(STORAGE_KEYS.LEADS, updated);
  return { success: true };
}

// ==============================================================================
// DATA SERVICES: COMMUNITY POSTS
// ==============================================================================
export async function fetchCommunityPosts(): Promise<CommunityPost[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as CommunityPost[];
      }
    } catch (err) {
      console.warn('Supabase fetch community error, using local fallback:', err);
    }
  }

  return getLocalData<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, INITIAL_COMMUNITY_POSTS);
}

export async function createCommunityPost(post: Omit<CommunityPost, 'id' | 'likes' | 'approved' | 'created_at'>): Promise<CommunityPost> {
  const newPost: CommunityPost = {
    ...post,
    id: `post-${Date.now()}`,
    likes: 1,
    approved: true,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert([{ ...post, likes: 1, approved: true }])
        .select()
        .single();

      if (!error && data) {
        return data as CommunityPost;
      }
    } catch (err) {
      console.warn('Supabase insert community post error, using local fallback:', err);
    }
  }

  const current = getLocalData<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, INITIAL_COMMUNITY_POSTS);
  const updated = [newPost, ...current];
  setLocalData(STORAGE_KEYS.COMMUNITY, updated);
  return newPost;
}

export async function likeCommunityPost(id: string): Promise<number> {
  const current = getLocalData<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, INITIAL_COMMUNITY_POSTS);
  let newLikes = 1;
  const updated = current.map((p) => {
    if (p.id === id) {
      newLikes = p.likes + 1;
      return { ...p, likes: newLikes };
    }
    return p;
  });
  setLocalData(STORAGE_KEYS.COMMUNITY, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('community_posts').update({ likes: newLikes }).eq('id', id);
    } catch (err) {
      console.warn('Supabase like error:', err);
    }
  }

  return newLikes;
}

export async function deleteCommunityPost(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('community_posts').delete().eq('id', id).select();

      if (!error && data && data.length > 0) {
        const current = getLocalData<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, INITIAL_COMMUNITY_POSTS);
        setLocalData(STORAGE_KEYS.COMMUNITY, current.filter((p) => p.id !== id));
        return { success: true };
      }

      if (error) {
        console.error('Supabase delete community post error:', error);
        return { success: false, error: error.message };
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return {
          success: false,
          error: 'Tu sesión ha expirado. Por favor, volvé a iniciar sesión en el panel para moderar la comunidad.',
        };
      }
    } catch (err: any) {
      console.warn('Supabase delete community post error, using local fallback:', err);
    }
  }

  const current = getLocalData<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, INITIAL_COMMUNITY_POSTS);
  const updated = current.filter((p) => p.id !== id);
  setLocalData(STORAGE_KEYS.COMMUNITY, updated);
  return { success: true };
}

export async function toggleCommunityPostApproval(id: string, approved: boolean): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('community_posts').update({ approved }).eq('id', id);
      if (!error) {
        const current = getLocalData<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, INITIAL_COMMUNITY_POSTS);
        setLocalData(
          STORAGE_KEYS.COMMUNITY,
          current.map((p) => (p.id === id ? { ...p, approved } : p))
        );
        return true;
      }
    } catch (err) {
      console.warn('Supabase toggle community approval error:', err);
    }
  }

  const current = getLocalData<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, INITIAL_COMMUNITY_POSTS);
  setLocalData(
    STORAGE_KEYS.COMMUNITY,
    current.map((p) => (p.id === id ? { ...p, approved } : p))
  );
  return true;
}

// ==============================================================================
// STORAGE UPLOAD (IMAGE COMPRESSION / WEBP)
// ==============================================================================
export async function uploadImageToStorage(file: File, bucket = 'diecast-media'): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'webp';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (!uploadError) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
      }
    } catch (err) {
      console.warn('Supabase Storage upload error, falling back to base64 preview:', err);
    }
  }

  // Local fallback: generate a base64 DataURL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}
