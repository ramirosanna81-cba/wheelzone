const fs = require('fs');
const { Client } = require('pg');

const VPS_DB_URL = 'postgres://wheelzone_user:wz_360d747c66d301aa477d0726@200.141.28.155:5432/wheelzone';

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

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  const header = parseCSVLine(lines[0]);
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
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
      console.warn(`Aviso: Fila ${i} con ${values.length} columnas en vez de ${header.length}`);
    }
  }
  return { header, rows };
}

async function run() {
  console.log('📂 Leyendo products_rows.csv...');
  const content = fs.readFileSync('products_rows.csv', 'utf8');
  const { header, rows } = parseCSV(content);
  console.log(`✅ ${rows.length} productos parseados del CSV.`);

  const client = new Client({ connectionString: VPS_DB_URL });
  await client.connect();
  console.log('🔌 Conectado a PostgreSQL en el VPS (Dokploy)...');

  let inserted = 0;
  let errors = 0;

  for (const item of rows) {
    const query = `
      INSERT INTO products (
        id, marca, modelo, escala, anio, categoria, serie, precio, stock, imagen_url, estado_blister, destacado, descripcion, activo, created_at, updated_at
      ) VALUES (
        $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        COALESCE($15::timestamptz, NOW()),
        COALESCE($16::timestamptz, NOW())
      )
      ON CONFLICT (id) DO UPDATE SET
        marca = EXCLUDED.marca,
        modelo = EXCLUDED.modelo,
        escala = EXCLUDED.escala,
        anio = EXCLUDED.anio,
        categoria = EXCLUDED.categoria,
        serie = EXCLUDED.serie,
        precio = EXCLUDED.precio,
        stock = EXCLUDED.stock,
        imagen_url = EXCLUDED.imagen_url,
        estado_blister = EXCLUDED.estado_blister,
        destacado = EXCLUDED.destacado,
        descripcion = EXCLUDED.descripcion,
        activo = EXCLUDED.activo,
        updated_at = NOW();
    `;

    try {
      const anioNum = item.anio ? parseInt(item.anio, 10) : null;
      const precioNum = item.precio ? parseFloat(item.precio) : 0;
      const stockNum = item.stock ? parseInt(item.stock, 10) : 1;
      const destacadoBool = item.destacado === 'true' || item.destacado === true;
      const activoBool = item.activo !== 'false' && item.activo !== false;

      await client.query(query, [
        item.id,
        item.marca || 'Varios',
        item.modelo || 'Sin Modelo',
        item.escala || '1:64',
        isNaN(anioNum) ? null : anioNum,
        item.categoria || 'Colección',
        item.serie || '',
        precioNum,
        stockNum,
        item.imagen_url || '',
        item.estado_blister || 'Impecable',
        destacadoBool,
        item.descripcion || '',
        activoBool,
        item.created_at || null,
        item.updated_at || null
      ]);
      inserted++;
    } catch (e) {
      console.error(`❌ Error en item ${item.modelo} (${item.id}):`, e.message);
      errors++;
    }
  }

  const countRes = await client.query('SELECT count(*) FROM products');
  console.log(`\n🎉 Migración de productos completada!`);
  console.log(`✅ Insertados/Actualizados con éxito: ${inserted}`);
  console.log(`⚠️ Errores: ${errors}`);
  console.log(`📊 TOTAL de productos ahora en la base de datos de tu VPS: ${countRes.rows[0].count}`);

  await client.end();
}

run().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});

