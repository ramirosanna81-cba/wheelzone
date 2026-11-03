import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function listFilesRecursively(dir: string, baseDir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const f of list) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(listFilesRecursively(full, baseDir));
    } else {
      results.push(path.relative(baseDir, full));
    }
  }
  return results;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  const baseDir = path.join(process.cwd(), 'public', 'images', 'vps-uploads');

  if (searchParams.get('list') === '1') {
    return NextResponse.json({
      cwd: process.cwd(),
      baseDir,
      exists: fs.existsSync(baseDir),
      files: listFilesRecursively(baseDir, baseDir)
    });
  }

  if (!file) {
    return NextResponse.json({ error: 'Falta parametro ?file=' }, { status: 400 });
  }

  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    return new NextResponse('Not found: ' + filePath, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  let contentType = 'image/webp';
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Guardar en la carpeta public/images/vps-uploads/
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'vps-uploads', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = file.name.split('.').pop() || 'webp';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/api/upload?file=${encodeURIComponent(folder + '/' + filename)}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('Error al subir imagen local:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
