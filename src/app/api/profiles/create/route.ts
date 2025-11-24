/**
 * POST /api/profiles
 * Crear nuevo perfil de fotógrafo
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '@/backend/services/profileService';
import { AuthService } from '@/backend/services/authService';

export async function POST(request: NextRequest) {
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

    if (!decoded || decoded.rol !== 'FOTOGRAFO') {
      return NextResponse.json(
        { success: false, error: 'Solo fotógrafos pueden crear perfiles' },
        { status: 403 }
      );
    }

    const data = await request.json();

    const profile = await ProfileService.createProfile({
      usuarioId: decoded.userId,
      ...data,
    });

    return NextResponse.json({
      success: true,
      data: profile,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear perfil',
      },
      { status: 500 }
    );
  }
}
