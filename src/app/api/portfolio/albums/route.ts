import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services/authService';
import { PortfolioService } from '@/backend/services/portfolioService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fotografoId = searchParams.get('fotografoId');
    const onlyVisible = searchParams.get('visible') === 'true';

    if (!fotografoId) {
      return NextResponse.json({ message: 'fotografoId requerido' }, { status: 400 });
    }

    const albums = await PortfolioService.listAlbums(Number(fotografoId), { onlyVisible });
    return NextResponse.json(albums);
  } catch (error) {
    console.error('Error al listar álbumes:', error);
    return NextResponse.json({ message: 'Error al obtener álbumes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await AuthService.verifyToken(token);

    if (!decoded || decoded.rol !== 'FOTOGRAFO') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const fotografoId = await PortfolioService.getFotografoIdByUser(decoded.userId);
    const body = await request.json();
    const { nombre, descripcion, portadaUrl, visible, orden } = body;

    if (!nombre) {
      return NextResponse.json({ message: 'El nombre del álbum es obligatorio' }, { status: 400 });
    }

    const album = await PortfolioService.createAlbum({
      fotografoId,
      nombre,
      descripcion,
      portadaUrl,
      visible,
      orden,
    });

    return NextResponse.json(album, { status: 201 });
  } catch (error) {
    console.error('Error al crear álbum:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error al crear álbum' },
      { status: 500 }
    );
  }
}
