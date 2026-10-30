-- ==============================================================================
-- MIGRACIÓN SUPABASE: TABLA DE EVENTOS Y STORAGE BUCKET (WHEELS ZONE)
-- ==============================================================================
-- Ejecutar en el SQL Editor de tu dashboard de Supabase (https://app.supabase.com)

-- 1. Crear tabla de eventos
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

-- 2. Índices de optimización
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (start_date ASC);
CREATE INDEX IF NOT EXISTS idx_events_active ON public.events (is_active);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de seguridad (RLS) para la tabla events
DROP POLICY IF EXISTS "Lectura pública de eventos" ON public.events;
CREATE POLICY "Lectura pública de eventos"
ON public.events FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Operaciones autenticadas para administradores" ON public.events;
CREATE POLICY "Operaciones autenticadas para administradores"
ON public.events FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Bucket de Storage para fotos de eventos y flyers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Políticas de acceso a storage.objects para el bucket 'events'
DROP POLICY IF EXISTS "Lectura pública de eventos" ON storage.objects;
CREATE POLICY "Lectura pública de eventos"
ON storage.objects FOR SELECT
USING (bucket_id = 'events');

DROP POLICY IF EXISTS "Subida autenticada para administradores" ON storage.objects;
CREATE POLICY "Subida autenticada para administradores"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'events');

DROP POLICY IF EXISTS "Actualización autenticada para administradores" ON storage.objects;
CREATE POLICY "Actualización autenticada para administradores"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'events');

DROP POLICY IF EXISTS "Eliminación autenticada para administradores" ON storage.objects;
CREATE POLICY "Eliminación autenticada para administradores"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'events');

