import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services/authService';
import { SolicitudCambioService } from '@/backend/services/solicitudCambioService';

/**
 * POST /api/reservations/[id]/request-cancellation
 * Cliente solicita cancelación de reserva
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        const decoded = await AuthService.verifyToken(token);

        if (!decoded) {
            return NextResponse.json(
                { success: false, error: 'Token inválido' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { motivoCancelacion } = body;

        if (!motivoCancelacion || motivoCancelacion.trim().length < 10) {
            return NextResponse.json(
                { success: false, error: 'Debes proporcionar un motivo de cancelación (mínimo 10 caracteres)' },
                { status: 400 }
            );
        }

        const reservaId = parseInt(params.id);

        const solicitud = await SolicitudCambioService.solicitarCancelacion(
            reservaId,
            motivoCancelacion
        );

        return NextResponse.json({
            success: true,
            data: solicitud,
            message: 'Solicitud de cancelación enviada al fotógrafo',
        });

    } catch (error) {
        console.error('Error al solicitar cancelación:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Error interno del servidor'
            },
            { status: 500 }
        );
    }
}
