import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/backend/services/authService';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await AuthService.verifyToken(token);

    if (!decoded || decoded.rol !== 'FOTOGRAFO') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { fotografoId, categoriaIds } = await request.json();

    if (!fotografoId || !Array.isArray(categoriaIds)) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const profile = await prisma.perfilFotografo.findUnique({ where: { id: fotografoId } });
    if (!profile || profile.usuarioId !== decoded.userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await prisma.fotografoCategoria.deleteMany({ where: { fotografoId } });

    if (categoriaIds.length > 0) {
      await prisma.fotografoCategoria.createMany({
        data: categoriaIds.map((categoriaId: number) => ({ fotografoId, categoriaId })),
        skipDuplicates: true,
      });
    }

    const assigned = await prisma.fotografoCategoria.findMany({
      where: { fotografoId },
      include: { categoria: true },
    });

    return NextResponse.json(assigned);
  } catch (error) {
    console.error('Error assigning categories:', error);
    return NextResponse.json({ error: 'Error al asignar categorías' }, { status: 500 });
  }
}
