import { prisma } from '@/backend/lib/prisma';
import { Prisma } from '@prisma/client';

export class ChatRepository {
    /**
     * Buscar conversación por ID de reserva
     */
    static async findByReservationId(reservaId: number) {
        return prisma.conversacion.findFirst({
            where: { reservaId },
            include: {
                mensajes: {
                    orderBy: { createdAt: 'asc' },
                    take: 1, // Solo para preview si se necesita
                },
                cliente: {
                    select: { id: true, nombreCompleto: true, email: true },
                },
                fotografo: {
                    select: { id: true, nombreCompleto: true, email: true },
                },
            },
        });
    }

    /**
     * Buscar conversación por ID
     */
    static async findById(id: number) {
        return prisma.conversacion.findUnique({
            where: { id },
            include: {
                reserva: {
                    select: {
                        id: true,
                        fechaEvento: true,
                        estado: true,
                        paquete: { select: { titulo: true } },
                    },
                },
                cliente: {
                    select: { id: true, nombreCompleto: true, email: true },
                },
                fotografo: {
                    select: { id: true, nombreCompleto: true, email: true },
                },
            },
        });
    }

    /**
     * Crear nueva conversación
     */
    static async create(data: Prisma.ConversacionCreateInput) {
        return prisma.conversacion.create({
            data,
            include: {
                cliente: {
                    select: { id: true, nombreCompleto: true, email: true },
                },
                fotografo: {
                    select: { id: true, nombreCompleto: true, email: true },
                },
            },
        });
    }

    /**
     * Obtener mensajes de una conversación
     */
    static async getMessages(conversacionId: number, limit = 50, offset = 0) {
        return prisma.mensaje.findMany({
            where: { conversacionId },
            orderBy: { createdAt: 'asc' },
            take: limit,
            skip: offset,
            include: {
                remitente: {
                    select: { id: true, nombreCompleto: true },
                },
            },
        });
    }

    /**
     * Agregar mensaje a una conversación
     */
    static async addMessage(data: Prisma.MensajeCreateInput) {
        return prisma.mensaje.create({
            data,
            include: {
                remitente: {
                    select: { id: true, nombreCompleto: true },
                },
            },
        });
    }

    /**
     * Obtener conversaciones de un usuario (ya sea cliente o fotógrafo)
     */
    static async getUserConversations(userId: number, rol: 'CLIENTE' | 'FOTOGRAFO') {
        const whereClause = rol === 'CLIENTE'
            ? { clienteId: userId }
            : { fotografoId: userId };

        return prisma.conversacion.findMany({
            where: whereClause,
            orderBy: { updatedAt: 'desc' },
            include: {
                reserva: {
                    select: {
                        id: true,
                        fechaEvento: true,
                        estado: true,
                    },
                },
                cliente: {
                    select: { id: true, nombreCompleto: true },
                },
                fotografo: {
                    select: { id: true, nombreCompleto: true },
                },
                mensajes: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });
    }

    /**
     * Marcar mensajes como leídos
     */
    static async markMessagesAsRead(conversacionId: number, userId: number) {
        // Marcar como leídos los mensajes que NO fueron enviados por el usuario actual
        return prisma.mensaje.updateMany({
            where: {
                conversacionId,
                remitenteId: { not: userId },
                leido: false,
            },
            data: {
                leido: true,
            },
        });
    }
}
