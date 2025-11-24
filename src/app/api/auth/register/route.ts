// ============================================
// AUTH API ROUTES - Controllers de autenticación
// Capa: Presentation Layer (Controllers)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services';
import { CreateUsuarioDTO } from '@/backend/types';

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateUsuarioDTO = await request.json();

    // Validar datos requeridos
    if (!body.nombreCompleto || !body.email || !body.password || !body.rol) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan campos requeridos: nombreCompleto, email, password, rol' 
        },
        { status: 400 }
      );
    }

    // Capturar IP y User-Agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Registrar usuario con información de sesión
    const result = await AuthService.register(body, ipAddress, userAgent);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Usuario registrado exitosamente',
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Error en register:', error);
    const message = error instanceof Error ? error.message : 'Error al registrar usuario';
    return NextResponse.json(
      { 
        success: false, 
        error: message 
      },
      { status: 400 }
    );
  }
}
