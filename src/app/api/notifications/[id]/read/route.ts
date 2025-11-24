import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/backend/services/notificationService';
import { AuthService } from '@/backend/services/authService';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = await AuthService.verifyToken(token);

        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 });
        }

        const id = Number(params.id);
        await NotificationService.markAsRead(id, decoded.userId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
    }
}
