const fs = require('fs');
const { Client } = require('pg');

const VPS_DB_URL = 'postgres://wheelzone_user:wz_360d747c66d301aa477d0726@200.141.28.155:5432/wheelzone';

async function importData() {
  const filePath = process.argv[2] || 'products_export.json';

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo "${filePath}" no encontrado.`);
    console.error(`Guardá el archivo exportado de Supabase como "${filePath}" y volvé a ejecutar.`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(filePath, 'utf8').trim();
  let items = [];

  try {
    if (rawData.startsWith('[') || rawData.startsWith('{')) {
      const parsed = JSON.parse(rawData);
      items = Array.isArray(parsed) ? parsed : [parsed];
    } else {
      // Intentar CSV simple
      const lines = rawData.split('\n').filter(l => l.trim().length > 0);
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      for (let i = 1; i < lines.length; i++) {
        // regex simple para parsear csv respetando comillas
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        const obj = {};
        headers.forEach((h, idx) => {
          let val = row[idx] ? row[idx].trim().replace(/^"|"$/g, '') : null;
          obj[h] = val;
        });
        items.push(obj);
      }
    }
  } catch (err) {
    console.error('❌ Error al parsear los datos:', err.message);
    process.exit(1);
  }

  console.log(`📦 Procesando ${items.length} productos para importar al VPS...`);

  const client = new Client({ connectionString: VPS_DB_URL });
  await client.connect();

  let inserted = 0;
  let updated = 0;

  for (const item of items) {
    const {
      id,
      marca,
      modelo,
      escala = '1:43',
      anio,
      categoria = 'General',
      serie,
      precio = 0,
      stock = 1,
      imagen_url,
      estado_blister = 'Impecable',
      destacado = false,
      descripcion = '',
      activo = true
    } = item;

    const query = `
      INSERT INTO products (
        id, marca, modelo, escala, anio, categoria, serie, precio, stock, imagen_url, estado_blister, destacado, descripcion, activo
      ) VALUES (
        COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
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
        updated_at = NOW()
    `;

    try {
      const numAnio = anio ? parseInt(anio, 10) : null;
      const numPrecio = parseFloat(precio) || 0;
      const numStock = parseInt(stock, 10) || 0;
      const boolDestacado = destacado === true || destacado === 'true';
      const boolActivo = activo !== false && activo !== 'false';

      await client.query(query, [
        id || null,
        marca || 'Varios',
        modelo || 'Sin Modelo',
        escala,
        isNaN(numAnio) ? null : numAnio,
        categoria,
        serie || '',
        numPrecio,
        numStock,
        imagen_url || '',
        estado_blister,
        boolDestacado,
        descripcion,
        boolActivo
      ]);
      inserted++;
    } catch (e) {
      console.error(`⚠️ Error con producto ${modelo}:`, e.message);
    }
  }

  const countRes = await client.query('SELECT count(*) FROM products');
  console.log(`\n🎉 Migración finalizada con éxito!`);
  console.log(`✅ Filas procesadas: ${inserted}`);
  console.log(`📊 Total de productos en la base de datos de tu VPS: ${countRes.rows[0].count}`);

  await client.end();
}

importData().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});

