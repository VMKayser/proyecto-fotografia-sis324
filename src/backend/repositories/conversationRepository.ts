import prisma from '@/backend/lib/prisma';

export class ConversationRepository {
    static async create(data: {
        clienteId: number;
        fotografoId: number;
        reservaId?: number;
    }) {
        return await prisma.conversacion.create({
            data: {
                clienteId: data.clienteId,
                fotografoId: data.fotografoId,
                reservaId: data.reservaId
            },
            include: {
                cliente: true,
                fotografo: {
                    include: {
                        perfilFotografo: true
                    }
                },
                reserva: true,
                mensajes: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
    }

    static async findByParticipants(clienteId: number, fotografoId: number) {
        return await prisma.conversacion.findFirst({
            where: {
                clienteId,
                fotografoId
            },
            include: {
                cliente: true,
                fotografo: {
                    include: {
                        perfilFotografo: true
                    }
                },
                reserva: true,
                mensajes: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
    }

    static async findByUser(usuarioId: number) {
        return await prisma.conversacion.findMany({
            where: {
                OR: [
                    { clienteId: usuarioId },
                    { fotografoId: usuarioId }
                ]
            },
            include: {
                cliente: true,
                fotografo: {
                    include: {
                        perfilFotografo: true
                    }
                },
                reserva: true,
                mensajes: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
    }

    static async findById(id: number) {
        return await prisma.conversacion.findUnique({
            where: { id },
            include: {
                cliente: true,
                fotografo: {
                    include: {
                        perfilFotografo: true
                    }
                },
                reserva: true,
                mensajes: {
                    include: {
                        remitente: true
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
    }

    static async update(id: number, data: { reservaId?: number }) {
        return await prisma.conversacion.update({
            where: { id },
            data,
            include: {
                cliente: true,
                fotografo: {
                    include: {
                        perfilFotografo: true
                    }
                },
                reserva: true
            }
        });
    }
}
