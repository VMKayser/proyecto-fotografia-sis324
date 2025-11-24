/**
 * GET /api/admin/solicitudes-destacado - Obtener todas las solicitudes
 * PUT /api/admin/solicitudes-destacado - Aprobar/Rechazar solicitud
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services/authService';
import { prisma } from '@/backend/lib/prisma';
import { Prisma } from '@prisma/client';

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

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');

    // Obtener solicitudes con información del fotógrafo
    const whereClause: Prisma.SolicitudDestacadoWhereInput = {};
    if (estado) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      whereClause.estado = estado as any;
    }

    const solicitudes = await prisma.solicitudDestacado.findMany({
      where: whereClause,
      include: {
        fotografo: {
          include: {
            usuario: {
              select: {
                nombreCompleto: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: solicitudes,
    });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitudes' },
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
    const { solicitudId, accion, notasAdmin } = body;

    if (!solicitudId || !accion) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Obtener la solicitud
    const solicitud = await prisma.solicitudDestacado.findUnique({
      where: { id: solicitudId },
      include: {
        fotografo: true,
      },
    });

    if (!solicitud) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar solicitud
    const updatedSolicitud = await prisma.solicitudDestacado.update({
      where: { id: solicitudId },
      data: {
        estado: accion === 'APROBAR' ? 'APROBADO' : 'RECHAZADO',
        notasAdmin: notasAdmin || null,
        revisadoPor: decoded.userId,
        fechaRevision: new Date(),
      },
    });

    // Si se aprueba, actualizar destacadoHasta del fotógrafo
    if (accion === 'APROBAR') {
      const fechaActual = solicitud.fotografo.destacadoHasta
        ? new Date(solicitud.fotografo.destacadoHasta)
        : new Date();

      // Si ya está destacado, extender desde esa fecha, sino desde ahora
      const fechaInicio = fechaActual > new Date() ? fechaActual : new Date();
      const nuevaFecha = new Date(fechaInicio);
      nuevaFecha.setDate(nuevaFecha.getDate() + solicitud.dias);

      await prisma.perfilFotografo.update({
        where: { id: solicitud.fotografoId },
        data: {
          destacadoHasta: nuevaFecha,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: accion === 'APROBAR'
        ? 'Solicitud aprobada. El fotógrafo ha sido destacado.'
        : 'Solicitud rechazada.',
      data: updatedSolicitud,
    });
  } catch (error) {
    console.error('Error al procesar solicitud:', error);
    return NextResponse.json(
      { error: 'Error al procesar solicitud' },
      { status: 500 }
    );
  }
}
