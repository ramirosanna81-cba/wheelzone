const fs = require('fs');
const { Client } = require('pg');

const VPS_DB_URL = 'postgres://wheelzone_user:wz_360d747c66d301aa477d0726@200.141.28.155:5432/wheelzone';

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return { header: [], rows: [] };
  
  const header = parseCSVLine(lines[0]);
  const rows = [];
  
  let i = 1;
  while (i < lines.length) {
    let rawLine = lines[i];
    // Manejar líneas partidas con comillas multilínea
    while ((rawLine.match(/"/g) || []).length % 2 !== 0 && i + 1 < lines.length) {
      i++;
      rawLine += '\n' + lines[i];
    }
    const values = parseCSVLine(rawLine);
    if (values.length === header.length) {
      const obj = {};
      header.forEach((h, idx) => {
        let val = values[idx];
        if (val === '' || val === 'null' || val === undefined) {
          val = null;
        }
        obj[h] = val;
      });
      rows.push(obj);
    } else {
      console.warn(`Mismatch fila: ${values.length} col vs ${header.length} header:`, values);
    }
    i++;
  }
  return { header, rows };
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function migrateAll() {
  const client = new Client({ connectionString: VPS_DB_URL });
  await client.connect();
  console.log('🔌 Conectado a PostgreSQL en VPS...');

  // 1. LEADS / ENCARGOS
  if (fs.existsSync('leads_encargos_rows.csv')) {
    console.log('\n📥 Migrando leads_encargos...');
    const content = fs.readFileSync('leads_encargos_rows.csv', 'utf8');
    const { rows } = parseCSV(content);
    let count = 0;
    for (const r of rows) {
      const q = `
        INSERT INTO leads_encargos (id, nombre, telefono, email, serie, modelo_buscado, estado_empaque, presupuesto, estado, notas_admin, created_at)
        VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11::timestamptz, NOW()))
        ON CONFLICT (id) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          telefono = EXCLUDED.telefono,
          email = EXCLUDED.email,
          serie = EXCLUDED.serie,
          modelo_buscado = EXCLUDED.modelo_buscado,
          estado_empaque = EXCLUDED.estado_empaque,
          presupuesto = EXCLUDED.presupuesto,
          estado = EXCLUDED.estado,
          notas_admin = EXCLUDED.notas_admin;
      `;
      try {
        await client.query(q, [
          r.id, r.nombre || '', r.telefono || '', r.email, r.serie, r.modelo_buscado || '', r.estado_empaque, r.presupuesto, r.estado || 'Pendiente', r.notas_admin, r.created_at
        ]);
        count++;
      } catch (err) {
        console.error('Error lead:', err.message);
      }
    }
    const c = await client.query('SELECT count(*) FROM leads_encargos');
    console.log(`✅ leads_encargos migrados: ${count} (Total en VPS: ${c.rows[0].count})`);
  }

  // 2. EVENTS
  if (fs.existsSync('events_rows.csv')) {
    console.log('\n📥 Migrando events...');
    const content = fs.readFileSync('events_rows.csv', 'utf8');
    const { rows } = parseCSV(content);
    let count = 0;
    for (const r of rows) {
      const q = `
        INSERT INTO events (id, title, city, start_date, end_date, time_text, image_url, is_special, special_text, maps_url, is_active, created_at, updated_at)
        VALUES ($1::uuid, $2, $3, $4::date, $5::date, $6, $7, $8, $9, $10, $11, COALESCE($12::timestamptz, NOW()), COALESCE($13::timestamptz, NOW()))
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          city = EXCLUDED.city,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          time_text = EXCLUDED.time_text,
          image_url = EXCLUDED.image_url,
          is_special = EXCLUDED.is_special,
          special_text = EXCLUDED.special_text,
          maps_url = EXCLUDED.maps_url,
          is_active = EXCLUDED.is_active,
          updated_at = NOW();
      `;
      try {
        const isSpecial = r.is_special === 'true' || r.is_special === true;
        const isActive = r.is_active !== 'false' && r.is_active !== false;
        await client.query(q, [
          r.id, r.title, r.city || 'Junín', r.start_date, r.end_date || null, r.time_text || '15:00 hs', r.image_url, isSpecial, r.special_text || '', r.maps_url, isActive, r.created_at, r.updated_at
        ]);
        count++;
      } catch (err) {
        console.error('Error event:', err.message);
      }
    }
    const c = await client.query('SELECT count(*) FROM events');
    console.log(`✅ events migrados: ${count} (Total en VPS: ${c.rows[0].count})`);
  }

  // 3. COMMUNITY POSTS
  if (fs.existsSync('community_posts_rows.csv')) {
    console.log('\n📥 Migrando community_posts...');
    const content = fs.readFileSync('community_posts_rows.csv', 'utf8');
    const { rows } = parseCSV(content);
    let count = 0;
    for (const r of rows) {
      const q = `
        INSERT INTO community_posts (id, collector_handle, location, featured_piece, rating, review, tag, image_url, likes, approved, created_at)
        VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11::timestamptz, NOW()))
        ON CONFLICT (id) DO UPDATE SET
          collector_handle = EXCLUDED.collector_handle,
          location = EXCLUDED.location,
          featured_piece = EXCLUDED.featured_piece,
          rating = EXCLUDED.rating,
          review = EXCLUDED.review,
          tag = EXCLUDED.tag,
          image_url = EXCLUDED.image_url,
          likes = EXCLUDED.likes,
          approved = EXCLUDED.approved;
      `;
      try {
        const ratingNum = r.rating ? parseInt(r.rating, 10) : 5;
        const likesNum = r.likes ? parseInt(r.likes, 10) : 0;
        const approvedBool = r.approved !== 'false' && r.approved !== false;
        await client.query(q, [
          r.id, r.collector_handle, r.location, r.featured_piece, ratingNum, r.review, r.tag, r.image_url, likesNum, approvedBool, r.created_at
        ]);
        count++;
      } catch (err) {
        console.error('Error community post:', err.message);
      }
    }
    const c = await client.query('SELECT count(*) FROM community_posts');
    console.log(`✅ community_posts migrados: ${count} (Total en VPS: ${c.rows[0].count})`);
  }

  console.log('\n🎉 ¡MIGRACIÓN TOTAL DE SUPABASE A VPS COMPLETADA!');
  await client.end();
}

migrateAll().catch(e => {
  console.error('Error fatal:', e);
  process.exit(1);
});
