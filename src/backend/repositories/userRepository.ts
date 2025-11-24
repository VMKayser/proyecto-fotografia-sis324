// ============================================
// USER REPOSITORY - Acceso a datos de usuarios
// Capa: Data Access Layer
// ============================================

import { prisma } from '@/backend/lib/prisma';
import { Usuario, Prisma } from '@prisma/client';

export class UserRepository {
  
  /**
   * Obtener todos los usuarios
   */
  static async findAll(): Promise<Usuario[]> {
    return prisma.usuario.findMany({
      where: { activo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Buscar usuario por ID
   */
  static async findById(id: number): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { id },
    });
  }

  /**
   * Buscar usuario por ID con perfil de fotógrafo
   */
  static async findByIdWithProfile(id: number) {
    return prisma.usuario.findUnique({
      where: { id },
      include: {
        perfilFotografo: true,
      },
    });
  }

  /**
   * Buscar usuario por email
   */
  static async findByEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { email },
    });
  }

  /**
   * Crear nuevo usuario
   */
  static async create(data: Prisma.UsuarioCreateInput): Promise<Usuario> {
    return prisma.usuario.create({
      data,
    });
  }

  /**
   * Actualizar usuario
   */
  static async update(id: number, data: Prisma.UsuarioUpdateInput): Promise<Usuario> {
    return prisma.usuario.update({
      where: { id },
      data,
    });
  }

  /**
   * Eliminar usuario (soft delete)
   */
  static async softDelete(id: number): Promise<Usuario> {
    return prisma.usuario.update({
      where: { id },
      data: { activo: false },
    });
  }

  /**
   * Eliminar usuario permanentemente
   */
  static async delete(id: number): Promise<Usuario> {
    return prisma.usuario.delete({
      where: { id },
    });
  }

  /**
   * Verificar si existe usuario con email
   */
  static async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.usuario.count({
      where: { email },
    });
    return count > 0;
  }

  /**
   * Obtener usuarios por rol
   */
  static async findByRole(rol: 'CLIENTE' | 'FOTOGRAFO' | 'ADMIN'): Promise<Usuario[]> {
    return prisma.usuario.findMany({
      where: { rol, activo: true },
    });
  }
}
