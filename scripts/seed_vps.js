const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Leer productos y eventos de mock-data.ts y supabase_seed.sql
async function seedVPS() {
  const client = new Client({
    host: '200.141.28.155',
    port: 5432,
    user: 'wheelzone_user',
    password: 'wz_360d747c66d301aa477d0726',
    database: 'wheelzone'
  });
  await client.connect();

  // Verificar si ya hay productos
  const countRes = await client.query('SELECT count(*) FROM public.products;');
  console.log('Current products in VPS DB:', countRes.rows[0].count);

  if (parseInt(countRes.rows[0].count, 10) === 0) {
    // Importar de supabase_seed.sql si existe
    const seedPath = path.join(__dirname, '..', 'supabase_seed.sql');
    if (fs.existsSync(seedPath)) {
      const sql = fs.readFileSync(seedPath, 'utf8');
      console.log('Inserting seed from supabase_seed.sql...');
      await client.query(sql);
      console.log('Seed executed.');
    }
  }

  // Verificar eventos
  const evCount = await client.query('SELECT count(*) FROM public.events;');
  console.log('Current events in VPS DB:', evCount.rows[0].count);

  if (parseInt(evCount.rows[0].count, 10) === 0) {
    const mockContent = fs.readFileSync(path.join(__dirname, '..', 'lib', 'mock-data.ts'), 'utf8');
    const eventsMatch = mockContent.match(/export const INITIAL_EVENTS: DiecastEvent\[\] = (\[[\s\S]*?\]);/);
    if (eventsMatch) {
      const cleanJson = eventsMatch[1]
        .replace(/id:/g, '"id":')
        .replace(/title:/g, '"title":')
        .replace(/city:/g, '"city":')
        .replace(/start_date:/g, '"start_date":')
        .replace(/time_text:/g, '"time_text":')
        .replace(/image_url:/g, '"image_url":')
        .replace(/is_special:/g, '"is_special":')
        .replace(/special_text:/g, '"special_text":')
        .replace(/maps_url:/g, '"maps_url":')
        .replace(/is_active:/g, '"is_active":')
        .replace(/created_at:/g, '"created_at":')
        .replace(/'/g, '"')
        .replace(/,\s*\]/g, ']');
      try {
        const events = JSON.parse(cleanJson);
        for (const e of events) {
          await client.query(
            'INSERT INTO public.events (id, title, city, start_date, time_text, image_url, is_special, special_text, maps_url, is_active) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [e.title, e.city, e.start_date, e.time_text, e.image_url, e.is_special, e.special_text, e.maps_url, e.is_active]
          );
        }
        console.log(`Inserted ${events.length} initial events into VPS DB.`);
      } catch (err) {
        console.warn('Could not parse mock events JSON:', err.message);
      }
    }
  }

  const finalProds = await client.query('SELECT count(*) FROM public.products;');
  const finalEvents = await client.query('SELECT count(*) FROM public.events;');
  console.log('FINAL STATS on VPS DB -> Products:', finalProds.rows[0].count, 'Events:', finalEvents.rows[0].count);

  await client.end();
}

seedVPS().catch(console.error);
