import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const entry = formData.get('file');

    if (!entry || typeof entry === 'string') {
      return NextResponse.json({ error: 'No se encontró archivo para subir.' }, { status: 400 });
    }

    const file = entry as File;

    if (typeof (file as Blob).arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'El archivo recibido no es válido.' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Formato no soportado. Usa JPG, PNG o WebP.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'El archivo excede el límite de 8MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

  const originalName = typeof file.name === 'string' ? file.name : 'upload.jpg';
  const extension = path.extname(originalName) || '.jpg';
    const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    const filepath = path.join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Error al subir el archivo.' }, { status: 500 });
  }
}
