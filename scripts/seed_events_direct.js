const { Client } = require('pg');

async function insertEvents() {
  const client = new Client({
    host: '200.141.28.155',
    port: 5432,
    user: 'wheelzone_user',
    password: 'wz_360d747c66d301aa477d0726',
    database: 'wheelzone'
  });
  await client.connect();

  const events = [
    { title: 'PLAZA SAN CAYETANO', city: 'Junín', start_date: '2026-10-04', time_text: '15:00 hs', image_url: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=600&q=80', is_special: false, special_text: null, maps_url: 'https://maps.google.com/?q=Plaza+San+Cayetano+Junin', is_active: true },
    { title: 'MULTIESPACIO PLAZA DEL FERROCARRIL', city: 'San Jerónimo', start_date: '2026-10-12', time_text: '15:00 hs', image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80', is_special: false, special_text: null, maps_url: 'https://maps.google.com/?q=Plaza+del+Ferrocarril+San+Jeronimo', is_active: true },
    { title: 'PLAZA BAUMANN', city: 'Junín', start_date: '2026-10-12', time_text: '15:00 hs', image_url: 'https://images.unsplash.com/photo-1558441719-86abec391fc3?auto=format&fit=crop&w=600&q=80', is_special: false, special_text: null, maps_url: 'https://maps.google.com/?q=Plaza+Baumann+Junin', is_active: true },
    { title: 'PLAZA MORSE', city: 'Junín', start_date: '2026-10-03', time_text: '15:00 hs', image_url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80', is_special: false, special_text: null, maps_url: 'https://maps.google.com/?q=Morse+Junin+Buenos+Aires', is_active: true },
    { title: 'PLAZA VILLA', city: 'Junín', start_date: '2026-10-11', time_text: '15:00 hs', image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80', is_special: true, special_text: 'ESPECIAL DÍA DE LA MADRE', maps_url: 'https://maps.google.com/?q=Plaza+Villa+Talleres+Junin', is_active: true },
    { title: 'PLAZA FOETRA', city: 'Junín', start_date: '2026-11-18', time_text: '15:00 hs', image_url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80', is_special: true, special_text: 'ESPECIAL DÍA DE LA MADRE', maps_url: 'https://maps.google.com/?q=Plaza+Foetra+Junin', is_active: true },
    { title: 'PLAZA ALEM', city: 'Junín', start_date: '2026-10-18', time_text: '15:00 hs', image_url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80', is_special: true, special_text: 'ESPECIAL DÍA DE LA MADRE', maps_url: 'https://maps.google.com/?q=Plaza+Alem+Junin', is_active: true },
    { title: 'PLAZA BAUMAN', city: 'Junín', start_date: '2026-11-12', time_text: '15:00 hs', image_url: 'https://images.unsplash.com/photo-1558441719-86abec391fc3?auto=format&fit=crop&w=600&q=80', is_special: true, special_text: 'ENCUENTRO EXCLUSIVO', maps_url: 'https://maps.google.com/?q=Plaza+Baumann+Junin', is_active: true },
    { title: 'PLAZA ALEM', city: 'Junín', start_date: '2026-10-24', time_text: '15:00 hs', image_url: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=600&q=80', is_special: false, special_text: null, maps_url: 'https://maps.google.com/?q=Plaza+Alem+Junin', is_active: true }
  ];

  for (const e of events) {
    await client.query(
      'INSERT INTO public.events (id, title, city, start_date, time_text, image_url, is_special, special_text, maps_url, is_active) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [e.title, e.city, e.start_date, e.time_text, e.image_url, e.is_special, e.special_text, e.maps_url, e.is_active]
    );
  }

  const res = await client.query('SELECT count(*) FROM public.events;');
  console.log('Total events in VPS DB:', res.rows[0].count);
  await client.end();
}

insertEvents().catch(console.error);
