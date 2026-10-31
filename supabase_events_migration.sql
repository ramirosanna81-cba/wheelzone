-- ==============================================================================
-- MIGRACIÓN SUPABASE: TABLA DE EVENTOS Y STORAGE BUCKET (WHEELS ZONE)
-- ==============================================================================
-- 1. Copiá todo este contenido.
-- 2. Entrá a tu panel de Supabase: https://supabase.com/dashboard/project/olkumxhhhcviuuhevaag/sql/new
-- 3. Pegalo en el editor SQL y hacé clic en "Run" (o presioná Ctrl + Enter).

-- 1. Crear tabla de eventos si no existe
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

-- 2. Índices para ordenamiento y consultas rápidas
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (start_date ASC);
CREATE INDEX IF NOT EXISTS idx_events_active ON public.events (is_active);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para la tabla events (Permite lectura y escritura desde la web / admin)
DROP POLICY IF EXISTS "Lectura pública de eventos" ON public.events;
CREATE POLICY "Lectura pública de eventos"
ON public.events FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Operaciones autenticadas para administradores" ON public.events;
DROP POLICY IF EXISTS "Operaciones completas para eventos" ON public.events;
CREATE POLICY "Operaciones completas para eventos"
ON public.events FOR ALL
USING (true)
WITH CHECK (true);

-- 5. Crear el bucket de Storage 'events' si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('events', 'events', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 6. Políticas de acceso para el bucket 'events' en storage.objects
DROP POLICY IF EXISTS "Lectura pública de eventos" ON storage.objects;
DROP POLICY IF EXISTS "Lectura pública bucket events" ON storage.objects;
CREATE POLICY "Lectura pública bucket events"
ON storage.objects FOR SELECT
USING (bucket_id = 'events');

DROP POLICY IF EXISTS "Subida autenticada para administradores" ON storage.objects;
DROP POLICY IF EXISTS "Subida para bucket events" ON storage.objects;
CREATE POLICY "Subida para bucket events"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'events');

DROP POLICY IF EXISTS "Actualización autenticada para administradores" ON storage.objects;
DROP POLICY IF EXISTS "Actualización para bucket events" ON storage.objects;
CREATE POLICY "Actualización para bucket events"
ON storage.objects FOR UPDATE
USING (bucket_id = 'events');

DROP POLICY IF EXISTS "Eliminación autenticada para administradores" ON storage.objects;
DROP POLICY IF EXISTS "Eliminación para bucket events" ON storage.objects;
CREATE POLICY "Eliminación para bucket events"
ON storage.objects FOR DELETE
USING (bucket_id = 'events');
