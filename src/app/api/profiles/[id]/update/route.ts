/**
 * PUT /api/profiles/[id]
 * Actualizar perfil
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '@/backend/services/profileService';
import { AuthService } from '@/backend/services/authService';

export async function PUT(
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

    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await AuthService.verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar que el perfil pertenece al usuario
    const profile = await ProfileService.getProfileById(id);
    if (profile.usuarioId !== decoded.userId && decoded.rol !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para editar este perfil' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const updatedProfile = await ProfileService.updateProfile(id, data);

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar perfil',
      },
      { status: 500 }
    );
  }
}
