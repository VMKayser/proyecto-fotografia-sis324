/**
 * POST /api/profiles/destacado-request - Crear solicitud para destacar perfil
 * Guarda la información de la solicitud para revisión del admin
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
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await AuthService.verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Solo fotógrafos pueden crear solicitudes
    if (decoded.rol !== 'FOTOGRAFO') {
      return NextResponse.json(
        { error: 'Solo fotógrafos pueden solicitar destacarse' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { profileId, days, price, paymentProofUrl, paymentReference, paymentNotes } = body;

    // Validar datos requeridos
    if (!profileId || !days || !price || !paymentProofUrl) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el perfil pertenece al usuario
    const profile = await prisma.perfilFotografo.findUnique({
      where: { id: profileId },
      select: { usuarioId: true },
    });

    if (!profile || profile.usuarioId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Perfil no encontrado o no autorizado' },
        { status: 404 }
      );
    }

    // Crear solicitud en la tabla dedicada
    const solicitud = await prisma.solicitudDestacado.create({
      data: {
        fotografoId: profileId,
        dias: days,
        precio: price,
        urlComprobante: paymentProofUrl,
        referenciaPago: paymentReference || null,
        notasFotografo: paymentNotes || null,
        estado: 'PENDIENTE',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitud enviada correctamente. Nuestro equipo la revisará pronto.',
      data: solicitud,
    });
  } catch (error) {
    console.error('Error al procesar solicitud de destacado:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
