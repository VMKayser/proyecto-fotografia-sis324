// ============================================
// SESSION SERVICE - Servicio de sesiones
// Capa: Business Logic Layer
// Gestiona tokens JWT almacenados en MySQL
// ============================================

import { prisma } from '@/backend/lib/prisma';
import { RolUsuario } from '@prisma/client';

export class SessionService {
  
  /**
   * Crear nueva sesión y almacenar token en BD
   */
  static async createSession(
    usuarioId: number,
    token: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Limpiar sesiones expiradas del usuario
    await this.cleanExpiredSessions(usuarioId);

    // Crear nueva sesión
    return prisma.sesion.create({
      data: {
        usuarioId,
        token,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  }

  /**
   * Verificar si un token existe y es válido en la BD
   */
  static async validateToken(token: string): Promise<{ 
    valid: boolean; 
    userId?: number; 
    rol?: RolUsuario;
  }> {
    try {
      const sesion = await prisma.sesion.findUnique({
        where: { token },
        include: {
          usuario: {
            select: {
              id: true,
              rol: true,
              activo: true,
            },
          },
        },
      });

      if (!sesion) {
        return { valid: false };
      }

      // Verificar si la sesión expiró
      if (sesion.expiresAt < new Date()) {
        // Eliminar sesión expirada
        await prisma.sesion.delete({ where: { id: sesion.id } });
        return { valid: false };
      }

      // Verificar si el usuario está activo
      if (!sesion.usuario.activo) {
        return { valid: false };
      }

      return {
        valid: true,
        userId: sesion.usuario.id,
        rol: sesion.usuario.rol,
      };
    } catch (error) {
      console.error('Error validating token:', error);
      return { valid: false };
    }
  }

  /**
   * Eliminar sesión (logout)
   */
  static async deleteSession(token: string): Promise<void> {
    try {
      await prisma.sesion.delete({
        where: { token },
      });
    } catch (error) {
      // Si no existe, no hay problema
      console.log('Session not found or already deleted', error);
    }
  }

  /**
   * Eliminar todas las sesiones de un usuario
   */
  static async deleteAllUserSessions(usuarioId: number): Promise<void> {
    await prisma.sesion.deleteMany({
      where: { usuarioId },
    });
  }

  /**
   * Limpiar sesiones expiradas de un usuario
   */
  static async cleanExpiredSessions(usuarioId: number): Promise<void> {
    await prisma.sesion.deleteMany({
      where: {
        usuarioId,
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Limpiar todas las sesiones expiradas del sistema
   */
  static async cleanAllExpiredSessions(): Promise<void> {
    await prisma.sesion.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Obtener sesiones activas de un usuario
   */
  static async getUserActiveSessions(usuarioId: number) {
    return prisma.sesion.findMany({
      where: {
        usuarioId,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
