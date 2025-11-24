/**
 * POST /api/destacado/solicitar - Solicitar perfil destacado
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services/authService';
import { prisma } from '@/backend/lib/prisma';
import { getPrecioDestacado, DESTACADO_CONFIG } from '@/backend/config/monetization';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await AuthService.verifyToken(token);

    if (!decoded || decoded.rol !== 'FOTOGRAFO') {
      return NextResponse.json(
        { error: 'Solo los fotógrafos pueden solicitar perfil destacado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { dias, urlComprobante, referenciaPago, notasFotografo } = body;

    // Validar días
    if (!DESTACADO_CONFIG.DIAS_OPCIONES.includes(dias)) {
      return NextResponse.json(
        { error: 'Duración no válida. Opciones: 7, 30 o 90 días' },
        { status: 400 }
      );
    }

    // Validar comprobante
    if (!urlComprobante) {
      return NextResponse.json(
        { error: 'Debe subir un comprobante de pago' },
        { status: 400 }
      );
    }

    // Obtener perfil del fotógrafo
    const perfil = await prisma.perfilFotografo.findUnique({
      where: { usuarioId: decoded.userId },
    });

    if (!perfil) {
      return NextResponse.json(
        { error: 'Perfil de fotógrafo no encontrado' },
        { status: 404 }
      );
    }

    // Calcular precio
    const precio = getPrecioDestacado(dias);

    // Crear solicitud
    const solicitud = await prisma.solicitudDestacado.create({
      data: {
        fotografoId: perfil.id,
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
      message: 'Solicitud enviada correctamente. Será revisada por un administrador.',
      data: {
        solicitudId: solicitud.id,
        dias,
        precio,
        estado: 'PENDIENTE',
      },
    });
  } catch (error) {
    console.error('Error al crear solicitud de destacado:', error);
    return NextResponse.json(
      { error: 'Error al procesar solicitud' },
      { status: 500 }
    );
  }
}
