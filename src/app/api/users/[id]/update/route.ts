/**
 * PUT /api/users/[id]
 * Actualizar usuario
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/backend/services/userService';
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

    // Solo puede actualizar su propio perfil o ser admin
    if (decoded.userId !== id && decoded.rol !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para actualizar este usuario' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const updatedUser = await UserService.updateUser(id, data);

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar usuario',
      },
      { status: 500 }
    );
  }
}
