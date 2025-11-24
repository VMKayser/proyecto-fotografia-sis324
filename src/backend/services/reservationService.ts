/**
 * 📅 Servicio de Reservas (Backend)
 * Lógica de negocio para reservas
 */

import { ReservationRepository } from '../repositories';
import { calcularComision } from '../config/monetization';
import type {
  CreateReservaDTO,
  UpdateReservaDTO,
  ReservaComplete,
  EstadoReserva,
  SubmitComprobanteDTO,
  ReviewComprobanteDTO,
} from '../types';

type ReservationScheduleInfo = Pick<ReservaComplete, 'id' | 'fechaEvento' | 'estado'>;

export class ReservationService {
  // ==================== CONSULTAS ====================

  static async getAllReservations(filters?: {
    clienteId?: number;
    fotografoId?: number;
    estado?: EstadoReserva;
  }) {
    if (filters?.clienteId) {
      return ReservationRepository.findByClient(filters.clienteId);
    }

    if (filters?.fotografoId) {
      return ReservationRepository.findByPhotographer(filters.fotografoId);
    }

    if (filters?.estado) {
      return ReservationRepository.findByStatus(filters.estado);
    }

    return ReservationRepository.findAll();
  }

  static async getReservationById(id: number): Promise<ReservaComplete> {
    const reservation = await ReservationRepository.findById(id);
    
    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    return reservation as unknown as ReservaComplete;
  }

  static async getMyReservations(usuarioId: number, rol: 'CLIENTE' | 'FOTOGRAFO'): Promise<ReservaComplete[]> {
    if (rol === 'CLIENTE') {
      return ReservationRepository.findByClient(usuarioId) as unknown as Promise<ReservaComplete[]>;
    } else {
      return ReservationRepository.findByPhotographer(usuarioId) as unknown as Promise<ReservaComplete[]>;
    }
  }

  static async getUpcomingReservations(usuarioId: number, rol: 'CLIENTE' | 'FOTOGRAFO') {
    const reservations = await this.getMyReservations(usuarioId, rol);
    const now = new Date();
    
    return reservations.filter((r: ReservaComplete) => 
      new Date(r.fechaEvento) >= now && r.estado !== 'CANCELADA'
    );
  }

  // ==================== MUTACIONES ====================

  static async createReservation(data: CreateReservaDTO): Promise<ReservaComplete> {
    // Validar datos
    this.validateReservationData(data);

    // Verificar disponibilidad del fotógrafo en esa fecha
  const existingReservations = await ReservationRepository.findByPhotographer(data.fotografoId) as ReservationScheduleInfo[];
    const conflictingReservation = existingReservations.find((reservation) => {
      const sameDate = new Date(reservation.fechaEvento).toDateString() === new Date(data.fechaEvento).toDateString();
      const notCanceled = reservation.estado !== 'CANCELADA';
      return sameDate && notCanceled;
    });

    if (conflictingReservation) {
      throw new Error('El fotógrafo ya tiene una reserva para esa fecha');
    }

    // 💰 CALCULAR COMISIÓN AUTOMÁTICAMENTE
    const moneda = data.moneda || 'BOB';
    const comision = calcularComision(data.monto, moneda);

    console.log(`💰 Reserva creada - Monto: ${data.monto} ${moneda} | Comisión: ${comision.toFixed(2)} ${moneda} (5%)`);

    // Crear reserva
    const reservation = await ReservationRepository.create({
      clienteId: data.clienteId,
      fotografoId: data.fotografoId,
      paqueteId: data.paqueteId,
      fechaEvento: data.fechaEvento,
      horaEvento: data.horaEvento,
      ubicacionEvento: data.ubicacionEvento,
      monto: data.monto,
      comision: comision, // ✅ Comisión calculada automáticamente
      moneda: moneda,
      notas: data.notas,
      estado: 'PENDIENTE',
    });

    return this.getReservationById(reservation.id);
  }

  static async updateReservation(id: number, data: UpdateReservaDTO): Promise<ReservaComplete> {
    // Verificar que existe
    const existing = (await ReservationRepository.findById(id)) as (ReservaComplete | null);
    if (!existing) {
      throw new Error('Reserva no encontrada');
    }

    // Validar datos
    this.validateReservationData(data);

    // Si se está cambiando la fecha, verificar disponibilidad
    if (data.fechaEvento && data.fechaEvento.toString() !== existing.fechaEvento.toString()) {
  const existingReservations = await ReservationRepository.findByPhotographer(existing.fotografoId) as ReservationScheduleInfo[];
      const conflictingReservation = existingReservations.find((reservation) => {
        const sameDate = new Date(reservation.fechaEvento).toDateString() === new Date(data.fechaEvento!).toDateString();
        const differentReservation = reservation.id !== id;
        const notCanceled = reservation.estado !== 'CANCELADA';
        return sameDate && differentReservation && notCanceled;
      });

      if (conflictingReservation) {
        throw new Error('El fotógrafo ya tiene una reserva para esa fecha');
      }
    }

    // Actualizar
    await ReservationRepository.update(id, data);
    
    return this.getReservationById(id);
  }

  static async cancelReservation(id: number, usuarioId: number): Promise<ReservaComplete> {
    const reservation = (await ReservationRepository.findById(id)) as (ReservaComplete | null);
    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    // Verificar que el usuario puede cancelar
    if (reservation.clienteId !== usuarioId && reservation.fotografoId !== usuarioId) {
      throw new Error('No tienes permiso para cancelar esta reserva');
    }

    // Verificar que no esté ya cancelada o completada
    if (reservation.estado === 'CANCELADA') {
      throw new Error('La reserva ya está cancelada');
    }
    if (reservation.estado === 'COMPLETADA') {
      throw new Error('No se puede cancelar una reserva completada');
    }

    // Cancelar
    await ReservationRepository.update(id, { estado: 'CANCELADA' });
    
    return this.getReservationById(id);
  }

  static async confirmReservation(id: number, fotografoId: number): Promise<ReservaComplete> {
    const reservation = (await ReservationRepository.findById(id)) as (ReservaComplete | null);
    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    // Verificar que es el fotógrafo de la reserva
    if (reservation.fotografoId !== fotografoId) {
      throw new Error('No tienes permiso para confirmar esta reserva');
    }

    // Verificar estado actual
    if (reservation.estado !== 'PENDIENTE') {
      throw new Error('Solo se pueden confirmar reservas pendientes');
    }

    // Confirmar
    await ReservationRepository.update(id, { estado: 'CONFIRMADA' });
    
    return this.getReservationById(id);
  }

  static async completeReservation(id: number, fotografoId: number): Promise<ReservaComplete> {
    const reservation = (await ReservationRepository.findById(id)) as (ReservaComplete | null);
    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    // Verificar que es el fotógrafo de la reserva
    if (reservation.fotografoId !== fotografoId) {
      throw new Error('No tienes permiso para completar esta reserva');
    }

    // Verificar estado actual
    if (reservation.estado !== 'CONFIRMADA') {
      throw new Error('Solo se pueden completar reservas confirmadas');
    }

    // Completar
    await ReservationRepository.update(id, { estado: 'COMPLETADA' });
    
    return this.getReservationById(id);
  }

  static async submitComprobante(id: number, clienteId: number, data: SubmitComprobanteDTO): Promise<ReservaComplete> {
    const reservation = (await ReservationRepository.findById(id)) as (ReservaComplete | null);
    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    if (reservation.clienteId !== clienteId) {
      throw new Error('No tienes permiso para enviar el comprobante de esta reserva');
    }

    if (!data.url) {
      throw new Error('El comprobante debe incluir una imagen');
    }

    if (reservation.estado === 'CANCELADA' || reservation.estado === 'RECHAZADA') {
      throw new Error('La reserva ya no acepta comprobantes');
    }

    if (reservation.comprobanteEstado === 'APROBADO') {
      throw new Error('El comprobante ya fue aprobado');
    }

    await ReservationRepository.update(id, {
      comprobanteUrl: data.url,
      comprobanteNotas: data.notas ?? null,
      comprobanteEstado: 'PENDIENTE',
    });

    return this.getReservationById(id);
  }

  static async reviewComprobante(
    id: number,
    fotografoId: number,
    data: ReviewComprobanteDTO
  ): Promise<ReservaComplete> {
    const reservation = (await ReservationRepository.findById(id)) as (ReservaComplete | null);
    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    if (reservation.fotografoId !== fotografoId) {
      throw new Error('No tienes permiso para revisar este comprobante');
    }

    if (!reservation.comprobanteUrl) {
      throw new Error('El cliente aún no ha enviado un comprobante');
    }

    if (reservation.comprobanteEstado === 'NO_ENVIADO') {
      throw new Error('No hay comprobantes pendientes de revisión');
    }

    if (reservation.comprobanteEstado === 'APROBADO' && data.estado === 'APROBADO') {
      throw new Error('El comprobante ya fue aprobado');
    }

    if (!['APROBADO', 'RECHAZADO'].includes(data.estado)) {
      throw new Error('Estado de comprobante inválido');
    }

    const updatePayload: UpdateReservaDTO = {
      comprobanteEstado: data.estado,
      comprobanteNotas: data.notas ?? null,
    };

    if (data.estado === 'APROBADO' && reservation.estado === 'PENDIENTE') {
      updatePayload.estado = 'CONFIRMADA';
    }

    if (data.estado === 'RECHAZADO') {
      updatePayload.comprobanteEstado = 'RECHAZADO';
    }

    await ReservationRepository.update(id, updatePayload);

    return this.getReservationById(id);
  }

  // ==================== ELIMINAR RESERVA ====================

  /**
   * Eliminar una reserva (soft delete)
   * Solo se puede eliminar si está en estado PENDIENTE
   */
  static async deleteReservation(id: number): Promise<void> {
    const reservation = await ReservationRepository.findById(id);

    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    if (reservation.estado !== 'PENDIENTE') {
      throw new Error('Solo se pueden eliminar reservas en estado PENDIENTE');
    }

    // Marcar como cancelada
    await ReservationRepository.update(id, {
      estado: 'CANCELADA',
    });
  }

  // ==================== VALIDACIONES ====================

  private static validateReservationData(data: CreateReservaDTO | UpdateReservaDTO): void {
    if ('monto' in data && data.monto !== undefined) {
      if (data.monto <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }
      if (data.monto > 1000000) {
        throw new Error('El monto no puede exceder 1,000,000');
      }
    }

    if (data.fechaEvento) {
      const eventDate = new Date(data.fechaEvento);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (eventDate < now) {
        throw new Error('La fecha del evento no puede ser en el pasado');
      }
    }

    if (data.notas && data.notas.length > 1000) {
      throw new Error('Las notas no pueden exceder 1000 caracteres');
    }
  }

  // ==================== ESTADÍSTICAS ====================

  static async getReservationStats(usuarioId: number, rol: 'CLIENTE' | 'FOTOGRAFO') {
    const reservations = await this.getMyReservations(usuarioId, rol);
    
    const total = reservations.length;
    const pendientes = reservations.filter((r: ReservaComplete) => r.estado === 'PENDIENTE').length;
    const confirmadas = reservations.filter((r: ReservaComplete) => r.estado === 'CONFIRMADA').length;
    const completadas = reservations.filter((r: ReservaComplete) => r.estado === 'COMPLETADA').length;
    const canceladas = reservations.filter((r: ReservaComplete) => r.estado === 'CANCELADA').length;

    const ingresos = rol === 'FOTOGRAFO'
      ? reservations
          .filter((r: ReservaComplete) => r.estado === 'COMPLETADA')
          .reduce((sum: number, r: ReservaComplete) => sum + Number(r.monto), 0)
      : 0;

    return {
      total,
      pendientes,
      confirmadas,
      completadas,
      canceladas,
      ingresos: Math.round(ingresos * 100) / 100,
    };
  }
}
