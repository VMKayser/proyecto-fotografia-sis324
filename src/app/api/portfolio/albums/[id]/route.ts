import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services/authService';
import { PortfolioService } from '@/backend/services/portfolioService';

async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No autorizado');
  }

  const token = authHeader.replace('Bearer ', '');
  const decoded = await AuthService.verifyToken(token);

  if (!decoded || decoded.rol !== 'FOTOGRAFO') {
    throw new Error('No autorizado');
  }

  return decoded;
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decoded = await authenticate(request);
    const fotografoId = await PortfolioService.getFotografoIdByUser(decoded.userId);
    const body = await request.json();

    const album = await PortfolioService.updateAlbum(Number(params.id), fotografoId, {
      nombre: body.nombre,
      descripcion: body.descripcion,
      portadaUrl: body.portadaUrl,
      visible: body.visible,
      orden: body.orden,
    });

    return NextResponse.json(album);
  } catch (error) {
    console.error('Error al actualizar álbum:', error);
    const status = error instanceof Error && error.message === 'No autorizado' ? 401 : 400;
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error al actualizar álbum' },
      { status }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decoded = await authenticate(request);
    const fotografoId = await PortfolioService.getFotografoIdByUser(decoded.userId);

    const fallbackAlbum = await PortfolioService.deleteAlbum(Number(params.id), fotografoId);

    return NextResponse.json({
      message: 'Álbum eliminado',
      fallbackAlbum,
    });
  } catch (error) {
    console.error('Error al eliminar álbum:', error);
    const status = error instanceof Error && error.message === 'No autorizado' ? 401 : 400;
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error al eliminar álbum' },
      { status }
    );
  }
}
