import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services/authService';
import { ConversationService } from '@/backend/services/conversationService';

/**
 * POST /api/conversations/start
 * Inicia o obtiene una conversación entre el usuario autenticado y un fotógrafo
 * Body: { fotografoId: number, reservaId?: number }
 */
export async function POST(request: NextRequest) {
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
        const { fotografoId, reservaId } = body;

        if (!fotografoId) {
            return NextResponse.json(
                { success: false, error: 'fotografoId es requerido' },
                { status: 400 }
            );
        }

        // No permitir que un fotógrafo se contacte a sí mismo
        if (decoded.userId === fotografoId) {
            return NextResponse.json(
                { success: false, error: 'No puedes contactarte a ti mismo' },
                { status: 400 }
            );
        }

        // Obtener o crear conversación
        const conversacion = await ConversationService.getOrCreateConversation(
            decoded.userId,
            fotografoId,
            reservaId
        );

        return NextResponse.json({
            success: true,
            data: conversacion
        });

    } catch (error) {
        console.error('Error al iniciar conversación:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
