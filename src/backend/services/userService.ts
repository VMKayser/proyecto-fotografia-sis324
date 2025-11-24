// ============================================
// USER SERVICE - Servicio de usuarios
// Capa: Business Logic Layer
// ============================================

import { UserRepository, ProfileRepository } from '@/backend/repositories';
import { UpdateUsuarioDTO, CreatePerfilFotografoDTO } from '@/backend/types';

export class UserService {
  
  /**
   * Obtener todos los usuarios
   */
  static async getAllUsers() {
    return UserRepository.findAll();
  }

  /**
   * Obtener usuario por ID
   */
  static async getUserById(id: number) {
    const user = await UserRepository.findByIdWithProfile(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  /**
   * Actualizar usuario
   */
  static async updateUser(id: number, data: UpdateUsuarioDTO) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return UserRepository.update(id, data);
  }

  /**
   * Desactivar usuario
   */
  static async deactivateUser(id: number) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return UserRepository.softDelete(id);
  }

  /**
   * Eliminar usuario permanentemente
   */
  static async deleteUser(id: number) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return UserRepository.delete(id);
  }

  /**
   * Obtener todos los fotógrafos
   */
  static async getAllPhotographers() {
    const photographers = await UserRepository.findByRole('FOTOGRAFO');
    
    // Enriquecer con datos del perfil
    const photographersWithProfile = await Promise.all(
      photographers.map(async (photographer) => {
        const profile = await ProfileRepository.findByUserId(photographer.id);
        return {
          ...photographer,
          perfil: profile,
        };
      })
    );

    return photographersWithProfile;
  }

  /**
   * Crear perfil de fotógrafo para un usuario
   */
  static async createPhotographerProfile(data: CreatePerfilFotografoDTO) {
    // Verificar que el usuario existe y es fotógrafo
    const user = await UserRepository.findById(data.usuarioId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.rol !== 'FOTOGRAFO') {
      throw new Error('El usuario debe tener rol de FOTOGRAFO');
    }

    // Verificar que no tenga ya un perfil
    const existingProfile = await ProfileRepository.findByUserId(data.usuarioId);
    if (existingProfile) {
      throw new Error('El usuario ya tiene un perfil de fotógrafo');
    }

    // Crear perfil
    return ProfileRepository.create({
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
    });
  }

  /**
   * Obtener estadísticas de un usuario
   */
  static async getUserStats(userId: number) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.rol === 'FOTOGRAFO') {
      // Estadísticas para fotógrafos
      const profile = await ProfileRepository.findByUserId(userId);
      if (!profile) {
        return {
          totalPaquetes: 0,
          totalReservas: 0,
          calificacionPromedio: 0,
          totalResenas: 0,
        };
      }

      // Obtener total de reservas del fotógrafo
      const { ReservationRepository } = await import('../repositories/reservationRepository');
      const reservas = await ReservationRepository.findByPhotographer(userId);

      return {
        totalPaquetes: profile.paquetes?.length || 0,
        totalReservas: reservas.length || 0,
        calificacionPromedio: profile.calificacionPromedio || 0,
        totalResenas: profile.totalResenas || 0,
      };
    }

    // Estadísticas para clientes
    const { ReservationRepository } = await import('../repositories/reservationRepository');
    const reservasCliente = await ReservationRepository.findByClient(userId);
    
    return {
      totalReservas: reservasCliente.length || 0,
    };
  }
}
