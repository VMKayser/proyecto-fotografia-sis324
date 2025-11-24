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
        // En este caso, no borramos el perfil, solo notificamos el rechazo.
        // Podríamos tener un campo 'estadoVerificacion' para ser más explícitos.

        const perfil = await prisma.perfilFotografo.findUnique({ where: { id } });
        if (perfil) {
            await NotificationService.createNotification(
                perfil.usuarioId,
                TipoNotificacion.SISTEMA,
                'Verificación Rechazada',
                'Tu solicitud de verificación ha sido rechazada. Por favor revisa que tu documento de identidad sea legible y vuelve a intentarlo.',
                '/perfil'
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
    }
}
