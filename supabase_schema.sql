-- ==============================================================================
-- SCHEMA SUPABASE: WHEELS ZONE - PLATAFORMA DE COLECCIONABLES Y HOT WHEELS
-- ==============================================================================
-- Este script crea las tablas, índices, políticas de seguridad (RLS) y configuración
-- de almacenamiento (Storage) necesarias para desplegar la plataforma.
-- Ejecutá este script en el SQL Editor de tu proyecto en Supabase (https://app.supabase.com).

-- Habilitar extensión pgcrypto para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABLA: products (Catálogo de Coleccionables y Hot Wheels)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marca TEXT NOT NULL,                     -- Ej: 'Hot Wheels', 'Matchbox', 'Kaido House', 'Mini GT'
    modelo TEXT NOT NULL,                    -- Ej: 'Nissan Skyline GT-R (BNR34) Nismo'
    escala TEXT NOT NULL DEFAULT '1:64',     -- Ej: '1:64', '1:43', '1:24', '1:18'
    anio INTEGER NOT NULL DEFAULT 2024,      -- Ej: 2024
    categoria TEXT NOT NULL,                 -- Ej: 'Super Treasure Hunt ($TH)', 'Car Culture', 'JDM', 'Muscle Cars'
    serie TEXT DEFAULT '',                   -- Ej: 'Fast & Furious Premium', 'Boulevard'
    precio NUMERIC(12, 2) NOT NULL,          -- Ej: 18500.00
    stock INTEGER NOT NULL DEFAULT 1,        -- Unidades disponibles
    imagen_url TEXT NOT NULL,                -- URL en Supabase Storage o CDN
    estado_blister TEXT NOT NULL DEFAULT 'Impecable', -- 'Impecable', 'Muy Bueno', 'Desgaste / Abrir', 'Loose'
    destacado BOOLEAN NOT NULL DEFAULT false,-- Si figura en la vitrina de la página de inicio
    descripcion TEXT DEFAULT '',             -- Detalles técnicos, tampografía, ruedas Real Riders
    activo BOOLEAN NOT NULL DEFAULT true,    -- Pausar o activar en la tienda
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para búsquedas y filtros rápidos
CREATE INDEX IF NOT EXISTS idx_products_marca ON public.products(marca);
CREATE INDEX IF NOT EXISTS idx_products_categoria ON public.products(categoria);
CREATE INDEX IF NOT EXISTS idx_products_escala ON public.products(escala);
CREATE INDEX IF NOT EXISTS idx_products_destacado ON public.products(destacado);
CREATE INDEX IF NOT EXISTS idx_products_activo ON public.products(activo);

-- ==============================================================================
-- 2. TABLA: leads_encargos (Búsquedas Especiales y Cacería de Piezas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leads_encargos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,                    -- Nombre del coleccionista
    telefono TEXT NOT NULL,                  -- WhatsApp para contacto
    email TEXT DEFAULT '',                   -- Correo optativo
    serie TEXT DEFAULT '',                   -- Línea buscada (RLC, STH, etc.)
    modelo_buscado TEXT NOT NULL,            -- Modelo exacto y especificaciones
    estado_empaque TEXT DEFAULT 'Blíster Mint C-10', -- Condición requerida
    presupuesto TEXT DEFAULT '',             -- Rango de inversión dispuesto
    estado TEXT NOT NULL DEFAULT 'Pendiente',-- 'Pendiente', 'En búsqueda', 'Contactado'
    notas_admin TEXT DEFAULT '',             -- Anotaciones internas del administrador
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_estado ON public.leads_encargos(estado);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads_encargos(created_at DESC);

-- ==============================================================================
-- 3. TABLA: community_posts (El Garaje de la Comunidad / Reseñas de Clientes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collector_handle TEXT NOT NULL,          -- Ej: '@diecast_racing' o 'Lucas G.'
    location TEXT NOT NULL,                  -- Ej: 'Córdoba, Capital'
    featured_piece TEXT NOT NULL,            -- Ej: 'Datsun 510 Wagon STH 2024'
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    review TEXT NOT NULL,                    -- Testimonio o estado de recepción
    tag TEXT NOT NULL DEFAULT 'Vitrina Completa', -- 'Vitrina Completa', 'Unboxing Blíster', 'Custom Mod', 'STH Caza'
    image_url TEXT NOT NULL,                 -- Fotografía subida
    likes INTEGER NOT NULL DEFAULT 0,
    approved BOOLEAN NOT NULL DEFAULT true,  -- Moderación
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_approved ON public.community_posts(approved);
CREATE INDEX IF NOT EXISTS idx_community_created_at ON public.community_posts(created_at DESC);

-- ==============================================================================
-- 4. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads_encargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Products: Lectura pública; Escritura y edición solo administradores autenticados
CREATE POLICY "Productos públicos para visitantes"
    ON public.products FOR SELECT
    USING (activo = true OR auth.role() = 'authenticated');

CREATE POLICY "Solo administradores pueden crear productos"
    ON public.products FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo administradores pueden modificar productos"
    ON public.products FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Solo administradores pueden eliminar productos"
    ON public.products FOR DELETE
    USING (auth.role() = 'authenticated');

-- Leads: Cualquier visitante puede enviar un encargo; Solo admin puede leerlos y modificarlos
CREATE POLICY "Visitantes pueden enviar solicitudes de encargo"
    ON public.leads_encargos FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Solo administradores pueden ver los encargos"
    ON public.leads_encargos FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Solo administradores pueden actualizar estado de encargos"
    ON public.leads_encargos FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Solo administradores pueden eliminar encargos"
    ON public.leads_encargos FOR DELETE
    USING (auth.role() = 'authenticated');

-- Community: Lectura de posts aprobados; Envío público; Moderación por admin
CREATE POLICY "Cualquiera puede leer publicaciones comunitarias aprobadas"
    ON public.community_posts FOR SELECT
    USING (approved = true OR auth.role() = 'authenticated');

CREATE POLICY "Cualquiera puede publicar en la comunidad"
    ON public.community_posts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admin modera publicaciones comunitarias"
    ON public.community_posts FOR ALL
    USING (auth.role() = 'authenticated');

-- ==============================================================================
-- 5. BUCKET DE SUPABASE STORAGE (diecast-media)
-- ==============================================================================
-- Para crear el bucket desde el dashboard de Supabase:
-- 1. Ir a "Storage" -> "New bucket" -> Nombre: "diecast-media"
-- 2. Marcar como "Public bucket" (para permitir que las fotos se visualicen en la tienda)
-- 3. Políticas del bucket: Permitir inserción a autenticados o con anon key para comunidad.
