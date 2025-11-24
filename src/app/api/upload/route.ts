import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/backend/lib/cloudinary';

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

    // Subir a Cloudinary en lugar de guardar localmente
    const { url, publicId } = await uploadToCloudinary(buffer, 'fotografia');

    return NextResponse.json({ 
      url,
      publicId, // Guardar el publicId si necesitas eliminar la imagen después
      message: 'Imagen subida exitosamente a Cloudinary'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Error al subir el archivo.' }, { status: 500 });
  }
}
