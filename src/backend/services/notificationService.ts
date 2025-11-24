import { NotificationRepository } from '../repositories/notificationRepository';
import { TipoNotificacion } from '@prisma/client';

export class NotificationService {
    static async createNotification(usuarioId: number, tipo: TipoNotificacion, titulo: string, mensaje: string, enlace?: string) {
        return await NotificationRepository.create({
            usuario: { connect: { id: usuarioId } },
            tipo,
            titulo,
            mensaje,
            enlace
        });
    }

    static async getUserNotifications(usuarioId: number) {
        const notifications = await NotificationRepository.findByUserId(usuarioId);
        const unreadCount = await NotificationRepository.countUnread(usuarioId);
        return { notifications, unreadCount };
    }

    static async markAsRead(id: number, usuarioId: number) {
        return await NotificationRepository.markAsRead(id, usuarioId);
    }

    static async markAllAsRead(usuarioId: number) {
        return await NotificationRepository.markAllAsRead(usuarioId);
    }
}
