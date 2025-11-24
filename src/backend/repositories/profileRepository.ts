// ============================================
// PROFILE REPOSITORY - Acceso a datos de perfiles de fotógrafos
// Capa: Data Access Layer
// ============================================

import { prisma } from '@/backend/lib/prisma';
import { Prisma, PerfilFotografo, Paquete } from '@prisma/client';

export interface ProfileFilters {
  query?: string;
  ubicacion?: string;
  categoriaId?: number;
  minRating?: number;
  onlyVerified?: boolean;
  take?: number;
  priceMin?: number;
  priceMax?: number;
  availableDate?: Date;
  sortBy?: 'rating' | 'priceAsc' | 'priceDesc' | 'recent';
}

type PerfilOrderByInput = Prisma.PerfilFotografoOrderByWithRelationInput[];

export class ProfileRepository {
  
  /**
   * Obtener todos los perfiles de fotógrafos activos
   */
  static async findAllActive() {
    return this.findAllWithFilters();
  }

  static async findAllWithFilters(filters: ProfileFilters = {}) {
    const where = this.buildWhere(filters);
    const orderBy = this.buildOrderBy(filters);

    const results = await prisma.perfilFotografo.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            telefono: true,
            activo: true,
          },
        },
        categorias: {
          include: {
            categoria: true,
          },
        },
        paquetes: {
          where: { activo: true },
        },
      },
      orderBy,
      ...(filters.take ? { take: filters.take } : {}),
    });

    // Ordenar por precio si se solicita
    if (filters.sortBy === 'priceAsc' || filters.sortBy === 'priceDesc') {
      const direction = filters.sortBy === 'priceAsc' ? 1 : -1;
      return results.sort((a, b) => {
        const priceA = this.getStartingPrice(a.paquetes ?? []);
        const priceB = this.getStartingPrice(b.paquetes ?? []);

        if (priceA === null && priceB === null) return 0;
        if (priceA === null) return 1;
        if (priceB === null) return -1;
        if (priceA === priceB) return 0;

        return direction * (priceA - priceB);
      });
    }

    // Ordenar destacados primero (los que tienen destacadoHasta válido)
    const now = new Date();
    return results.sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aDestacado = (a as any).destacadoHasta as Date | null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bDestacado = (b as any).destacadoHasta as Date | null;
      
      const aEsDestacado = aDestacado && aDestacado > now ? 1 : 0;
      const bEsDestacado = bDestacado && bDestacado > now ? 1 : 0;
      
      // Destacados primero
      if (aEsDestacado !== bEsDestacado) {
        return bEsDestacado - aEsDestacado;
      }
      
      // Si ambos son destacados o ninguno lo es, mantener el orden existente
      return 0;
    });
  }

  private static buildWhere(filters: ProfileFilters): Prisma.PerfilFotografoWhereInput {
    const conditions: Prisma.PerfilFotografoWhereInput[] = [
      {
        usuario: {
          is: {
            activo: true,
          },
        },
      },
    ];

    if (filters.ubicacion) {
      conditions.push({
        ubicacion: {
          contains: filters.ubicacion,
        },
      });
    }

    if (filters.categoriaId) {
      conditions.push({
        categorias: {
          some: {
            categoriaId: filters.categoriaId,
          },
        },
      });
    }

    if (filters.minRating) {
      conditions.push({
        calificacionPromedio: {
          gte: filters.minRating,
        },
      });
    }

    if (filters.onlyVerified) {
      conditions.push({ verificado: true });
    }

    if (typeof filters.priceMin === 'number' || typeof filters.priceMax === 'number') {
      conditions.push({
        paquetes: {
          some: {
            activo: true,
            ...(typeof filters.priceMin === 'number'
              ? { precio: { gte: filters.priceMin } }
              : {}),
            ...(typeof filters.priceMax === 'number'
              ? { precio: { lte: filters.priceMax } }
              : {}),
          },
        },
      });
    }

    if (filters.availableDate) {
      const date = new Date(filters.availableDate);
      date.setHours(0, 0, 0, 0);
      conditions.push({
        usuario: {
          is: {
            reservasComoFotografo: {
              none: {
                fechaEvento: date,
                estado: {
                  in: ['PENDIENTE', 'CONFIRMADA'],
                },
              },
            },
          },
        },
      });
    }

    if (filters.query) {
      conditions.push({
        OR: [
          {
            nombrePublico: {
              contains: filters.query,
            },
          },
          {
            biografia: {
              contains: filters.query,
            },
          },
          {
            ubicacion: {
              contains: filters.query,
            },
          },
          {
            usuario: {
              is: {
                nombreCompleto: {
                  contains: filters.query,
                },
              },
            },
          },
        ],
      });
    }

    return {
      AND: conditions,
    };
  }

  private static buildOrderBy(filters: ProfileFilters): PerfilOrderByInput {
    if (filters.sortBy === 'rating') {
      return [
        { calificacionPromedio: 'desc' },
        { totalResenas: 'desc' },
      ];
    }

    if (filters.sortBy === 'recent') {
      return [{ createdAt: 'desc' }];
    }

    // Ordenamiento por defecto: destacados primero (con fecha válida), luego verificados, luego por rating
    return [
      { verificado: 'desc' },
      { calificacionPromedio: 'desc' },
      { updatedAt: 'desc' },
    ];
  }

  private static getStartingPrice(paquetes: Paquete[]): number | null {
    const prices = paquetes
      .map((pkg) => Number(pkg.precio))
      .filter((value) => !Number.isNaN(value) && value >= 0);

    if (!prices.length) {
      return null;
    }

    return Math.min(...prices);
  }

  /**
   * Buscar perfil por ID
   */
  static async findById(id: number) {
    return prisma.perfilFotografo.findUnique({
      where: { id },
      include: {
        usuario: true,
        categorias: {
          include: {
            categoria: true,
          },
        },
        paquetes: true,
        portafolio: {
          orderBy: { orden: 'asc' },
        },
        albums: {
          orderBy: { orden: 'asc' },
          include: {
            imagenes: {
              orderBy: { orden: 'asc' },
            },
          },
        },
      },
    });
  }

  /**
   * Buscar perfil por ID de usuario
   */
  static async findByUserId(usuarioId: number) {
    return prisma.perfilFotografo.findUnique({
      where: { usuarioId },
      include: {
        usuario: true,
        categorias: {
          include: {
            categoria: true,
          },
        },
        paquetes: true,
        portafolio: {
          orderBy: { orden: 'asc' },
        },
        albums: {
          orderBy: { orden: 'asc' },
          include: {
            imagenes: {
              orderBy: { orden: 'asc' },
            },
          },
        },
      },
    });
  }

  /**
   * Crear perfil de fotógrafo
   */
  static async create(data: Prisma.PerfilFotografoCreateInput): Promise<PerfilFotografo> {
    return prisma.perfilFotografo.create({
      data,
    });
  }

  /**
   * Actualizar perfil
   */
  static async update(id: number, data: Prisma.PerfilFotografoUpdateInput) {
    return prisma.perfilFotografo.update({
      where: { id },
      data,
    });
  }

  /**
   * Buscar fotógrafos por ubicación
   */
  static async findByLocation(ubicacion: string) {
    return prisma.perfilFotografo.findMany({
      where: {
        ubicacion: {
          contains: ubicacion,
        },
        usuario: {
          activo: true,
        },
      },
      include: {
        usuario: true,
        categorias: {
          include: {
            categoria: true,
          },
        },
      },
    });
  }

  /**
   * Buscar fotógrafos por categoría
   */
  static async findByCategory(categoriaId: number) {
    return prisma.perfilFotografo.findMany({
      where: {
        categorias: {
          some: {
            categoriaId,
          },
        },
        usuario: {
          activo: true,
        },
      },
      include: {
        usuario: true,
        categorias: {
          include: {
            categoria: true,
          },
        },
        paquetes: {
          where: { activo: true },
        },
      },
    });
  }

  /**
   * Actualizar calificación promedio
   */
  static async updateRating(id: number, calificacionPromedio: number, totalResenas: number) {
    return prisma.perfilFotografo.update({
      where: { id },
      data: {
        calificacionPromedio,
        totalResenas,
      },
    });
  }
}
