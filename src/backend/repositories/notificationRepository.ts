import prisma from '@/backend/lib/prisma';
import { Prisma } from '@prisma/client';

export class NotificationRepository {
    static async create(data: Prisma.NotificacionCreateInput) {
        return await prisma.notificacion.create({
            data
        });
    }

    static async findByUserId(usuarioId: number, limit: number = 20) {
        return await prisma.notificacion.findMany({
            where: { usuarioId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }

    static async countUnread(usuarioId: number) {
        return await prisma.notificacion.count({
            where: {
                usuarioId,
                leido: false
            }
        });
    }

    static async markAsRead(id: number, usuarioId: number) {
        // Verificar que la notificación pertenezca al usuario
        const notificacion = await prisma.notificacion.findUnique({
            where: { id }
        });

        if (!notificacion || notificacion.usuarioId !== usuarioId) {
            throw new Error('Notificación no encontrada o no autorizada');
        }

        return await prisma.notificacion.update({
            where: { id },
            data: { leido: true }
        });
    }

    static async markAllAsRead(usuarioId: number) {
        return await prisma.notificacion.updateMany({
            where: {
                usuarioId,
                leido: false
            },
            data: { leido: true }
        });
    }
}
