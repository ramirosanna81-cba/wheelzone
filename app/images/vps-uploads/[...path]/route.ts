import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams?.path || [];

    // Obtenemos los posibles paths base
    const baseUploadDir = path.join(process.cwd(), 'public', 'images', 'vps-uploads');
    const requestedFile = path.join(baseUploadDir, ...pathSegments);

    if (!fs.existsSync(requestedFile)) {
      // También chequear en /etc/dokploy/wheelzone-uploads directo si existiera acceso
      console.warn('Image not found at:', requestedFile);
      return new NextResponse(`File not found: ${requestedFile}`, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(requestedFile);
    const ext = path.extname(requestedFile).toLowerCase();

    let contentType = 'image/webp';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Error serving VPS image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
