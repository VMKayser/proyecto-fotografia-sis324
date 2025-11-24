/**
 * DELETE /api/packages/[id]
 * Eliminar paquete (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PackageService } from '@/backend/services/packageService';
import { AuthService } from '@/backend/services/authService';
import { ProfileService } from '@/backend/services/profileService';

export async function DELETE(
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

    // Verificar que el paquete pertenece al fotógrafo
    const package_ = await PackageService.getPackageById(id);
    const profile = await ProfileService.getProfileByUserId(decoded.userId);
    
    if (!profile || package_.fotografoId !== profile.id) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para eliminar este paquete' },
        { status: 403 }
      );
    }

    await PackageService.deletePackage(id);

    return NextResponse.json({
      success: true,
      message: 'Paquete eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar paquete',
      },
      { status: 500 }
    );
  }
}
