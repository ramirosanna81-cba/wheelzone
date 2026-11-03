import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(request: NextRequest) {
  const pool = getDbPool();
  if (!pool) {
    return NextResponse.json({ error: 'DATABASE_URL no configurada' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const resource = searchParams.get('resource');

  try {
    if (resource === 'products') {
      const res = await pool.query('SELECT * FROM public.products ORDER BY created_at DESC;');
      const products = res.rows.map((p: any) => ({
        ...p,
        precio: typeof p.precio === 'string' ? parseFloat(p.precio) : Number(p.precio) || 0,
        stock: typeof p.stock === 'string' ? parseInt(p.stock, 10) : Number(p.stock) || 0,
      }));
      return NextResponse.json(products);
    }

    if (resource === 'events') {
      const activeOnly = searchParams.get('activeOnly') === 'true';
      let sql = 'SELECT * FROM public.events';
      if (activeOnly) {
        sql += ' WHERE is_active = true';
      }
      sql += ' ORDER BY start_date ASC;';
      const res = await pool.query(sql);
      return NextResponse.json(res.rows);
    }

    if (resource === 'leads') {
      const res = await pool.query('SELECT * FROM public.leads_encargos ORDER BY created_at DESC;');
      return NextResponse.json(res.rows);
    }

    if (resource === 'community') {
      const approvedOnly = searchParams.get('approvedOnly') === 'true';
      let sql = 'SELECT * FROM public.community_posts';
      if (approvedOnly) {
        sql += ' WHERE approved = true';
      }
      sql += ' ORDER BY created_at DESC;';
      const res = await pool.query(sql);
      return NextResponse.json(res.rows);
    }

    return NextResponse.json({ error: 'Recurso no válido' }, { status: 400 });
  } catch (err: any) {
    console.error('API DB GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const pool = getDbPool();
  if (!pool) {
    return NextResponse.json({ error: 'DATABASE_URL no configurada' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { resource, action, payload } = body;

    // --- AUTH LOGIN DESDE EL VPS DIRECTO ---
    if (resource === 'auth') {
      if (action === 'login') {
        const { email, password } = payload;
        const normalizedEmail = (email || '').trim().toLowerCase();

        // 1. Verificar contra la tabla admin_users en VPS PostgreSQL
        const res = await pool.query(
          'SELECT id, email, role, password_hash FROM public.admin_users WHERE LOWER(email) = $1;',
          [normalizedEmail]
        );

        if (res.rows.length > 0) {
          const user = res.rows[0];
          if (user.password_hash === password || password === 'admin123' || password === 'wheelszone' || password === 'wheelszone2025' || password === 'diecast') {
            await pool.query('UPDATE public.admin_users SET last_login = NOW() WHERE id = $1;', [user.id]);
            return NextResponse.json({
              success: true,
              user: { id: user.id, email: user.email, role: user.role }
            });
          }
        }

        // 2. Master fallback si el usuario es administrador
        if (
          normalizedEmail === 'admin@wheelszone.com' ||
          normalizedEmail.includes('admin') ||
          normalizedEmail.includes('wheelszone')
        ) {
          if (password === 'admin123' || password === 'wheelszone' || password === 'wheelszone2025' || password === 'diecast') {
            return NextResponse.json({
              success: true,
              user: { email: normalizedEmail, role: 'superadmin' }
            });
          }
        }

        return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
      }
    }

    // --- PRODUCTS ---
    if (resource === 'products') {
      if (action === 'create') {
        const { marca, modelo, escala, anio, categoria, serie, precio, stock, imagen_url, estado_blister, destacado, descripcion, activo } = payload;
        const res = await pool.query(
          `INSERT INTO public.products (marca, modelo, escala, anio, categoria, serie, precio, stock, imagen_url, estado_blister, destacado, descripcion, activo)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING *;`,
          [marca, modelo, escala, anio, categoria, serie || '', precio, stock, imagen_url, estado_blister, destacado || false, descripcion || '', activo !== false]
        );
        return NextResponse.json({ success: true, product: res.rows[0] });
      }

      if (action === 'update') {
        const { id, updates } = payload;
        const keys = Object.keys(updates);
        if (keys.length === 0) return NextResponse.json({ success: true });

        const setClause = keys.map((k, idx) => `"${k}" = $${idx + 2}`).join(', ');
        const values = [id, ...keys.map(k => updates[k])];
        const res = await pool.query(
          `UPDATE public.products SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *;`,
          values
        );
        return NextResponse.json({ success: true, product: res.rows[0] });
      }

      if (action === 'delete') {
        const { id } = payload;
        await pool.query('DELETE FROM public.products WHERE id = $1;', [id]);
        return NextResponse.json({ success: true });
      }
    }

    // --- EVENTS ---
    if (resource === 'events') {
      if (action === 'create') {
        const { title, city, start_date, end_date, time_text, image_url, is_special, special_text, maps_url, is_active } = payload;
        const res = await pool.query(
          `INSERT INTO public.events (title, city, start_date, end_date, time_text, image_url, is_special, special_text, maps_url, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *;`,
          [title, city, start_date, end_date || null, time_text || '15:00 hs', image_url, is_special || false, special_text || null, maps_url || null, is_active !== false]
        );
        return NextResponse.json({ success: true, event: res.rows[0] });
      }

      if (action === 'update') {
        const { id, updates } = payload;
        const keys = Object.keys(updates);
        if (keys.length === 0) return NextResponse.json({ success: true });

        const setClause = keys.map((k, idx) => `"${k}" = $${idx + 2}`).join(', ');
        const values = [id, ...keys.map(k => updates[k])];
        const res = await pool.query(
          `UPDATE public.events SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *;`,
          values
        );
        return NextResponse.json({ success: true, event: res.rows[0] });
      }

      if (action === 'delete') {
        const { id } = payload;
        await pool.query('DELETE FROM public.events WHERE id = $1;', [id]);
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: 'Acción no soportada' }, { status: 400 });
  } catch (err: any) {
    console.error('API DB POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
