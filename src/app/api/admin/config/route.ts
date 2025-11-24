/**
 * GET /api/admin/config - Obtener configuración del sistema
 * PUT /api/admin/config - Actualizar configuración del sistema
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services/authService';
import { prisma } from '@/backend/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await AuthService.verifyToken(token);

    if (!decoded || decoded.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Se requieren permisos de administrador' },
        { status: 403 }
      );
    }

    // Obtener configuración
    const configs = await prisma.configuracionSistema.findMany();

    return NextResponse.json({
      success: true,
      data: configs,
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await AuthService.verifyToken(token);

    if (!decoded || decoded.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Se requieren permisos de administrador' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { clave, valor, descripcion } = body;

    if (!clave) {
      return NextResponse.json(
        { error: 'La clave es requerida' },
        { status: 400 }
      );
    }

    // Upsert configuración
    const config = await prisma.configuracionSistema.upsert({
      where: { clave },
      update: {
        valor: valor || null,
        descripcion: descripcion || null,
      },
      create: {
        clave,
        valor: valor || null,
        descripcion: descripcion || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: config,
      message: 'Configuración actualizada correctamente',
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    );
  }
}
