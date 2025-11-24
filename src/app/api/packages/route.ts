/**
 * GET /api/packages - Obtener todos los paquetes
 * POST /api/packages - Crear nuevo paquete
 */

export { dynamic } from '@/backend/config/routeConfig';
import { NextRequest, NextResponse } from 'next/server';
import { PackageService } from '@/backend/services/packageService';
import { AuthService } from '@/backend/services/authService';
import { ProfileService } from '@/backend/services/profileService';
import { Paquete } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fotografoId = searchParams.get('fotografoId');
    const destacado = searchParams.get('destacado');

    const filters = {
      fotografoId: fotografoId ? parseInt(fotografoId) : undefined,
      destacado: destacado === 'true',
      activo: true,
    };

    const packages = await PackageService.getAllPackages(filters);

    // Mapear titulo → nombre y duracionHoras → duracion para compatibilidad con frontend
    const mappedPackages = packages.map((pkg: Paquete) => ({
      ...pkg,
      nombre: pkg.titulo,
      duracion: pkg.duracionHoras,
    }));

    return NextResponse.json({
      success: true,
      data: mappedPackages,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener paquetes',
      },
      { status: 500 }
    );
  }
}

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

    // Mapear nombre → titulo para compatibilidad con el frontend
    const packageData = {
      titulo: data.nombre || data.titulo,
      descripcion: data.descripcion,
      precio: data.precio,
      duracionHoras: data.duracion || data.duracionHoras,
      moneda: data.moneda,
      incluye: data.incluye,
      imagenUrl: data.imagenUrl,
    };

    const package_ = await PackageService.createPackage({
      fotografoId: profile.id,
      ...packageData,
    });

    // Mapear titulo → nombre y duracionHoras → duracion para compatibilidad con frontend
    const mappedPackage = {
      ...package_,
      nombre: package_.titulo,
      duracion: package_.duracionHoras,
    };

    return NextResponse.json({
      success: true,
      data: mappedPackage,
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
