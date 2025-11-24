import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/backend/services/chatService';
import { AuthService } from '@/backend/services/authService';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const conversationId = Number(params.id);
        const messages = await ChatService.getMessages(conversationId, decoded.userId);

        return NextResponse.json({ success: true, data: messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Error interno' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
        const { contenido } = body;

        if (!contenido) {
            return NextResponse.json({ success: false, error: 'Contenido es requerido' }, { status: 400 });
        }

        const conversationId = Number(params.id);
        const message = await ChatService.sendMessage(conversationId, decoded.userId, contenido);

        return NextResponse.json({ success: true, data: message });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Error interno' },
            { status: 500 }
        );
    }
}
