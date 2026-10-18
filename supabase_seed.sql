-- ==============================================================================
-- WHEELS ZONE - SEED & STORAGE SETUP SCRIPT
-- ==============================================================================
-- Ejecutar en: https://supabase.com/dashboard/project/olkumxhhhcviuuhevaag/sql/new

-- 1. Confirmar el usuario administrador para permitir login en /admin
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'admin@wheelszone.com';

-- 2. Crear Bucket de Storage 'diecast-media' y políticas de acceso
INSERT INTO storage.buckets (id, name, public) 
VALUES ('diecast-media', 'diecast-media', true) 
ON CONFLICT (id) DO NOTHING;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read diecast-media') THEN
        CREATE POLICY "Public Read diecast-media" ON storage.objects FOR SELECT USING (bucket_id = 'diecast-media');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth Upload diecast-media') THEN
        CREATE POLICY "Auth Upload diecast-media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'diecast-media');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth Update diecast-media') THEN
        CREATE POLICY "Auth Update diecast-media" ON storage.objects FOR UPDATE USING (bucket_id = 'diecast-media');
    END IF;
END $$;

-- 3. Cargar los 10 productos iniciales del catálogo Wheels Zone
INSERT INTO public.products (marca, modelo, escala, anio, categoria, serie, precio, stock, imagen_url, estado_blister, destacado, descripcion, activo)
VALUES
('Hot Wheels', 'Nissan Skyline GT-R (BNR34) Nismo', '1:64', 2024, 'Car Culture', 'Fast & Furious Premium // Nismo', 18500.00, 2, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQvZS12mbKb8nmB3EtCJiJFGVrC8KgusEcf8NfnxbrNmoTRwX7Yxzw1u9EtVLnYTfrsjRSYO3ATU-owjBX_Jt-uaSJrJMDKvyVvxlg5A3eajb3_AtPwcMS-WHlSCQyfOwAIaBHtg8tJK2GwCJbgRn6J6gsq45t2aqHvbzhLNwe0kceg2QHxRLFGhfuqRi1TaD3VU6AChARkeYG4ke0XBy1ICk9BO-igcP8TW9y3X_nOG6RIB_mXQbXcA', 'Impecable', true, 'Pintura plateada perlada, franjas azules metalizadas y rines calzados con neumáticos de goma Real Riders de alto detalle. Tarjeta impecable sin pliegues.', true),

('Hot Wheels', '1971 Datsun 510 Wagon ($TH)', '1:64', 2024, 'Super Treasure Hunt ($TH)', 'Super Treasure Hunt 2024', 45000.00, 1, 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_az99x9bCZCVwF9P0TwGECOGI-w8KiAdraHPafMT63FXlKOPC9cB2BI0xneZZwpWWn_P1pTOxKnLbAoBca-56qg_hmaUq9-xIWYuho2gUh7mHhjnDmGBnmw_Yrhwtq5Hb9eZlKGcCj_ryfLJCjhqiHdv5U8qDBHnr3A68y-YdBYB5VUX8Bg87cUjT2VV_yc5PzmLkyporBN6sbQRJvrmJ8_iI5TxRnb3rvgzd8iEj-Za75S8XIM_Ymw', 'Impecable', true, 'Pintura Spectraflame esmeralda profundo con flama TH oculta. Chasis pulido y rines de aleación con cubiertas de goma Real Riders. Pieza de museo C-10.', true),

('Hot Wheels', 'Porsche 911 GT3 RS', '1:64', 2024, 'Car Culture', 'Speed Machines Series', 16200.00, 3, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAf05iVDujQ02hSHbdardm2HKIdKsXoKj6ivrvd3dXxQBD6LPmvcG2pdeDXGRY1gFJiGmYQfMlnZIWLuOwSrYeHSknZlEjPodwA8alVKv03x2yRxSV6r_1rIqVZo8b95yh4uNvhvSekEAIEB_tkPYGjbJ-A5xawOJ2K-jkvVdCQza71t-JPSXgG1srXZg4fknQNQO5xX8-G7LqI2dwlyVNye5zMo6Mq6bVXY7LWekclls5mkrBaKr0cug', 'Muy Bueno', true, 'Alerón GT3 de alto downforce, librea Shark Blue con rines de magnesio blancos. Acabado de carrocería en matriz de zinc pesado.', true),

('Hot Wheels', 'Lamborghini Countach LP 5000', '1:64', 2024, 'Boulevard', 'HW Boulevard Premium', 17800.00, 1, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfzyAZNmzeVo43xtpoNjwbdV9dYT1QObnv8IJ_tctUW4Ubwyz3SwV8xGQQDTt9YRf7k9akJLLbD6AqPfOQ7CNnJSIkRjcMEYD3BvuAZAan7JOA-NJt8fby9ppeKYFbQSvpu2l5OGqahzwoGvCtvfmu7BpMU2yTH5WHEAqhis_T-EQs8ZyqAdRfv37PGTuDCxoInkLYuQxyvRNqz9FNQ-Mnd1MVRNYWHUe4rbRtJKxdLDf6nIAcWhhpmQ', 'Impecable', true, 'Clásico de los 80s con perfil en cuña aerodinámico, llantas doradas estilo dial telefónico y tarjeta con arte Boulevard oficial intacta.', true),

('Hot Wheels', 'Mazda RX-7 FD3S Drift Edition', '1:64', 2024, 'JDM', 'Japanese Classic Drifters', 14500.00, 4, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBPfeMUFDG8RGXUrTwYjP15n9BH0XlpjO3ckmXwo78OnAcQMgOj0NaBEBt3AwR2oItsuNjPvrFaXRuF7WcKuijOlv1Hc1S_8STFmucyk35wIrPE9Hm8p84EqPhQ4yRpTzk5mZjkYUZIK58DkLrI40RPrAZz7nfabzZZzt6u_SJR3_jm_s2yJIsL6re_1--WpVn1hl4xtQHCBRGzhSVG9Rxkh0_oBObr1RzVBzMeARKksrKtzf38e0A1g', 'Impecable', false, 'Widebody rocket bunny aero kit, rines de bronce custom con cubiertas de goma, carrocería amarilla con calcos de competición japoneses.', true),

('Hot Wheels', '1969 Ford Mustang Boss 302', '1:64', 2023, 'Muscle Cars', 'Vintage Muscle Icons', 13900.00, 2, 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7XkxITqxmPgchGpef9wPTCDqen4jZihWzmMIkpz2PBTPPp6ISFi94iIwlS9e4tpn44SxuZmv5NvoblnXG84BC_cNd9ukbbRvaaheK3JBZ0kegINdU_daE2Kr3ewpxfk82VBky_fLSQuocP5voIsTRn6ynTrbQFAGSsg41VP3qlwQOF0q8wYZhVYG2dqbH5JBAtguJh11yhNsZyyLudB16jAlbmjXt6HZHRi0TZfUuwNXZWZ_kVA75Jg', 'Muy Bueno', false, 'Pintura naranja mate Grabber Orange con franjas negras satinadas y número 15 de competición. Ruedas de trocha ancha.', true),

('Hot Wheels', 'Nissan Silvia S15 Nismo', '1:64', 2024, 'JDM', 'Boulevard Series // JDM', 19200.00, 2, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLgZfd9rRTZrfUI0UJraX0RohkXbjejvxPIpk4bvbDEd9VTfgRVo79wT0BZRGTE6t6kTrjKOJ-fnoyxmEntyCoK6SiwFQcMbCBchhbYNZmPcGQrMcVOBuPRcG-mZsva9s-BLT4Y39oWc6TM4aCfbv-JdBJKaNbsRHZfj7YoeT7frddVyTDhq9Oq_cr_G3tf-RTdoQydrfOPuI4JzlArbl3XdYYcZbUm3_ufACYBq9SRCo7FaeJmgR6TA', 'Impecable', false, 'Acabado plateado metalizado con capó imitación fibra de carbono y detalles aero Nismo rojos. Ruedas Real Riders de goma con llantas multirayo.', true),

('Hot Wheels', 'Chevrolet Corvette C8.R', '1:64', 2024, 'Car Culture', 'Circuit Legends', 15800.00, 3, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDS-QaLI9Ctp26tJL2TNelm7sT9pDiHs9pShZ9B-1Du7fDOHjlzWqQhr5aqY3HrbBcmv4Fk0UdW3YHljnhrQPEZEZxrzIPg7EKy8kG-WvWz4-WoJc0c-MBmCfvqEQbNipaiPtVMKvQUwM9mbPGLSvKOQQI0Ydx2PMg5Xq9wkBw930UA9rrobW5gtsBD0yBKjL0wqK79gjqojPeaqsR6N4mhi5mvB7Fi_TbFlLEtsE00bF8zgjZCmVLOqg', 'Impecable', false, 'Difusor aerodinámico y alerón trasero masivo GT, librea amarilla de competición y gris grafito. Clamshell protector rígido.', true),

('Kaido House', 'Toyota GR Yaris Pandem Widebody', '1:64', 2024, 'JDM', 'Kaido House x MiniGT', 26500.00, 1, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiVbdYhN-F5T_Za873bj8LOWe4gitegbJlSMQXYkTZ3z0_jAC9aQp9qrQVP6CJVESqe0ZzYX0cuvkI_Q8B7InK17cNxu0gXtMmSXylbAXrrgmjzeTg1yLoL8MiwPn3ZFazIdfz1vBRaIEYAHg29NTvPGKxaRDUwCZbTw05ogCfDZxatqB9qvWuVsmnQn6OMwfSLCPU9Qy9TnGGgFsqU1DFLq9ZTcfnRVuP_nOthJxhTuGua04SXV_pTQ', 'Impecable', false, 'Pintura blanca pura brillante con techo negro, ensanches de guardabarros agresivos Pandem y faros con lente de cristal real.', true),

('Matchbox', '1968 Dodge D-200 Sweptside', '1:64', 2023, 'Camionetas Off-Road', 'Matchbox Collectors Series', 12500.00, 2, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2dYhJYE8jz-j5-eztu3hIZzGk0TjQ2smkORIBgRx12PQs7jRZp8HClkOomXUGzleCywr5r9B5bCSj0mlVU1JQSHTWmRLsoFwCW_rBkrxz2vSGmh_-m9sRNlFe8uHB8DpWiJhncShMZm9oodUqG2zZcaXxWW_AouE3bQhybW5Jhq0DEX1NAhrxYrJ7t-C3XX6Y36MX-VXbKOsv3utDeVUQXh3vCj8ltKd7HH-9Ggzklbkgcql2fJ84oA', 'Desgaste / Abrir', false, 'Clásico pickup americano de dos tonos con partes móviles (apertura de compuerta trasera y capó funcional). Blíster con detalle leve en esquina.', true);

-- 4. Cargar encargos de ejemplo en leads_encargos
INSERT INTO public.leads_encargos (nombre, telefono, email, serie, modelo_buscado, estado_empaque, presupuesto, estado, notas_admin)
VALUES
('Martín Rodríguez', '+54 9 11 5555-0123', 'martin.diecast@gmail.com', 'Hot Wheels RLC (Red Line Club)', '1993 Ford Mustang Cobra R Spectraflame Pink RLC 2023', 'Blíster Mint C-10 (Perfecto)', '$55.000 ARS', 'Pendiente', 'Cliente nuevo, busca pieza para completar trilogía Fox Body.'),
('Gonzalo Fernández', '+54 9 351 4444-9988', 'gonzalo_f@hotmail.com', 'Hot Wheels Super Treasure Hunt (STH)', 'Mazda 787B Le Mans #55 Super Treasure Hunt 2024', 'Blíster Mint C-10 (Perfecto)', '$60.000 ARS', 'En búsqueda', 'Consultando con dealer en Miami para envío consolidado.');
