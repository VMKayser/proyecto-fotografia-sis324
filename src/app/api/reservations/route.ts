/**
 * GET /api/reservations
 * Obtener reservas (del usuario actual)
 */

export { dynamic } from '@/backend/config/routeConfig';
import { NextRequest, NextResponse } from 'next/server';
import { ReservationService } from '@/backend/services/reservationService';
import { AuthService } from '@/backend/services/authService';
import { EstadoReserva } from '@/backend/types';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const estadoFilter = estado && isEstadoReserva(estado) ? estado : undefined;

    const reservations = await ReservationService.getAllReservations({
      ...(decoded.rol === 'CLIENTE' ? { clienteId: decoded.userId } : {}),
      ...(decoded.rol === 'FOTOGRAFO' ? { fotografoId: decoded.userId } : {}),
      ...(estadoFilter ? { estado: estadoFilter } : {}),
    });

    return NextResponse.json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener reservas',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const payload = await request.json();

    const reservation = await ReservationService.createReservation({
      clienteId: decoded.userId,
      ...payload,
    });

    return NextResponse.json(
      {
        success: true,
        data: reservation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear reserva',
      },
      { status: 500 }
    );
  }
}

const isEstadoReserva = (value: string): value is EstadoReserva => {
  return (Object.values(EstadoReserva) as string[]).includes(value);
};
