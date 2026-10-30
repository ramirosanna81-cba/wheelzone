export type BlisterCondition =
  | 'Impecable'
  | 'Muy Bueno'
  | 'Desgaste / Abrir'
  | 'Suelto Nuevo'
  | 'Suelto Usado'
  | 'Loose'; // Retrocompatibilidad

export type DestacadoTipo = 'semanal' | 'mensual' | 'spotlight' | 'general';

export interface Product {
  id: string;
  marca: string;
  modelo: string;
  escala: string;
  anio: number;
  categoria: string;
  serie?: string;
  precio: number;
  stock: number;
  imagen_url: string;
  estado_blister: BlisterCondition;
  destacado: boolean;
  destacado_tipo?: DestacadoTipo;
  destacado_tag?: string;
  hero_order?: number;
  descripcion?: string;
  activo: boolean;
  created_at?: string;
}

export type LeadStatus = 'Pendiente' | 'En búsqueda' | 'Contactado' | 'Completado' | 'Sin respuesta' | 'Cancelado';

export interface LeadEncargo {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  serie?: string;
  modelo_buscado: string;
  estado_empaque?: string;
  presupuesto?: string;
  estado: LeadStatus;
  notas_admin?: string;
  created_at?: string;
}

export interface CommunityPost {
  id: string;
  collector_handle: string;
  location: string;
  featured_piece: string;
  rating: number;
  review: string;
  tag: string;
  image_url: string;
  likes: number;
  approved: boolean;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DiecastEvent {
  id: string;
  title: string;
  city: string;
  start_date: string; // Formato YYYY-MM-DD
  end_date?: string | null; // Formato YYYY-MM-DD opcional
  time_text: string;
  image_url: string;
  is_special: boolean;
  special_text?: string | null;
  maps_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

