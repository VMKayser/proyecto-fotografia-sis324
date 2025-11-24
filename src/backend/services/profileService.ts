/**
 * 💼 Servicio de Perfiles de Fotógrafos (Backend)
 * Lógica de negocio para perfiles
 */

import { ProfileRepository } from '../repositories';
import type { ProfileFilters } from '../repositories/profileRepository';
import type {
  CreatePerfilFotografoDTO,
  UpdatePerfilFotografoDTO,
  PerfilFotografoComplete
} from '../types';

export class ProfileService {
  // ==================== CONSULTAS ====================

  static async getAllProfiles(filters?: ProfileFilters) {
    if (!filters) {
      return ProfileRepository.findAllActive();
    }

    const normalizedFilters: ProfileFilters = {
      categoriaId: filters.categoriaId,
      ubicacion: filters.ubicacion,
      query: filters.query,
      minRating: filters.minRating,
      onlyVerified: filters.onlyVerified,
      take: filters.take,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      availableDate: filters.availableDate,
      sortBy: filters.sortBy,
    };

    return ProfileRepository.findAllWithFilters(normalizedFilters);
  }

  static async getProfileById(id: number): Promise<PerfilFotografoComplete> {
    const profile = await ProfileRepository.findById(id);
    
    if (!profile) {
      throw new Error('Perfil no encontrado');
    }

    return profile as PerfilFotografoComplete;
  }

  static async getProfileByUserId(usuarioId: number): Promise<PerfilFotografoComplete | null> {
    const profile = await ProfileRepository.findByUserId(usuarioId);
    return profile as PerfilFotografoComplete | null;
  }

  static async searchProfiles(filters?: ProfileFilters) {
    return ProfileRepository.findAllWithFilters(filters);
  }

  // ==================== MUTACIONES ====================

  static async createProfile(
    data: CreatePerfilFotografoDTO
  ): Promise<PerfilFotografoComplete> {
    // Verificar que no exista ya un perfil para este usuario
    const existing = await ProfileRepository.findByUserId(data.usuarioId);
    if (existing) {
      throw new Error('Ya existe un perfil para este usuario');
    }

    // Validar datos
    this.validateProfileData(data);

    // Crear perfil
    const profile = await ProfileRepository.create({
      usuario: {
        connect: {
          id: data.usuarioId,
        },
      },
      nombrePublico: data.nombrePublico,
      biografia: data.biografia,
      ubicacion: data.ubicacion,
      sitioWeb: data.sitioWeb,
      urlFotoPerfil: data.urlFotoPerfil,
      urlFotoPortada: data.urlFotoPortada,
      qrPagoUrl: data.qrPagoUrl,
      qrInstrucciones: data.qrInstrucciones,
    });

    return this.getProfileById(profile.id);
  }

  static async updateProfile(
    id: number,
    data: UpdatePerfilFotografoDTO
  ): Promise<PerfilFotografoComplete> {
    // Verificar que existe
    const existing = await ProfileRepository.findById(id);
    if (!existing) {
      throw new Error('Perfil no encontrado');
    }

    // Validar datos
    this.validateProfileData(data);

    // Actualizar
    await ProfileRepository.update(id, data);
    
    return this.getProfileById(id);
  }

  // ==================== CALIFICACIONES ====================

  static async updateRating(id: number, calificacion: number, totalResenas: number) {
    const profile = await ProfileRepository.findById(id);
    if (!profile) {
      throw new Error('Perfil no encontrado');
    }

    return ProfileRepository.updateRating(id, calificacion, totalResenas);
  }

  // ==================== VALIDACIONES ====================

  private static validateProfileData(data: CreatePerfilFotografoDTO | UpdatePerfilFotografoDTO): void {
    if (data.sitioWeb) {
      if (!this.isValidUrl(data.sitioWeb)) {
        throw new Error('URL del sitio web inválida');
      }
    }

    if (data.biografia && data.biografia.length > 1000) {
      throw new Error('La biografía no puede exceder los 1000 caracteres');
    }
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
