/**
 * API /api/users/[id]
 * GET - Obtener usuario por ID
 * PUT - Actualizar usuario
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/backend/services/userService';
import { AuthService } from '@/backend/services/authService';

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

    // Solo puede ver su propio perfil o ser admin
    if (decoded.userId !== id && decoded.rol !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para ver este usuario' },
        { status: 403 }
      );
    }

    const user = await UserService.getUserById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener usuario',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * Actualizar usuario
 */
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

    const body = await request.json();
    const { nombreCompleto, telefono } = body;

    const updatedUser = await UserService.updateUser(id, {
      nombreCompleto,
      telefono,
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Usuario actualizado correctamente',
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
