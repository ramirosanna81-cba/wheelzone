const http = require('http');

const envString = `DATABASE_URL=postgres://wheelzone_user:wz_360d747c66d301aa477d0726@postgres-transmit-optical-firewall-c3n48u:5432/wheelzone
NEXT_PUBLIC_SUPABASE_URL=https://olkumxhhhcviuuhevaag.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_0u02te8Wu8WJQUIR2w5pGw_NF_PD4Dc
NEXT_PUBLIC_WHATSAPP_PHONE=5492364275322
NEXT_PUBLIC_WHATSAPP_PHONE_DISPLAY=+54 9 2364 27-5322
NEXT_PUBLIC_STORE_ADDRESS=Rioja 281, B6022 Junín, Argentina`;

const payload = JSON.stringify({
  json: {
    applicationId: 'LxGnvtcbie5VxtelkUY2F',
    env: envString,
    buildArgs: '',
    buildSecrets: '',
    createEnvFile: true
  }
});

const req = http.request({
  hostname: '200.141.28.155',
  port: 3000,
  path: '/api/trpc/application.saveEnvironment',
  method: 'POST',
  headers: {
    'x-api-key': 'wheelszoneappEqvVPYrBMuXSVqwwPdDiTNhNYGFMDlBkPSEzLYurLNpFKRRjUBRUqqXSadPvnwcw',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log('Dokploy saveEnv Result:', data));
});

req.write(payload);
req.end();
