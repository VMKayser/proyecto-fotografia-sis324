/**
 * PATCH /api/reservations/[id]/comprobante/review
 * Aprobar o rechazar comprobante (fotógrafo)
 */

import { NextRequest, NextResponse } from 'next/server';
import { ReservationService } from '@/backend/services/reservationService';
import { AuthService } from '@/backend/services/authService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

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
        { success: false, error: 'Solo el fotógrafo puede revisar comprobantes' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const reservation = await ReservationService.reviewComprobante(id, decoded.userId, body);

    return NextResponse.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error('Error al revisar comprobante:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'No se pudo revisar el comprobante',
      },
      { status: 400 }
    );
  }
}
