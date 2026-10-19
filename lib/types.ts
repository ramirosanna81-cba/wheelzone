export type BlisterCondition = 'Impecable' | 'Muy Bueno' | 'Desgaste / Abrir' | 'Loose';

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
