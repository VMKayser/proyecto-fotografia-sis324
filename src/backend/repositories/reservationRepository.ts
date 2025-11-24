// ============================================
// RESERVATION REPOSITORY - Acceso a datos de reservas
// Capa: Data Access Layer
// ============================================

import { prisma } from '@/backend/lib/prisma';
import { Reserva, Prisma } from '@prisma/client';

const defaultReservationInclude: Prisma.ReservaInclude = {
  cliente: {
    select: {
      id: true,
      nombreCompleto: true,
      email: true,
      telefono: true,
      perfilFotografo: true,
    },
  },
  fotografo: {
    select: {
      id: true,
      nombreCompleto: true,
      email: true,
      telefono: true,
      perfilFotografo: true,
    },
  },
  paquete: true,
  resena: true,
};

type UpcomingReservationFilter = {
  estado: {
    in: Array<'PENDIENTE' | 'CONFIRMADA'>;
  };
  fechaEvento: {
    gte: Date;
  };
  fotografoId?: number;
};

export class ReservationRepository {
  
  /**
   * Obtener todas las reservas
   */
  static async findAll() {
    return prisma.reserva.findMany({
      include: defaultReservationInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Buscar reserva por ID
   */
  static async findById(id: number) {
    return prisma.reserva.findUnique({
      where: { id },
      include: defaultReservationInclude,
    });
  }

  /**
   * Buscar reservas por cliente
   */
  static async findByClient(clienteId: number) {
    return prisma.reserva.findMany({
      where: { clienteId },
      include: defaultReservationInclude,
      orderBy: { fechaEvento: 'desc' },
    });
  }

  /**
   * Buscar reservas por fotógrafo
   */
  static async findByPhotographer(fotografoId: number) {
    return prisma.reserva.findMany({
      where: { fotografoId },
      include: defaultReservationInclude,
      orderBy: { fechaEvento: 'desc' },
    });
  }

  /**
   * Crear reserva
   */
  static async create(data: Prisma.ReservaUncheckedCreateInput): Promise<Reserva> {
    return prisma.reserva.create({
      data,
    });
  }

  /**
   * Actualizar reserva
   */
  static async update(id: number, data: Prisma.ReservaUncheckedUpdateInput): Promise<Reserva> {
    return prisma.reserva.update({
      where: { id },
      data,
    });
  }

  /**
   * Eliminar reserva
   */
  static async delete(id: number): Promise<Reserva> {
    return prisma.reserva.delete({
      where: { id },
    });
  }

  /**
   * Buscar reservas por estado
   */
  static async findByStatus(estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | 'RECHAZADA') {
    return prisma.reserva.findMany({
      where: { estado },
      include: defaultReservationInclude,
    });
  }

  /**
   * Buscar reservas próximas (pendientes o confirmadas)
   */
  static async findUpcoming(fotografoId?: number) {
  const where: UpcomingReservationFilter = {
      estado: {
        in: ['PENDIENTE', 'CONFIRMADA'],
      },
      fechaEvento: {
        gte: new Date(),
      },
    };

    if (fotografoId) {
      where.fotografoId = fotografoId;
    }

    return prisma.reserva.findMany({
      where,
      include: defaultReservationInclude,
      orderBy: { fechaEvento: 'asc' },
    });
  }
}
