import prisma from '@/backend/lib/prisma';
import { TipoSolicitud, EstadoSolicitud } from '@prisma/client';

export class SolicitudCambioRepository {
    /**
     * Crear nueva solicitud de cambio
     */
    static async create(data: {
        reservaId: number;
        tipo: TipoSolicitud;
        datosOriginales?: Record<string, unknown>;
        nuevaFecha?: Date;
        nuevaHora?: string;
        nuevaUbicacion?: string;
        motivoEdicion?: string;
        motivoCancelacion?: string;
        penalizacion?: number;
    }) {
        return await prisma.solicitudCambio.create({
            data: {
                reservaId: data.reservaId,
                tipo: data.tipo,
                datosOriginales: data.datosOriginales,
                nuevaFecha: data.nuevaFecha,
                nuevaHora: data.nuevaHora,
                nuevaUbicacion: data.nuevaUbicacion,
                motivoEdicion: data.motivoEdicion,
                motivoCancelacion: data.motivoCancelacion,
                penalizacion: data.penalizacion || 0,
            },
            include: {
                reserva: {
                    include: {
                        cliente: true,
                        fotografo: true,
                        paquete: true,
                    },
                },
            },
        });
    }

    /**
     * Buscar solicitudes por reserva
     */
    static async findByReserva(reservaId: number) {
        return await prisma.solicitudCambio.findMany({
            where: { reservaId },
            include: {
                reserva: {
                    include: {
                        cliente: true,
                        fotografo: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Buscar solicitudes pendientes de un fotógrafo
     */
    static async findPendingByPhotographer(fotografoId: number) {
        return await prisma.solicitudCambio.findMany({
            where: {
                estado: EstadoSolicitud.PENDIENTE,
                reserva: {
                    fotografoId,
                },
            },
            include: {
                reserva: {
                    include: {
                        cliente: true,
                        fotografo: true,
                        paquete: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Buscar por ID
     */
    static async findById(id: number) {
        return await prisma.solicitudCambio.findUnique({
            where: { id },
            include: {
                reserva: {
                    include: {
                        cliente: true,
                        fotografo: true,
                        paquete: true,
                    },
                },
            },
        });
    }

    /**
     * Actualizar estado de solicitud
     */
    static async updateStatus(
        id: number,
        estado: EstadoSolicitud,
        respuestaFotografo?: string
    ) {
        return await prisma.solicitudCambio.update({
            where: { id },
            data: {
                estado,
                respuestaFotografo,
                fechaRespuesta: new Date(),
            },
            include: {
                reserva: {
                    include: {
                        cliente: true,
                        fotografo: true,
                    },
                },
            },
        });
    }

    /**
     * Verificar si existe solicitud pendiente para una reserva
     */
    static async hasPendingRequest(reservaId: number) {
        const count = await prisma.solicitudCambio.count({
            where: {
                reservaId,
                estado: EstadoSolicitud.PENDIENTE,
            },
        });
        return count > 0;
    }
}
