/**
 * POST /api/solicitudes-destacado - Crear solicitud de perfil destacado (fotógrafos)
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services/authService';
import { prisma } from '@/backend/lib/prisma';

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
        { success: false, error: 'Se requiere rol de fotógrafo' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { fotografoId, dias, precio, urlComprobante, referenciaPago, notasFotografo } = body;

    // Validar datos requeridos
    if (!fotografoId || !dias || !precio || !urlComprobante) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos (fotografoId, dias, precio, urlComprobante)' },
        { status: 400 }
      );
    }

    // Verificar que el perfil existe y pertenece al usuario autenticado
    const perfil = await prisma.perfilFotografo.findUnique({
      where: { id: fotografoId },
      include: { usuario: true },
    });

    if (!perfil) {
      return NextResponse.json(
        { success: false, error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    if (perfil.usuarioId !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para hacer solicitudes en este perfil' },
        { status: 403 }
      );
    }

    // Verificar si ya tiene una solicitud pendiente
    const solicitudPendiente = await prisma.solicitudDestacado.findFirst({
      where: {
        fotografoId,
        estado: 'PENDIENTE',
      },
    });

    if (solicitudPendiente) {
      return NextResponse.json(
        { success: false, error: 'Ya tienes una solicitud pendiente. Espera a que sea revisada.' },
        { status: 400 }
      );
    }

    // Crear la solicitud
    const solicitud = await prisma.solicitudDestacado.create({
      data: {
        fotografoId,
        dias,
        precio,
        urlComprobante,
        referenciaPago: referenciaPago || null,
        notasFotografo: notasFotografo || null,
        estado: 'PENDIENTE',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitud creada exitosamente. Será revisada por el administrador.',
      data: solicitud,
    });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear solicitud' },
      { status: 500 }
    );
  }
}
