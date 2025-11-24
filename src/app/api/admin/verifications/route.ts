import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/lib/prisma';
import { AuthService } from '@/backend/services/authService';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const decoded = await AuthService.verifyToken(token);
    if (!decoded || decoded.rol !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
    }

    const requests = await prisma.perfilFotografo.findMany({
      where: { verificado: false },
      include: { usuario: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
