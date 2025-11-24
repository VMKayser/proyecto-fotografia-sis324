// ============================================
// LOGOUT API ROUTE - Controller de logout
// Capa: Presentation Layer (Controllers)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services';

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Eliminar sesión de la BD
    await AuthService.logout(token);

    return NextResponse.json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });

  } catch (error: unknown) {
    console.error('Error en logout:', error);
    const message = error instanceof Error ? error.message : 'Error al cerrar sesión';
    return NextResponse.json(
      { 
        success: false, 
        error: message 
      },
      { status: 500 }
    );
  }
}
