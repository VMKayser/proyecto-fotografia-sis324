/**
 * GET /api/profiles/[id] - Obtener perfil por ID
 * PUT /api/profiles/[id] - Actualizar perfil de fotógrafo
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '@/backend/services/profileService';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/backend/services/authService';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    const profile = await ProfileService.getProfileById(id);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener perfil',
      },
      { status: error instanceof Error && error.message === 'Perfil no encontrado' ? 404 : 500 }
    );
  }
}

export async function PUT(
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

    const profileId = parseInt(params.id);

    // Verificar que el perfil pertenece al usuario autenticado
    const existingProfile = await prisma.perfilFotografo.findUnique({
      where: { id: profileId },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { message: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    if (existingProfile.usuarioId !== decoded.userId) {
      return NextResponse.json(
        { message: 'No autorizado para actualizar este perfil' },
        { status: 403 }
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
    } = body;

    const updatedProfile = await ProfileService.updateProfile(profileId, {
      nombrePublico,
      biografia,
      ubicacion,
      sitioWeb,
      urlFotoPerfil,
      urlFotoPortada,
      qrPagoUrl,
      qrInstrucciones,
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return NextResponse.json(
      { message: 'Error al actualizar perfil' },
      { status: 500 }
    );
  }
}
