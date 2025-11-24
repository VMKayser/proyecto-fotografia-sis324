import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/lib/prisma';
import { AuthService } from '@/backend/services/authService';
import { NotificationService } from '@/backend/services/notificationService';
import { TipoNotificacion } from '@prisma/client';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

        const token = authHeader.split(' ')[1];
        const decoded = await AuthService.verifyToken(token);
        if (!decoded || decoded.rol !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
        }

        const id = Number(params.id);

        const solicitud = await prisma.solicitudDestacado.update({
            where: { id },
            data: { estado: 'RECHAZADO' },
            include: { fotografo: true }
        });

        await NotificationService.createNotification(
            solicitud.fotografo.usuarioId,
            TipoNotificacion.SISTEMA,
            'Solicitud de Destacado',
            'Tu solicitud para ser destacado ha sido rechazada en esta ocasión.',
            '/perfil'
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
    }
}
