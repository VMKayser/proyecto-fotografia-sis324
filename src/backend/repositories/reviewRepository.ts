/**
 * 📦 ReviewRepository
 * Repositorio para operaciones CRUD de reseñas en la base de datos
 */

import { prisma } from '@/backend/lib/prisma';
import { Resena } from '@prisma/client';
import { CreateResenaDTO, UpdateResenaDTO } from '../types';

export class ReviewRepository {
    /**
     * Crear nueva reseña
     */
    static async create(data: CreateResenaDTO): Promise<Resena> {
        return prisma.resena.create({
            data: {
                reservaId: data.reservaId,
                calificacion: data.calificacion,
                comentario: data.comentario,
                publicadoPor: data.publicadoPor,
            },
        });
    }

    /**
     * Buscar reseña por ID
     */
    static async findById(id: number): Promise<Resena | null> {
        return prisma.resena.findUnique({
            where: { id },
            include: {
                reserva: {
                    include: {
                        cliente: true,
                        fotografo: true,
                    },
                },
            },
        });
    }

    /**
     * Buscar reseña por ID de reserva
     */
    static async findByReservaId(reservaId: number): Promise<Resena | null> {
        return prisma.resena.findUnique({
            where: { reservaId },
        });
    }

    /**
     * Listar reseñas de un fotógrafo
     */
    static async findByFotografoId(
        fotografoId: number,
        options?: {
            page?: number;
            limit?: number;
            onlyVisible?: boolean;
        }
    ): Promise<Resena[]> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;

        return prisma.resena.findMany({
            where: {
                reserva: {
                    fotografoId,
                },
                ...(options?.onlyVisible && { visible: true }),
            },
            include: {
                reserva: {
                    include: {
                        cliente: {
                            select: {
                                nombreCompleto: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: limit,
        });
    }

    /**
     * Contar reseñas de un fotógrafo
     */
    static async countByFotografoId(
        fotografoId: number,
        onlyVisible: boolean = true
    ): Promise<number> {
        return prisma.resena.count({
            where: {
                reserva: {
                    fotografoId,
                },
                ...(onlyVisible && { visible: true }),
            },
        });
    }

    /**
     * Actualizar reseña (respuesta del fotógrafo)
     */
    static async update(id: number, data: UpdateResenaDTO): Promise<Resena> {
        return prisma.resena.update({
            where: { id },
            data,
        });
    }

    /**
     * Eliminar reseña
     */
    static async delete(id: number): Promise<Resena> {
        return prisma.resena.delete({
            where: { id },
        });
    }

    /**
     * Obtener estadísticas de reseñas de un fotógrafo
     */
    static async getStats(fotografoId: number) {
        const reviews = await prisma.resena.findMany({
            where: {
                reserva: {
                    fotografoId,
                },
                visible: true,
            },
            select: {
                calificacion: true,
            },
        });

        if (reviews.length === 0) {
            return {
                totalResenas: 0,
                calificacionPromedio: 0,
                distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };
        }

        const total = reviews.length;
        const suma = reviews.reduce((acc, r) => acc + r.calificacion, 0);
        const promedio = suma / total;

        // Distribución de calificaciones
        const distribucion = reviews.reduce((acc, r) => {
            acc[r.calificacion as 1 | 2 | 3 | 4 | 5]++;
            return acc;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

        return {
            totalResenas: total,
            calificacionPromedio: Math.round(promedio * 100) / 100,
            distribucion,
        };
    }
}
