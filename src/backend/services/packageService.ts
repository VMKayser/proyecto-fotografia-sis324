/**
 * 📦 Servicio de Paquetes (Backend)
 * Lógica de negocio para paquetes fotográficos
 */

import { PackageRepository } from '../repositories';
import type {
  CreatePaqueteDTO,
  UpdatePaqueteDTO,
  Paquete
} from '../types';

export class PackageService {
  // ==================== CONSULTAS ====================

  static async getAllPackages(filters?: {
    fotografoId?: number;
    activo?: boolean;
    destacado?: boolean;
  }) {
    if (filters?.fotografoId) {
      return PackageRepository.findByPhotographer(filters.fotografoId);
    }

    if (filters?.destacado) {
      return PackageRepository.findFeatured();
    }

    return PackageRepository.findAllActive();
  }

  static async getPackageById(id: number): Promise<Paquete> {
    const package_ = await PackageRepository.findById(id);
    
    if (!package_) {
      throw new Error('Paquete no encontrado');
    }

    return package_;
  }

  static async getPackagesByPhotographer(fotografoId: number): Promise<Paquete[]> {
    return PackageRepository.findByPhotographer(fotografoId);
  }

  static async getActivePackagesByPhotographer(fotografoId: number): Promise<Paquete[]> {
    const packages = await PackageRepository.findByPhotographer(fotografoId);
    return packages.filter((pkg: Paquete) => pkg.activo);
  }

  static async getFeaturedPackages(limit: number = 6): Promise<Paquete[]> {
    const packages = await PackageRepository.findFeatured();
    return packages.slice(0, limit);
  }

  // ==================== MUTACIONES ====================

  static async createPackage(data: CreatePaqueteDTO): Promise<Paquete> {
    // Validar datos
    this.validatePackageData(data);

    // Crear paquete
    return PackageRepository.create({
      fotografo: {
        connect: {
          id: data.fotografoId,
        },
      },
      titulo: data.titulo,
      descripcion: data.descripcion,
      precio: data.precio,
      moneda: data.moneda || 'BOB',
      duracionHoras: data.duracionHoras,
      incluye: data.incluye,
      imagenUrl: data.imagenUrl,
      activo: true,
      destacado: false,
    });
  }

  static async updatePackage(id: number, data: UpdatePaqueteDTO): Promise<Paquete> {
    // Verificar que existe
    const existing = await PackageRepository.findById(id);
    if (!existing) {
      throw new Error('Paquete no encontrado');
    }

    // Validar datos
    this.validatePackageData(data);

    // Actualizar
    return PackageRepository.update(id, data);
  }

  static async deletePackage(id: number): Promise<void> {
    const existing = await PackageRepository.findById(id);
    if (!existing) {
      throw new Error('Paquete no encontrado');
    }

    // Hard delete: eliminar permanentemente de la base de datos
    await PackageRepository.delete(id);
  }

  static async togglePackageStatus(id: number, activo: boolean): Promise<Paquete> {
    const existing = await PackageRepository.findById(id);
    if (!existing) {
      throw new Error('Paquete no encontrado');
    }

    return PackageRepository.update(id, { activo });
  }

  static async toggleFeatured(id: number, destacado: boolean): Promise<Paquete> {
    const existing = await PackageRepository.findById(id);
    if (!existing) {
      throw new Error('Paquete no encontrado');
    }

    return PackageRepository.update(id, { destacado });
  }

  // ==================== VALIDACIONES ====================

  private static validatePackageData(data: CreatePaqueteDTO | UpdatePaqueteDTO): void {
    if (data.precio !== undefined) {
      if (data.precio <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }
      if (data.precio > 1000000) {
        throw new Error('El precio no puede exceder 1,000,000');
      }
    }

    if (data.titulo) {
      if (data.titulo.trim().length < 3) {
        throw new Error('El título debe tener al menos 3 caracteres');
      }
      if (data.titulo.length > 200) {
        throw new Error('El título no puede exceder 200 caracteres');
      }
    }

    if (data.descripcion && data.descripcion.length > 2000) {
      throw new Error('La descripción no puede exceder 2000 caracteres');
    }
  }

  // ==================== ESTADÍSTICAS ====================

  static async getPackageStats(fotografoId: number) {
    const packages = await PackageRepository.findByPhotographer(fotografoId);
    
    const total = packages.length;
    const activos = packages.filter((p: Paquete) => p.activo).length;
    const destacados = packages.filter((p: Paquete) => p.destacado).length;
    const precioPromedio = packages.length > 0
      ? packages.reduce((sum: number, p: Paquete) => sum + Number(p.precio), 0) / packages.length
      : 0;

    return {
      total,
      activos,
      inactivos: total - activos,
      destacados,
      precioPromedio: Math.round(precioPromedio * 100) / 100,
    };
  }
}
