// ============================================
// LOGIN API ROUTE - Controller de login
// Capa: Presentation Layer (Controllers)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services';
import { LoginDTO } from '@/backend/types';

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
export async function POST(request: NextRequest) {
  try {
    const body: LoginDTO = await request.json();

    // Validar datos requeridos
    if (!body.email || !body.password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email y contraseña son requeridos' 
        },
        { status: 400 }
      );
    }

    // Capturar IP y User-Agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Login con información de sesión
    const result = await AuthService.login(body, ipAddress, userAgent);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Login exitoso',
    });

  } catch (error: unknown) {
    console.error('Error en login:', error);
    const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
    return NextResponse.json(
      { 
        success: false, 
        error: message 
      },
      { status: 401 }
    );
  }
}
