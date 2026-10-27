const https = require('https');

async function getProducts() {
  const url = 'https://olkumxhhhcviuuhevaag.supabase.co/rest/v1/products?select=id,modelo,imagen_url&order=created_at.desc&limit=36';
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'apikey': 'sb_publishable_0u02te8Wu8WJQUIR2w5pGw_NF_PD4Dc' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function warmImage(imgUrl, width) {
  return new Promise((resolve) => {
    const targetUrl = `https://wheelszone.com.ar/_next/image?url=${encodeURIComponent(imgUrl)}&w=${width}&q=75`;
    const start = Date.now();
    https.get(targetUrl, (res) => {
      const elapsed = Date.now() - start;
      const xNextCache = res.headers['x-nextjs-cache'] || 'N/A';
      resolve({ status: res.statusCode, time: elapsed, cache: xNextCache });
    }).on('error', (err) => {
      resolve({ status: 500, error: err.message });
    });
  });
}

async function main() {
  console.log('Fetching top 36 products to warm image cache...');
  const products = await getProducts();
  console.log(`Found ${products.length} products. Starting warming in parallel batches...`);

  for (let i = 0; i < products.length; i += 6) {
    const batch = products.slice(i, i + 6);
    await Promise.all(batch.map(async (p) => {
      const res = await warmImage(p.imagen_url, 384);
      console.log(`[Warm] ${p.modelo.slice(0, 30).padEnd(30)} -> ${res.status} | ${res.time}ms | Cache: ${res.cache}`);
    }));
  }

  console.log('Cache warming completed!');
}

main().catch(console.error);
