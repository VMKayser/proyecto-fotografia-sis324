/**
 * GET /api/users
 * Obtener todos los usuarios (solo admin)
 */

export { dynamic } from '@/backend/config/routeConfig';
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/backend/services/userService';
import { AuthService } from '@/backend/services/authService';

export async function GET(request: NextRequest) {
  try {
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

    if (!decoded || decoded.rol !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      );
    }

    const users = await UserService.getAllUsers();

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener usuarios',
      },
      { status: 500 }
    );
  }
}
