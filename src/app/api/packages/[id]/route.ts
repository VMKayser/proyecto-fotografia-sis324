/**
 * GET /api/packages/[id] - Obtener paquete por ID
 * PUT /api/packages/[id] - Actualizar paquete
 * PATCH /api/packages/[id] - Actualizar parcialmente (ej: toggle activo)
 * DELETE /api/packages/[id] - Eliminar paquete
 */

import { NextRequest, NextResponse } from 'next/server';
import { PackageService } from '@/backend/services/packageService';
import { AuthService } from '@/backend/services/authService';
import { ProfileService } from '@/backend/services/profileService';

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

    const package_ = await PackageService.getPackageById(id);

    // Mapear titulo → nombre y duracionHoras → duracion para compatibilidad con frontend
    const mappedPackage = {
      ...package_,
      nombre: package_.titulo,
      duracion: package_.duracionHoras,
    };

    return NextResponse.json({
      success: true,
      data: mappedPackage,
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener paquete',
      },
      { status: error instanceof Error && error.message === 'Paquete no encontrado' ? 404 : 500 }
    );
  }
}

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

    // Verificar que el paquete pertenece al fotógrafo
    const package_ = await PackageService.getPackageById(id);
    const profile = await ProfileService.getProfileByUserId(decoded.userId);

    if (!profile || package_.fotografoId !== profile.id) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para editar este paquete' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Mapear nombre → titulo para compatibilidad con el frontend
    // Solo incluir campos que Prisma conoce
    const packageData: Record<string, unknown> = {};

    if (data.nombre || data.titulo) {
      packageData.titulo = data.nombre || data.titulo;
    }
    if (data.descripcion !== undefined) {
      packageData.descripcion = data.descripcion;
    }
    if (data.precio !== undefined) {
      packageData.precio = data.precio;
    }
    if (data.duracion || data.duracionHoras) {
      packageData.duracionHoras = data.duracion || data.duracionHoras;
    }
    if (data.moneda !== undefined) {
      packageData.moneda = data.moneda;
    }
    if (data.incluye !== undefined) {
      packageData.incluye = data.incluye;
    }
    if (data.imagenUrl !== undefined) {
      packageData.imagenUrl = data.imagenUrl;
    }
    if (data.activo !== undefined) {
      packageData.activo = data.activo;
    }
    if (data.destacado !== undefined) {
      packageData.destacado = data.destacado;
    }

    const updatedPackage = await PackageService.updatePackage(id, packageData);

    // Mapear titulo → nombre y duracionHoras → duracion para compatibilidad con frontend
    const mappedPackage = {
      ...updatedPackage,
      nombre: updatedPackage.titulo,
      duracion: updatedPackage.duracionHoras,
    };

    return NextResponse.json({
      success: true,
      data: mappedPackage,
    });
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar paquete',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
        { success: false, error: 'No tienes permiso para editar este paquete' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Mapear nombre → titulo para compatibilidad con el frontend
    // Solo incluir campos que Prisma conoce
    const packageData: Record<string, unknown> = {};

    if (data.nombre || data.titulo) {
      packageData.titulo = data.nombre || data.titulo;
    }
    if (data.descripcion !== undefined) {
      packageData.descripcion = data.descripcion;
    }
    if (data.precio !== undefined) {
      packageData.precio = data.precio;
    }
    if (data.duracion || data.duracionHoras) {
      packageData.duracionHoras = data.duracion || data.duracionHoras;
    }
    if (data.moneda !== undefined) {
      packageData.moneda = data.moneda;
    }
    if (data.incluye !== undefined) {
      packageData.incluye = data.incluye;
    }
    if (data.imagenUrl !== undefined) {
      packageData.imagenUrl = data.imagenUrl;
    }
    if (data.activo !== undefined) {
      packageData.activo = data.activo;
    }
    if (data.destacado !== undefined) {
      packageData.destacado = data.destacado;
    }

    const updatedPackage = await PackageService.updatePackage(id, packageData);

    // Mapear titulo → nombre y duracionHoras → duracion para compatibilidad con frontend
    const mappedPackage = {
      ...updatedPackage,
      nombre: updatedPackage.titulo,
      duracion: updatedPackage.duracionHoras,
    };

    return NextResponse.json({
      success: true,
      data: mappedPackage,
    });
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar paquete',
      },
      { status: 500 }
    );
  }
}

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
