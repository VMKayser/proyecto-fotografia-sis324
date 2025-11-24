/**
 * GET /api/reservations/[id]
 * Obtener reserva por ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { ReservationService } from '@/backend/services/reservationService';
import { AuthService } from '@/backend/services/authService';

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

    const reservation = await ReservationService.getReservationById(id);

    // Verificar que el usuario tiene permiso para ver esta reserva
    if (reservation.clienteId !== decoded.userId && reservation.fotografoId !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para ver esta reserva' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener reserva',
      },
      { status: error instanceof Error && error.message === 'Reserva no encontrada' ? 404 : 500 }
    );
  }
}

/**
 * PUT /api/reservations/[id]
 * Actualizar/editar una reserva
 */
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

    // Obtener la reserva actual
    const currentReservation = await ReservationService.getReservationById(id);

    // Verificar permisos (solo el cliente o fotógrafo pueden editar)
    if (currentReservation.clienteId !== decoded.userId && currentReservation.fotografoId !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para editar esta reserva' },
        { status: 403 }
      );
    }

    // Verificar que la reserva no esté completada o cancelada
    if (currentReservation.estado === 'COMPLETADA' || currentReservation.estado === 'CANCELADA') {
      return NextResponse.json(
        { success: false, error: 'No puedes editar una reserva completada o cancelada' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Actualizar la reserva
    const updatedReservation = await ReservationService.updateReservation(id, body);

    return NextResponse.json({
      success: true,
      data: updatedReservation,
      message: 'Reserva actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar reserva',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reservations/[id]
 * Actualización parcial de reserva (por ejemplo, cambiar estado)
 */
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

    // Obtener la reserva actual
    const currentReservation = await ReservationService.getReservationById(id);

    // Verificar permisos
    if (currentReservation.clienteId !== decoded.userId && currentReservation.fotografoId !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para modificar esta reserva' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Actualizar la reserva
    const updatedReservation = await ReservationService.updateReservation(id, body);

    return NextResponse.json({
      success: true,
      data: updatedReservation,
      message: 'Reserva actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error patching reservation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar reserva',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reservations/[id]
 * Eliminar una reserva
 */
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

    // Obtener la reserva actual
    const currentReservation = await ReservationService.getReservationById(id);

    // Verificar permisos (solo el cliente puede eliminar su propia reserva)
    if (currentReservation.clienteId !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Solo el cliente puede eliminar su reserva' },
        { status: 403 }
      );
    }

    // Solo se puede eliminar si está en estado PENDIENTE
    if (currentReservation.estado !== 'PENDIENTE') {
      return NextResponse.json(
        { success: false, error: 'Solo puedes eliminar reservas en estado PENDIENTE. Para reservas confirmadas, solicita una cancelación.' },
        { status: 400 }
      );
    }

    // Eliminar la reserva
    await ReservationService.deleteReservation(id);

    return NextResponse.json({
      success: true,
      message: 'Reserva eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar reserva',
      },
      { status: 500 }
    );
  }
}
