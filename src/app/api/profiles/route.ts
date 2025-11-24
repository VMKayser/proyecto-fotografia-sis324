/**
 * GET /api/profiles - Obtener todos los perfiles de fotógrafos
 * POST /api/profiles - Crear perfil de fotógrafo
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '@/backend/services/profileService';
import { AuthService } from '@/backend/services/authService';
import type { ProfileFilters } from '@/backend/repositories/profileRepository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get('categoriaId');
    const ubicacion = searchParams.get('ubicacion');
    const usuarioId = searchParams.get('usuarioId');
    const query = searchParams.get('q');
    const minRating = searchParams.get('minRating');
    const soloVerificados = searchParams.get('soloVerificados');
    const take = searchParams.get('take');
    const precioMin = searchParams.get('precioMin');
    const precioMax = searchParams.get('precioMax');
    const fechaDisponible = searchParams.get('fechaDisponible') || searchParams.get('fecha');
    const ordenarPor = searchParams.get('orden') || searchParams.get('ordenarPor');

    // Si se proporciona usuarioId, buscar perfil específico
    if (usuarioId) {
      const parsedUserId = parseInt(usuarioId, 10);
      if (Number.isNaN(parsedUserId)) {
        return NextResponse.json(null);
      }

      const profile = await ProfileService.getProfileByUserId(parsedUserId);
      return NextResponse.json(profile);
    }

    const parsedCategory = categoriaId ? parseInt(categoriaId, 10) : undefined;
    const parsedMinRating = minRating ? Number(minRating) : undefined;
    const parsedTake = take ? parseInt(take, 10) : undefined;
    const parsedPriceMin = precioMin ? Number(precioMin) : undefined;
    const parsedPriceMax = precioMax ? Number(precioMax) : undefined;
    const parsedDate = fechaDisponible ? new Date(fechaDisponible) : undefined;

    const normalizeSort = (value?: string): ProfileFilters['sortBy'] => {
      switch (value) {
        case 'rating':
          return 'rating';
        case 'precio_asc':
        case 'priceAsc':
          return 'priceAsc';
        case 'precio_desc':
        case 'priceDesc':
          return 'priceDesc';
        case 'recientes':
        case 'recent':
          return 'recent';
        default:
          return undefined;
      }
    };

    const filters: ProfileFilters = {
      categoriaId:
        typeof parsedCategory === 'number' && !Number.isNaN(parsedCategory)
          ? parsedCategory
          : undefined,
      ubicacion: ubicacion || undefined,
      query: query || undefined,
      minRating:
        typeof parsedMinRating === 'number' && !Number.isNaN(parsedMinRating)
          ? parsedMinRating
          : undefined,
      onlyVerified: soloVerificados === 'true',
      take:
        typeof parsedTake === 'number' && !Number.isNaN(parsedTake)
          ? parsedTake
          : undefined,
      priceMin:
        typeof parsedPriceMin === 'number' && !Number.isNaN(parsedPriceMin)
          ? parsedPriceMin
          : undefined,
      priceMax:
        typeof parsedPriceMax === 'number' && !Number.isNaN(parsedPriceMax)
          ? parsedPriceMax
          : undefined,
      availableDate: parsedDate && !Number.isNaN(parsedDate.valueOf()) ? parsedDate : undefined,
      sortBy: normalizeSort(ordenarPor || undefined),
    };

  const profiles = await ProfileService.getAllProfiles(filters);

    // Devolver directamente el array para compatibilidad con el frontend
    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener perfiles',
      },
      { status: 500 }
    );
  }
}

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
    const {
      nombrePublico,
      biografia,
      ubicacion,
      sitioWeb,
      urlFotoPerfil,
      urlFotoPortada,
      qrPagoUrl,
      qrInstrucciones,
      usuarioId,
    } = body;

    // Verificar que el usuario autenticado es el que está creando el perfil
    if (decoded.userId !== usuarioId) {
      return NextResponse.json(
        { message: 'No autorizado para crear este perfil' },
        { status: 403 }
      );
    }

    const profile = await ProfileService.createProfile({
      usuarioId,
      nombrePublico,
      biografia,
      ubicacion,
      sitioWeb,
      urlFotoPerfil,
      urlFotoPortada,
      qrPagoUrl,
      qrInstrucciones,
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error('Error al crear perfil:', error);
    return NextResponse.json(
      { message: 'Error al crear perfil' },
      { status: 500 }
    );
  }
}
