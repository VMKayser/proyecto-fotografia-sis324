import { SolicitudCambioRepository } from '../repositories/solicitudCambioRepository';
import { EstadoReserva, EstadoSolicitud, TipoSolicitud } from '@prisma/client';
import prisma from '../lib/prisma';

export class SolicitudCambioService {
    /**
     * Calcular penalización por cancelación según días restantes
     */
    static calcularPenalizacion(fechaEvento: Date, monto: number): number {
        const hoy = new Date();
        const diasRestantes = Math.ceil((fechaEvento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

        if (diasRestantes < 2) return monto * 0.50; // 50%
        if (diasRestantes < 7) return monto * 0.30; // 30%
        if (diasRestantes < 14) return monto * 0.15; // 15%
        return 0; // Sin penalización si cancela con >14 días
    }

    /**
     * Crear solicitud de cancelación
     */
    static async solicitarCancelacion(
        reservaId: number,
        motivoCancelacion: string
    ) {
        // Obtener reserva
        const reserva = await prisma.reserva.findUnique({
            where: { id: reservaId },
        });

        if (!reserva) {
            throw new Error('Reserva no encontrada');
        }

        if (![EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA].includes(reserva.estado)) {
            throw new Error('Solo puedes cancelar reservas pendientes o confirmadas');
        }

        // Verificar si ya hay solicitud pendiente
        const hasPending = await SolicitudCambioRepository.hasPendingRequest(reservaId);
        if (hasPending) {
            throw new Error('Ya existe una solicitud pendiente para esta reserva');
        }

        // Calcular penalización
        const penalizacion = this.calcularPenalizacion(reserva.fechaEvento, Number(reserva.monto));

        // Crear solicitud
        return await SolicitudCambioRepository.create({
            reservaId,
            tipo: TipoSolicitud.CANCELACION,
            motivoCancelacion,
            penalizacion,
            datosOriginales: {
                estado: reserva.estado,
                fechaEvento: reserva.fechaEvento,
                monto: Number(reserva.monto),
            },
        });
    }

    /**
     * Crear solicitud de edición
     */
    static async solicitarEdicion(
        reservaId: number,
        cambios: {
            nuevaFecha?: Date;
            nuevaHora?: string;
            nuevaUbicacion?: string;
            motivoEdicion: string;
        }
    ) {
        const reserva = await prisma.reserva.findUnique({
            where: { id: reservaId },
        });

        if (!reserva) {
            throw new Error('Reserva no encontrada');
        }

        if (![EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA].includes(reserva.estado)) {
            throw new Error('Solo puedes editar reservas pendientes o confirmadas');
        }

        const hasPending = await SolicitudCambioRepository.hasPendingRequest(reservaId);
        if (hasPending) {
            throw new Error('Ya existe una solicitud pendiente para esta reserva');
        }

        return await SolicitudCambioRepository.create({
            reservaId,
            tipo: TipoSolicitud.EDICION,
            nuevaFecha: cambios.nuevaFecha,
            nuevaHora: cambios.nuevaHora,
            nuevaUbicacion: cambios.nuevaUbicacion,
            motivoEdicion: cambios.motivoEdicion,
            datosOriginales: {
                fechaEvento: reserva.fechaEvento,
                horaEvento: reserva.horaEvento,
                ubicacionEvento: reserva.ubicacionEvento,
            },
        });
    }

    /**
     * Aprobar solicitud
     */
    static async aprobarSolicitud(solicitudId: number, respuestaFotografo?: string) {
        const solicitud = await SolicitudCambioRepository.findById(solicitudId);

        if (!solicitud) {
            throw new Error('Solicitud no encontrada');
        }

        if (solicitud.estado !== EstadoSolicitud.PENDIENTE) {
            throw new Error('La solicitud ya fue procesada');
        }

        // Actualizar solicitud
        await SolicitudCambioRepository.updateStatus(
            solicitudId,
            EstadoSolicitud.APROBADA,
            respuestaFotografo
        );

        // Aplicar cambios según tipo
        if (solicitud.tipo === TipoSolicitud.CANCELACION) {
            // Cancelar reserva
            await prisma.reserva.update({
                where: { id: solicitud.reservaId },
                data: { estado: EstadoReserva.CANCELADA },
            });

            // Incrementar contador de cancelaciones
            await prisma.usuario.update({
                where: { id: solicitud.reserva.clienteId },
                data: {
                    cancelacionesTotales: { increment: 1 },
                },
            });

            // Verificar si debe suspenderse
            const cliente = await prisma.usuario.findUnique({
                where: { id: solicitud.reserva.clienteId },
            });

            if (cliente && cliente.cancelacionesTotales >= 2) { // 3 cancelaciones = suspensión
                await prisma.usuario.update({
                    where: { id: cliente.id },
                    data: {
                        suspendidoHasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
                    },
                });
            }
        } else if (solicitud.tipo === TipoSolicitud.EDICION) {
            // Aplicar cambios a la reserva
            await prisma.reserva.update({
                where: { id: solicitud.reservaId },
                data: {
                    fechaEvento: solicitud.nuevaFecha || undefined,
                    horaEvento: solicitud.nuevaHora || undefined,
                    ubicacionEvento: solicitud.nuevaUbicacion || undefined,
                },
            });
        }

        return solicitud;
    }

    /**
     * Rechazar solicitud
     */
    static async rechazarSolicitud(solicitudId: number, respuestaFotografo: string) {
        const solicitud = await SolicitudCambioRepository.findById(solicitudId);

        if (!solicitud) {
            throw new Error('Solicitud no encontrada');
        }

        if (solicitud.estado !== EstadoSolicitud.PENDIENTE) {
            throw new Error('La solicitud ya fue procesada');
        }

        return await SolicitudCambioRepository.updateStatus(
            solicitudId,
            EstadoSolicitud.RECHAZADA,
            respuestaFotografo
        );
    }
}
