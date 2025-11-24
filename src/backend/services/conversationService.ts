import { ConversationRepository } from '../repositories/conversationRepository';

export class ConversationService {
    /**
     * Obtiene o crea una conversación entre un cliente y un fotógrafo
     * Si ya existe una conversación entre ellos, la retorna
     * Si no existe, crea una nueva (opcionalmente vinculada a una reserva)
     */
    static async getOrCreateConversation(
        clienteId: number,
        fotografoId: number,
        reservaId?: number
    ) {
        // Buscar conversación existente
        const existing = await ConversationRepository.findByParticipants(clienteId, fotografoId);

        if (existing) {
            // Si existe y tenemos reservaId, vincularla si aún no está vinculada
            if (reservaId && !existing.reservaId) {
                return await ConversationRepository.update(existing.id, { reservaId });
            }
            return existing;
        }

        // Crear nueva conversación
        return await ConversationRepository.create({
            clienteId,
            fotografoId,
            reservaId
        });
    }

    /**
     * Obtiene todas las conversaciones de un usuario (como cliente o fotógrafo)
     */
    static async getUserConversations(usuarioId: number) {
        return await ConversationRepository.findByUser(usuarioId);
    }

    /**
     * Obtiene una conversación específica
     */
    static async getConversation(conversacionId: number) {
        return await ConversationRepository.findById(conversacionId);
    }
}
