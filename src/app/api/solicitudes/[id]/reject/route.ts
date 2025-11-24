import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services/authService';
import { SolicitudCambioService } from '@/backend/services/solicitudCambioService';

/**
 * POST /api/solicitudes/[id]/reject
 * Fotógrafo rechaza solicitud
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

        if (!decoded || decoded.rol !== 'FOTOGRAFO') {
            return NextResponse.json(
                { success: false, error: 'Solo fotógrafos pueden rechazar solicitudes' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { respuesta } = body;

        if (!respuesta || respuesta.trim().length < 5) {
            return NextResponse.json(
                { success: false, error: 'Debes proporcionar una respuesta (mínimo 5 caracteres)' },
                { status: 400 }
            );
        }

        const solicitudId = parseInt(params.id);

        const solicitud = await SolicitudCambioService.rechazarSolicitud(
            solicitudId,
            respuesta
        );

        return NextResponse.json({
            success: true,
            data: solicitud,
            message: 'Solicitud rechazada',
        });

    } catch (error) {
        console.error('Error al rechazar solicitud:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Error interno del servidor'
            },
            { status: 500 }
        );
    }
}
