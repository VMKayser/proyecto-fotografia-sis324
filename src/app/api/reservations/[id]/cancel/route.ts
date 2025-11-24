/**
 * PATCH /api/reservations/[id]/cancel
 * Cancelar reserva
 */

import { NextRequest, NextResponse } from 'next/server';
import { ReservationService } from '@/backend/services/reservationService';
import { AuthService } from '@/backend/services/authService';

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

    const reservation = await ReservationService.cancelReservation(id, decoded.userId);

    return NextResponse.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error('Error canceling reservation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cancelar reserva',
      },
      { status: 500 }
    );
  }
}
