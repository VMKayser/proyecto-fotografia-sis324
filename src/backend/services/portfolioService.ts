// ============================================
// PORTFOLIO SERVICE - Álbumes e Imágenes
// ============================================

import { prisma } from '@/backend/lib/prisma';
import {
  CreatePortafolioAlbumDTO,
  UpdatePortafolioAlbumDTO,
} from '../types';

export class PortfolioService {
  private static DEFAULT_ALBUM_NAME = 'Sesiones destacadas';

  private static slugify(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static async getFotografoIdByUser(userId: number) {
    const perfil = await prisma.perfilFotografo.findUnique({
      where: { usuarioId: userId },
      select: { id: true },
    });

    if (!perfil) {
      throw new Error('Debes crear tu perfil de fotógrafo antes de gestionar tu portafolio.');
    }

    return perfil.id;
  }

  static async listAlbums(fotografoId: number, options?: { onlyVisible?: boolean }) {
    return prisma.portafolioAlbum.findMany({
      where: {
        fotografoId,
        ...(options?.onlyVisible ? { visible: true } : {}),
      },
      orderBy: { orden: 'asc' },
      include: {
        imagenes: {
          orderBy: { orden: 'asc' },
        },
      },
    });
  }

  static async ensureDefaultAlbum(fotografoId: number) {
    const existing = await prisma.portafolioAlbum.findMany({
      where: { fotografoId },
      orderBy: { orden: 'asc' },
    });

    if (existing.length > 0) {
      return existing[0];
    }

    return prisma.portafolioAlbum.create({
      data: {
        fotografoId,
        nombre: this.DEFAULT_ALBUM_NAME,
        slug: this.slugify(this.DEFAULT_ALBUM_NAME),
        orden: 1,
        visible: true,
      },
    });
  }

  static async createAlbum(data: CreatePortafolioAlbumDTO) {
    const normalizedName = data.nombre.trim();
    const slug = this.slugify(normalizedName);
    const existingCount = await prisma.portafolioAlbum.count({ where: { fotografoId: data.fotografoId } });

    return prisma.portafolioAlbum.create({
      data: {
        fotografoId: data.fotografoId,
        nombre: normalizedName,
        descripcion: data.descripcion,
        portadaUrl: data.portadaUrl,
        orden: data.orden ?? existingCount + 1,
        visible: data.visible ?? true,
        slug,
      },
    });
  }

  static async updateAlbum(id: number, fotografoId: number, data: UpdatePortafolioAlbumDTO) {
    const album = await prisma.portafolioAlbum.findUnique({ where: { id } });

    if (!album || album.fotografoId !== fotografoId) {
      throw new Error('Álbum no encontrado');
    }

    const payload: UpdatePortafolioAlbumDTO & { slug?: string } = { ...data };

    if (data.nombre && data.nombre !== album.nombre) {
      payload.slug = this.slugify(data.nombre);
    }

    return prisma.portafolioAlbum.update({
      where: { id },
      data: payload,
    });
  }

  static async deleteAlbum(id: number, fotografoId: number) {
    const album = await prisma.portafolioAlbum.findUnique({ where: { id } });

    if (!album || album.fotografoId !== fotografoId) {
      throw new Error('Álbum no encontrado');
    }

    const totalAlbums = await prisma.portafolioAlbum.count({ where: { fotografoId } });

    if (totalAlbums <= 1) {
      throw new Error('Necesitas al menos un álbum para tu portafolio.');
    }

    const fallbackAlbum = await prisma.portafolioAlbum.findFirst({
      where: {
        fotografoId,
        id: { not: id },
      },
      orderBy: { orden: 'asc' },
    });

    if (!fallbackAlbum) {
      throw new Error('No hay otro álbum disponible para reasignar las imágenes.');
    }

    await prisma.portafolioImagen.updateMany({
      where: { albumId: id },
      data: {
        albumId: fallbackAlbum.id,
        album: fallbackAlbum.nombre,
      },
    });

    await prisma.portafolioAlbum.delete({ where: { id } });
    await this.syncCoverFromImages(fallbackAlbum.id);

    return fallbackAlbum;
  }

  static async resolveAlbumForImage(options: {
    fotografoId: number;
    albumId?: number | null;
    albumName?: string | null;
  }) {
    if (options.albumId) {
      const album = await prisma.portafolioAlbum.findUnique({ where: { id: options.albumId } });
      if (!album || album.fotografoId !== options.fotografoId) {
        throw new Error('Álbum inválido');
      }
      return album;
    }

    if (options.albumName) {
      const normalized = options.albumName.trim();
      const existing = await prisma.portafolioAlbum.findFirst({
        where: {
          fotografoId: options.fotografoId,
          nombre: normalized,
        },
      });

      if (existing) {
        return existing;
      }

      return this.createAlbum({ fotografoId: options.fotografoId, nombre: normalized });
    }

    return this.ensureDefaultAlbum(options.fotografoId);
  }

  static async setAlbumCoverFromImage(albumId: number, imageUrl: string) {
    await prisma.portafolioAlbum.update({
      where: { id: albumId },
      data: { portadaUrl: imageUrl },
    });
  }

  static async syncCoverFromImages(albumId: number) {
    const nextImage = await prisma.portafolioImagen.findFirst({
      where: { albumId },
      orderBy: { orden: 'asc' },
    });

    await prisma.portafolioAlbum.update({
      where: { id: albumId },
      data: {
        portadaUrl: nextImage?.urlImagen ?? null,
      },
    });
  }
}
