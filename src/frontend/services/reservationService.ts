/**
 * 📡 Servicio de Reservas (Frontend)
 * Maneja operaciones con reservas
 */

import { HttpClient } from './httpClient';
import {
  IReserva,
  ICreateReservaDTO,
  IUpdateReservaDTO,
  IReservaFilter,
  EstadoReserva
} from '../interfaces';
import { Reserva } from '../models';

export class ReservationService {
  // ==================== CONSULTAS ====================

  static async getAllReservations(filters?: IReservaFilter): Promise<Reserva[]> {
    const queryParams = new URLSearchParams({
      ...(filters?.clienteId && { clienteId: filters.clienteId.toString() }),
      ...(filters?.fotografoId && { fotografoId: filters.fotografoId.toString() }),
      ...(filters?.estado && { estado: filters.estado }),
      ...(filters?.fechaDesde && { fechaDesde: filters.fechaDesde.toISOString() }),
      ...(filters?.fechaHasta && { fechaHasta: filters.fechaHasta.toISOString() })
    });

    const response = await HttpClient.get<IReserva[]>(`/reservations?${queryParams}`);

    if (response.success && response.data) {
      return response.data.map(r => Reserva.fromAPI(r));
    }

    throw new Error(response.error || 'Error al obtener reservas');
  }

  static async getReservationById(id: number): Promise<Reserva> {
    const response = await HttpClient.get<IReserva>(`/reservations/${id}`);

    if (response.success && response.data) {
      return Reserva.fromAPI(response.data);
    }

    throw new Error(response.error || 'Error al obtener reserva');
  }

  static async getMyReservations(estado?: EstadoReserva): Promise<Reserva[]> {
    const queryParams = estado ? `?estado=${estado}` : '';
    const response = await HttpClient.get<IReserva[]>(`/reservations/me${queryParams}`);

    if (response.success && response.data) {
      return response.data.map(r => Reserva.fromAPI(r));
    }

    throw new Error(response.error || 'Error al obtener tus reservas');
  }

  static async getPhotographerReservations(estado?: EstadoReserva): Promise<Reserva[]> {
    const queryParams = estado ? `?estado=${estado}` : '';
    const response = await HttpClient.get<IReserva[]>(
      `/reservations/photographer${queryParams}`
    );

    if (response.success && response.data) {
      return response.data.map(r => Reserva.fromAPI(r));
    }

    throw new Error(response.error || 'Error al obtener reservas como fotógrafo');
  }

  // ==================== MUTACIONES ====================

  static async createReservation(data: ICreateReservaDTO): Promise<Reserva> {
    const response = await HttpClient.post<IReserva>('/reservations', data);

    if (response.success && response.data) {
      return Reserva.fromAPI(response.data);
    }

    throw new Error(response.error || 'Error al crear reserva');
  }

  static async updateReservation(id: number, data: IUpdateReservaDTO): Promise<Reserva> {
    const response = await HttpClient.put<IReserva>(`/reservations/${id}`, data);

    if (response.success && response.data) {
      return Reserva.fromAPI(response.data);
    }

    throw new Error(response.error || 'Error al actualizar reserva');
  }

  static async cancelReservation(id: number): Promise<Reserva> {
    const response = await HttpClient.patch<IReserva>(
      `/reservations/${id}/cancel`,
      {}
    );

    if (response.success && response.data) {
      return Reserva.fromAPI(response.data);
    }

    throw new Error(response.error || 'Error al cancelar reserva');
  }

  static async confirmReservation(id: number): Promise<Reserva> {
    const response = await HttpClient.patch<IReserva>(
      `/reservations/${id}/confirm`,
      {}
    );

    if (response.success && response.data) {
      return Reserva.fromAPI(response.data);
    }

    throw new Error(response.error || 'Error al confirmar reserva');
  }

  static async completeReservation(id: number): Promise<Reserva> {
    const response = await HttpClient.patch<IReserva>(
      `/reservations/${id}/complete`,
      {}
    );

    if (response.success && response.data) {
      return Reserva.fromAPI(response.data);
    }

    throw new Error(response.error || 'Error al completar reserva');
  }

  // ==================== ESTADÍSTICAS ====================

  static async getReservationStats(): Promise<{
    total: number;
    pendientes: number;
    confirmadas: number;
    completadas: number;
    canceladas: number;
  }> {
    const response = await HttpClient.get<any>('/reservations/stats');

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Error al obtener estadísticas');
  }
}
