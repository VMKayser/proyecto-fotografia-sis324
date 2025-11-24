/**
 * GET /api/profiles/me
 * Obtener perfil del usuario actual
 */

export { dynamic } from '@/backend/config/routeConfig';
import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '@/backend/services/profileService';
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

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    const profile = await ProfileService.getProfileByUserId(decoded.userId);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'No tienes un perfil de fotógrafo' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error fetching my profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener perfil',
      },
      { status: 500 }
    );
  }
}
