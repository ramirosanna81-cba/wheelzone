const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function seedProductsOnly() {
  const client = new Client({
    host: '200.141.28.155',
    port: 5432,
    user: 'wheelzone_user',
    password: 'wz_360d747c66d301aa477d0726',
    database: 'wheelzone'
  });
  await client.connect();

  const seedPath = path.join(__dirname, '..', 'supabase_seed.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');

  // Extraer únicamente el bloque INSERT INTO public.products ...
  const insertIndex = sql.indexOf('INSERT INTO public.products');
  if (insertIndex !== -1) {
    const productsSql = sql.substring(insertIndex);
    console.log('Inserting products into VPS DB...');
    await client.query(productsSql);
    console.log('Products inserted successfully!');
  }

  // Insertar eventos
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
    const events = JSON.parse(cleanJson);
    for (const e of events) {
      await client.query(
        'INSERT INTO public.events (id, title, city, start_date, time_text, image_url, is_special, special_text, maps_url, is_active) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [e.title, e.city, e.start_date, e.time_text, e.image_url, e.is_special, e.special_text, e.maps_url, e.is_active]
      );
    }
    console.log(`Inserted ${events.length} events into VPS DB.`);
  }

  const finalProds = await client.query('SELECT count(*) FROM public.products;');
  const finalEvents = await client.query('SELECT count(*) FROM public.events;');
  console.log('VPS DB STATUS -> Products:', finalProds.rows[0].count, '| Events:', finalEvents.rows[0].count);

  await client.end();
}

seedProductsOnly().catch(console.error);
