/**
 * 📡 Servicio de Perfiles de Fotógrafos (Frontend)
 * Maneja operaciones con perfiles de fotógrafos
 */

import { HttpClient } from './httpClient';
import {
  IPerfilFotografo,
  ICreatePerfilDTO,
  IUpdatePerfilDTO,
  IFotografoFilter,
  IPaginatedResponse
} from '../interfaces';
import { PerfilFotografo } from '../models';

export class ProfileService {
  // ==================== CONSULTAS ====================

  static async getAllProfiles(
    filters?: IFotografoFilter,
    page: number = 1,
    limit: number = 10
  ): Promise<IPaginatedResponse<IPerfilFotografo>> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.categoriaId && { categoriaId: filters.categoriaId.toString() }),
      ...(filters?.ubicacion && { ubicacion: filters.ubicacion }),
      ...(filters?.calificacionMin && { calificacionMin: filters.calificacionMin.toString() }),
      ...(filters?.precioMin && { precioMin: filters.precioMin.toString() }),
      ...(filters?.precioMax && { precioMax: filters.precioMax.toString() }),
      ...(filters?.verificado !== undefined && { verificado: filters.verificado.toString() }),
      ...(filters?.search && { search: filters.search })
    });

    const response = await HttpClient.get<IPaginatedResponse<IPerfilFotografo>>(
      `/profiles?${queryParams}`,
      false
    );

    if (response.success && response.data) {
      return {
        ...response.data,
        data: response.data.data.map(p => PerfilFotografo.fromAPI(p))
      };
    }

    throw new Error(response.error || 'Error al obtener perfiles');
  }

  static async getProfileById(id: number): Promise<PerfilFotografo> {
    const response = await HttpClient.get<IPerfilFotografo>(`/profiles/${id}`, false);

    if (response.success && response.data) {
      return PerfilFotografo.fromAPI(response.data);
    }

    throw new Error(response.error || 'Error al obtener perfil');
  }

  static async getMyProfile(): Promise<PerfilFotografo> {
    const response = await HttpClient.get<IPerfilFotografo>('/profiles/me');

    if (response.success && response.data) {
      return PerfilFotografo.fromAPI(response.data);
    }

    throw new Error(response.error || 'Error al obtener tu perfil');
  }

  // ==================== MUTACIONES ====================

  static async createProfile(data: ICreatePerfilDTO): Promise<PerfilFotografo> {
    const response = await HttpClient.post<IPerfilFotografo>('/profiles', data);

    if (response.success && response.data) {
      return PerfilFotografo.fromAPI(response.data);
    }

    throw new Error(response.error || 'Error al crear perfil');
  }

  static async updateProfile(id: number, data: IUpdatePerfilDTO): Promise<PerfilFotografo> {
    const response = await HttpClient.put<IPerfilFotografo>(`/profiles/${id}`, data);

    if (response.success && response.data) {
      return PerfilFotografo.fromAPI(response.data);
    }

    throw new Error(response.error || 'Error al actualizar perfil');
  }

  static async updateMyProfile(data: IUpdatePerfilDTO): Promise<PerfilFotografo> {
    const response = await HttpClient.put<IPerfilFotografo>('/profiles/me', data);

    if (response.success && response.data) {
      return PerfilFotografo.fromAPI(response.data);
    }

    throw new Error(response.error || 'Error al actualizar tu perfil');
  }

  // ==================== CATEGORÍAS ====================

  static async addCategory(profileId: number, categoriaId: number): Promise<void> {
    const response = await HttpClient.post(
      `/profiles/${profileId}/categories`,
      { categoriaId }
    );

    if (!response.success) {
      throw new Error(response.error || 'Error al agregar categoría');
    }
  }

  static async removeCategory(profileId: number, categoriaId: number): Promise<void> {
    const response = await HttpClient.delete(
      `/profiles/${profileId}/categories/${categoriaId}`
    );

    if (!response.success) {
      throw new Error(response.error || 'Error al eliminar categoría');
    }
  }

  // ==================== BÚSQUEDA ====================

  static async searchProfiles(searchTerm: string): Promise<PerfilFotografo[]> {
    const response = await HttpClient.get<IPerfilFotografo[]>(
      `/profiles/search?q=${encodeURIComponent(searchTerm)}`,
      false
    );

    if (response.success && response.data) {
      return response.data.map(p => PerfilFotografo.fromAPI(p));
    }

    throw new Error(response.error || 'Error en la búsqueda');
  }

  static async getFeaturedProfiles(limit: number = 6): Promise<PerfilFotografo[]> {
    const response = await HttpClient.get<IPerfilFotografo[]>(
      `/profiles/featured?limit=${limit}`,
      false
    );

    if (response.success && response.data) {
      return response.data.map(p => PerfilFotografo.fromAPI(p));
    }

    throw new Error(response.error || 'Error al obtener perfiles destacados');
  }
}
