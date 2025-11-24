/**
 * POST /api/packages
 * Crear nuevo paquete
 */

import { NextRequest, NextResponse } from 'next/server';
import { PackageService } from '@/backend/services/packageService';
import { AuthService } from '@/backend/services/authService';
import { ProfileService } from '@/backend/services/profileService';

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

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar que el usuario tiene un perfil de fotógrafo
    const profile = await ProfileService.getProfileByUserId(decoded.userId);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Necesitas un perfil de fotógrafo para crear paquetes' },
        { status: 403 }
      );
    }

    const data = await request.json();

    const package_ = await PackageService.createPackage({
      fotografoId: profile.id,
      ...data,
    });

    return NextResponse.json({
      success: true,
      data: package_,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear paquete',
      },
      { status: 500 }
    );
  }
}
