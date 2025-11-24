import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services/authService';
import { SolicitudCambioRepository } from '@/backend/repositories/solicitudCambioRepository';

/**
 * GET /api/solicitudes/pending
 * Obtener solicitudes pendientes del fotógrafo autenticado
 */
export async function GET(request: NextRequest) {
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
                { success: false, error: 'Solo fotógrafos pueden ver solicitudes' },
                { status: 403 }
            );
        }

        const solicitudes = await SolicitudCambioRepository.findPendingByPhotographer(
            decoded.userId
        );

        return NextResponse.json({
            success: true,
            data: solicitudes,
        });

    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Error interno del servidor'
            },
            { status: 500 }
        );
    }
}
