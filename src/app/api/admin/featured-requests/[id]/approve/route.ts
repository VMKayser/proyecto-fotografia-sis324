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

        // Iniciar transacción
        await prisma.$transaction(async (tx) => {
            // Actualizar solicitud
            const solicitud = await tx.solicitudDestacado.update({
                where: { id },
                data: { estado: 'APROBADO' },
                include: { fotografo: true }
            });

            // Calcular fecha de fin de destacado
            const dias = solicitud.dias || 30;
            const fechaFin = new Date();
            fechaFin.setDate(fechaFin.getDate() + dias);

            // Actualizar perfil del fotógrafo
            await tx.perfilFotografo.update({
                where: { id: solicitud.fotografoId },
                data: { destacadoHasta: fechaFin }
            });

            // Notificar
            await NotificationService.createNotification(
                solicitud.fotografo.usuarioId,
                TipoNotificacion.SISTEMA,
                'Perfil Destacado',
                '¡Tu solicitud ha sido aprobada! Tu perfil ahora aparece como destacado.',
                '/perfil'
            );
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
    }
}
