/**
 * 📷 API Route - Portfolio Image Delete
 * DELETE /api/portfolio/[id] - Eliminar imagen de portafolio
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/backend/services/authService';
import { PortfolioService } from '@/backend/services/portfolioService';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await AuthService.verifyToken(token);

    if (!decoded || decoded.rol !== 'FOTOGRAFO') {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const imageId = parseInt(params.id);

    // Verificar que la imagen pertenece al fotógrafo
    const image = await prisma.portafolioImagen.findUnique({
      where: { id: imageId },
      include: {
        fotografo: {
          include: {
            usuario: true,
          },
        },
      },
    });

    if (!image) {
      return NextResponse.json(
        { message: 'Imagen no encontrada' },
        { status: 404 }
      );
    }

    if (image.fotografo.usuarioId !== decoded.userId) {
      return NextResponse.json(
        { message: 'No autorizado para eliminar esta imagen' },
        { status: 403 }
      );
    }

    // Eliminar la imagen
    await prisma.portafolioImagen.delete({
      where: { id: imageId },
    });

    if (image.albumId) {
      await PortfolioService.syncCoverFromImages(image.albumId);
    }

    return NextResponse.json({ message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    return NextResponse.json(
      { message: 'Error al eliminar imagen' },
      { status: 500 }
    );
  }
}
