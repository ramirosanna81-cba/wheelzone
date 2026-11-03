const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    host: '200.141.28.155',
    port: 5432,
    user: 'wheelzone_user',
    password: 'wz_360d747c66d301aa477d0726',
    database: 'wheelzone'
  });
  await client.connect();

  const ddl = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS public.products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        marca TEXT NOT NULL,
        modelo TEXT NOT NULL,
        escala TEXT NOT NULL DEFAULT '1:64',
        anio INTEGER NOT NULL DEFAULT 2024,
        categoria TEXT NOT NULL,
        serie TEXT DEFAULT '',
        precio NUMERIC(12, 2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 1,
        imagen_url TEXT NOT NULL,
        estado_blister TEXT NOT NULL DEFAULT 'Impecable',
        destacado BOOLEAN NOT NULL DEFAULT false,
        destacado_tipo TEXT,
        destacado_tag TEXT,
        hero_order INTEGER,
        descripcion TEXT DEFAULT '',
        activo BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.leads_encargos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre TEXT NOT NULL,
        telefono TEXT NOT NULL,
        email TEXT DEFAULT '',
        serie TEXT DEFAULT '',
        modelo_buscado TEXT NOT NULL,
        estado_empaque TEXT DEFAULT 'Blíster Mint C-10',
        presupuesto TEXT DEFAULT '',
        estado TEXT NOT NULL DEFAULT 'Pendiente',
        notas_admin TEXT DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.community_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        collector_handle TEXT NOT NULL,
        location TEXT NOT NULL,
        featured_piece TEXT NOT NULL,
        rating INTEGER NOT NULL DEFAULT 5,
        review TEXT NOT NULL,
        tag TEXT NOT NULL DEFAULT 'Vitrina Completa',
        image_url TEXT NOT NULL,
        likes INTEGER NOT NULL DEFAULT 0,
        approved BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

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
  `;

  await client.query(ddl);
  console.log('Tables created successfully in VPS Postgres!');
  await client.end();
}

migrate().catch(console.error);
