// ============================================
// PACKAGE REPOSITORY - Acceso a datos de paquetes
// Capa: Data Access Layer
// ============================================

import { prisma } from '@/backend/lib/prisma';
import { Paquete, Prisma } from '@prisma/client';

export class PackageRepository {
  
  /**
   * Obtener todos los paquetes activos
   */
  static async findAllActive(): Promise<Paquete[]> {
    return prisma.paquete.findMany({
      where: { activo: true },
      include: {
        fotografo: {
          include: {
            usuario: {
              select: {
                nombreCompleto: true,
                telefono: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Buscar paquete por ID
   */
  static async findById(id: number) {
    return prisma.paquete.findUnique({
      where: { id },
      include: {
        fotografo: {
          include: {
            usuario: true,
          },
        },
      },
    });
  }

  /**
   * Buscar paquetes por fotógrafo
   */
  static async findByPhotographer(fotografoId: number) {
    return prisma.paquete.findMany({
      where: { fotografoId },
      orderBy: { destacado: 'desc' },
    });
  }

  /**
   * Crear paquete
   */
  static async create(data: Prisma.PaqueteCreateInput): Promise<Paquete> {
    return prisma.paquete.create({
      data,
    });
  }

  /**
   * Actualizar paquete
   */
  static async update(id: number, data: Prisma.PaqueteUpdateInput): Promise<Paquete> {
    return prisma.paquete.update({
      where: { id },
      data,
    });
  }

  /**
   * Eliminar paquete
   */
  static async delete(id: number): Promise<Paquete> {
    return prisma.paquete.delete({
      where: { id },
    });
  }

  /**
   * Buscar paquetes destacados
   */
  static async findFeatured() {
    return prisma.paquete.findMany({
      where: {
        activo: true,
        destacado: true,
      },
      include: {
        fotografo: {
          include: {
            usuario: true,
          },
        },
      },
      take: 6,
    });
  }
}
