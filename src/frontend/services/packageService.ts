/**
 * 📡 Servicio de Paquetes (Frontend)
 * Maneja operaciones con paquetes de fotografía
 */

import { HttpClient } from './httpClient';
import {
  IPaquete,
  ICreatePaqueteDTO,
  IUpdatePaqueteDTO,
  IPaqueteFilter
} from '../interfaces';
import { Paquete } from '../models';

export class PackageService {
  // ==================== CONSULTAS ====================

  static async getAllPackages(filters?: IPaqueteFilter): Promise<Paquete[]> {
    const queryParams = new URLSearchParams({
      ...(filters?.fotografoId && { fotografoId: filters.fotografoId.toString() }),
      ...(filters?.precioMin && { precioMin: filters.precioMin.toString() }),
      ...(filters?.precioMax && { precioMax: filters.precioMax.toString() }),
      ...(filters?.moneda && { moneda: filters.moneda }),
      ...(filters?.activo !== undefined && { activo: filters.activo.toString() })
    });

    const response = await HttpClient.get<IPaquete[]>(
      `/packages?${queryParams}`,
      false
    );

    if (response.success && response.data) {
      return response.data.map(p => Paquete.fromAPI(p));
    }

    throw new Error(response.error || 'Error al obtener paquetes');
  }

  static async getPackageById(id: number): Promise<Paquete> {
    const response = await HttpClient.get<IPaquete>(`/packages/${id}`, false);

    if (response.success && response.data) {
      return Paquete.fromAPI(response.data);
    }

    throw new Error(response.error || 'Error al obtener paquete');
  }

  static async getMyPackages(): Promise<Paquete[]> {
    const response = await HttpClient.get<IPaquete[]>('/packages/me');

    if (response.success && response.data) {
      return response.data.map(p => Paquete.fromAPI(p));
    }

    throw new Error(response.error || 'Error al obtener tus paquetes');
  }

  static async getPackagesByPhotographer(fotografoId: number): Promise<Paquete[]> {
    const response = await HttpClient.get<IPaquete[]>(
      `/packages/photographer/${fotografoId}`,
      false
    );

    if (response.success && response.data) {
      return response.data.map(p => Paquete.fromAPI(p));
    }

    throw new Error(response.error || 'Error al obtener paquetes del fotógrafo');
  }

  // ==================== MUTACIONES ====================

  static async createPackage(data: ICreatePaqueteDTO): Promise<Paquete> {
    const response = await HttpClient.post<IPaquete>('/packages', data);

    if (response.success && response.data) {
      return Paquete.fromAPI(response.data);
    }

    throw new Error(response.error || 'Error al crear paquete');
  }

  static async updatePackage(id: number, data: IUpdatePaqueteDTO): Promise<Paquete> {
    const response = await HttpClient.put<IPaquete>(`/packages/${id}`, data);

    if (response.success && response.data) {
      return Paquete.fromAPI(response.data);
    }

    throw new Error(response.error || 'Error al actualizar paquete');
  }

  static async deletePackage(id: number): Promise<void> {
    const response = await HttpClient.delete(`/packages/${id}`);

    if (!response.success) {
      throw new Error(response.error || 'Error al eliminar paquete');
    }
  }

  static async togglePackageStatus(id: number): Promise<Paquete> {
    const response = await HttpClient.patch<IPaquete>(`/packages/${id}/toggle`, {});

    if (response.success && response.data) {
      return Paquete.fromAPI(response.data);
    }

    throw new Error(response.error || 'Error al cambiar estado del paquete');
  }
}
