/**
 * GET /api/destacado/mis-solicitudes - Ver mis solicitudes de destacado
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services/authService';
import { prisma } from '@/backend/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await AuthService.verifyToken(token);

    if (!decoded || decoded.rol !== 'FOTOGRAFO') {
      return NextResponse.json(
        { error: 'Solo los fotógrafos pueden ver solicitudes' },
        { status: 403 }
      );
    }

    // Obtener perfil del fotógrafo
    const perfil = await prisma.perfilFotografo.findUnique({
      where: { usuarioId: decoded.userId },
    });

    if (!perfil) {
      return NextResponse.json(
        { error: 'Perfil de fotógrafo no encontrado' },
        { status: 404 }
      );
    }

    // Obtener solicitudes
    const solicitudes = await prisma.solicitudDestacado.findMany({
      where: {
        fotografoId: perfil.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: solicitudes,
    });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitudes' },
      { status: 500 }
    );
  }
}
