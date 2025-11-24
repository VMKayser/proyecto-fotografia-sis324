// ============================================
// ME API ROUTE - Obtener usuario actual
// Capa: Presentation Layer (Controllers)
// ============================================

export { dynamic } from '@/backend/config/routeConfig';
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services';

/**
 * GET /api/auth/me
 * Obtener usuario autenticado
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener token del header Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Obtener usuario actual
    const user = await AuthService.getCurrentUser(token);

    return NextResponse.json({
      success: true,
      data: user,
    });

  } catch (error: unknown) {
    console.error('Error en me:', error);
    const message = error instanceof Error ? error.message : 'No autorizado';
    return NextResponse.json(
      { success: false, error: message },
      { status: 401 }
    );
  }
}
