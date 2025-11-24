import { ChatRepository } from '../repositories/chatRepository';
import { ReservationRepository } from '../repositories/reservationRepository';


export class ChatService {
    /**
     * Obtener o crear conversación para una reserva
     */
    static async getOrCreateConversation(reservaId: number, userId: number) {
        // 1. Verificar si ya existe
        const existing = await ChatRepository.findByReservationId(reservaId);
        if (existing) {
            // Verificar que el usuario pertenece a la conversación
            if (existing.clienteId !== userId && existing.fotografoId !== userId) {
                throw new Error('No tienes permiso para acceder a esta conversación');
            }
            return existing;
        }

        // 2. Si no existe, verificar la reserva
        const reserva = await ReservationRepository.findById(reservaId);
        if (!reserva) {
            throw new Error('Reserva no encontrada');
        }

        // Verificar que el usuario es parte de la reserva
        if (reserva.clienteId !== userId && reserva.fotografoId !== userId) {
            throw new Error('No tienes permiso para crear un chat para esta reserva');
        }

        // 3. Crear conversación
        return ChatRepository.create({
            reserva: { connect: { id: reservaId } },
            cliente: { connect: { id: reserva.clienteId } },
            fotografo: { connect: { id: reserva.fotografoId } },
        });
    }

    /**
     * Enviar mensaje
     */
    static async sendMessage(conversacionId: number, userId: number, contenido: string) {
        if (!contenido.trim()) {
            throw new Error('El mensaje no puede estar vacío');
        }

        const conversacion = await ChatRepository.findById(conversacionId);
        if (!conversacion) {
            throw new Error('Conversación no encontrada');
        }

        if (conversacion.clienteId !== userId && conversacion.fotografoId !== userId) {
            throw new Error('No tienes permiso para enviar mensajes en esta conversación');
        }

        return ChatRepository.addMessage({
            conversacion: { connect: { id: conversacionId } },
            remitente: { connect: { id: userId } },
            contenido: contenido.trim(),
            leido: false,
        });
    }

    /**
     * Obtener mensajes
     */
    static async getMessages(conversacionId: number, userId: number) {
        const conversacion = await ChatRepository.findById(conversacionId);
        if (!conversacion) {
            throw new Error('Conversación no encontrada');
        }

        if (conversacion.clienteId !== userId && conversacion.fotografoId !== userId) {
            throw new Error('No tienes permiso para ver esta conversación');
        }

        // Marcar como leídos al obtenerlos
        await ChatRepository.markMessagesAsRead(conversacionId, userId);

        return ChatRepository.getMessages(conversacionId);
    }

    /**
     * Listar conversaciones del usuario
     */
    static async getUserConversations(userId: number, rol: string) {
        // Convertir rol string a enum si es necesario, o usar string si el repo lo soporta
        const userRol = rol === 'CLIENTE' ? 'CLIENTE' : 'FOTOGRAFO';
        return ChatRepository.getUserConversations(userId, userRol);
    }
}
