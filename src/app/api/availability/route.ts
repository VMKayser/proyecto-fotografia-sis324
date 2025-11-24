
import { NextResponse } from 'next/server';
import { prisma } from '@/backend/lib/prisma';
import { AuthService } from '@/backend/services/authService';

// Helper to get photographer ID from token
async function getPhotographerIdFromToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  try {
    const token = authHeader.split(' ')[1];
    const { userId } = await AuthService.verifyToken(token);
    
    // Find photographer profile
    const photographer = await prisma.perfilFotografo.findUnique({
      where: { usuarioId: userId }
    });
    
    return photographer ? photographer.id : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fotografoId = searchParams.get('fotografoId');

    if (!fotografoId) {
      return NextResponse.json({ error: 'Falta fotografoId' }, { status: 400 });
    }

    const bloqueos = await prisma.bloqueoCalendario.findMany({
      where: { fotografoId: Number(fotografoId) },
      orderBy: { fechaInicio: 'asc' },
    });

    return NextResponse.json({ success: true, data: bloqueos });
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fotografoId, fechaInicio, fechaFin, motivo } = body;

    if (!fotografoId || !fechaInicio || !fechaFin) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const nuevoBloqueo = await prisma.bloqueoCalendario.create({
      data: {
        fotografoId: Number(fotografoId),
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        motivo,
      },
    });

    return NextResponse.json({ success: true, data: nuevoBloqueo });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Error al crear bloqueo' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Verify ownership
    const photographerId = await getPhotographerIdFromToken(request);
    if (!photographerId) {
       return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Falta ID' }, { status: 400 });
    }
    
    // Check if block belongs to photographer
    const block = await prisma.bloqueoCalendario.findUnique({
        where: { id: Number(id) }
    });
    
    if (!block || block.fotografoId !== photographerId) {
        return NextResponse.json({ error: 'No encontrado o no autorizado' }, { status: 404 });
    }

    await prisma.bloqueoCalendario.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Error al eliminar' }, { status: 500 });
  }
}
