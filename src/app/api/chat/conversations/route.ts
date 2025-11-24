import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/backend/services/chatService';
import { AuthService } from '@/backend/services/authService';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = await AuthService.verifyToken(token);

        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 });
        }

        const body = await request.json();
        const { reservaId } = body;

        if (!reservaId) {
            return NextResponse.json({ success: false, error: 'reservaId es requerido' }, { status: 400 });
        }

        const conversation = await ChatService.getOrCreateConversation(Number(reservaId), decoded.userId);

        return NextResponse.json({ success: true, data: conversation });
    } catch (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Error interno' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = await AuthService.verifyToken(token);

        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 });
        }

        const conversations = await ChatService.getUserConversations(decoded.userId, decoded.rol);

        return NextResponse.json({ success: true, data: conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Error interno' },
            { status: 500 }
        );
    }
}
