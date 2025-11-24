/**
 * 📷 API Route - Portfolio
 * POST /api/portfolio - Crear imagen de portafolio
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/backend/services/authService';
import { PortfolioService } from '@/backend/services/portfolioService';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { fotografoId, urlImagen, descripcion, orden, destacada, albumId, albumName, album: legacyAlbumName } = body;

    const ownerProfileId = await PortfolioService.getFotografoIdByUser(decoded.userId);

    if (ownerProfileId !== fotografoId) {
      return NextResponse.json(
        { message: 'No puedes modificar el portafolio de otro fotógrafo' },
        { status: 403 }
      );
    }

    const resolvedAlbum = await PortfolioService.resolveAlbumForImage({
      fotografoId,
      albumId,
      albumName: albumName ?? legacyAlbumName,
    });

    const image = await prisma.portafolioImagen.create({
      data: {
        fotografoId,
        urlImagen,
        descripcion,
        orden: orden || 1,
        destacada: destacada || false,
  album: resolvedAlbum?.nombre ?? 'Sesiones destacadas',
        albumId: resolvedAlbum?.id,
      },
    });

    if (resolvedAlbum && !resolvedAlbum.portadaUrl) {
      await PortfolioService.setAlbumCoverFromImage(resolvedAlbum.id, urlImagen);
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error('Error al crear imagen de portafolio:', error);
    return NextResponse.json(
      { message: 'Error al crear imagen' },
      { status: 500 }
    );
  }
}
