/**
 * 🔧 ReviewService
 * Servicio con lógica de negocio y validaciones para reseñas
 */

import { ReviewRepository } from '../repositories/reviewRepository';
import { ReservationRepository } from '../repositories/reservationRepository';
import { ProfileRepository } from '../repositories/profileRepository';
import { CreateResenaDTO } from '../types';
import { Resena } from '@prisma/client';

export class ReviewService {
    /**
     * Crear nueva reseña
     */
    static async createReview(
        clienteId: number,
        data: CreateResenaDTO
    ): Promise<Resena> {
        // 1. Verificar que la reserva existe
        const reserva = await ReservationRepository.findById(data.reservaId);
        if (!reserva) {
            throw new Error('Reserva no encontrada');
        }

        // 2. Verificar que el usuario es el cliente de la reserva
        if (reserva.clienteId !== clienteId) {
            throw new Error('Solo el cliente de la reserva puede dejar una reseña');
        }

        // 3. Verificar que la reserva está completada
        if (reserva.estado !== 'COMPLETADA') {
            throw new Error('Solo puedes dejar reseña en reservas completadas');
        }

        // 4. Verificar que no existe una reseña previa
        const existingReview = await ReviewRepository.findByReservaId(data.reservaId);
        if (existingReview) {
            throw new Error('Ya existe una reseña para esta reserva');
        }

        // 5. Validar calificación
        if (data.calificacion < 1 || data.calificacion > 5) {
            throw new Error('La calificación debe estar entre 1 y 5');
        }

        // 6. Crear la reseña
        const review = await ReviewRepository.create(data);

        // 7. Actualizar rating promedio del fotógrafo
        await this.updatePhotographerRating(reserva.fotografoId);

        return review;
    }

    /**
     * Obtener reseñas de un fotógrafo
     */
    static async getReviewsByFotografo(
        fotografoId: number,
        page: number = 1,
        limit: number = 10
    ) {
        const reviews = await ReviewRepository.findByFotografoId(fotografoId, {
            page,
            limit,
            onlyVisible: true,
        });

        const total = await ReviewRepository.countByFotografoId(fotografoId, true);
        const stats = await ReviewRepository.getStats(fotografoId);

        return {
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats,
        };
    }

    /**
     * Obtener una reseña por ID
     */
    static async getReviewById(id: number): Promise<Resena> {
        const review = await ReviewRepository.findById(id);
        if (!review) {
            throw new Error('Reseña no encontrada');
        }
        return review;
    }

    /**
     * Fotógrafo responde a una reseña
     */
    static async respondToReview(
        reviewId: number,
        fotografoId: number,
        respuesta: string
    ): Promise<Resena> {
        const review = await ReviewRepository.findById(reviewId);
        if (!review) {
            throw new Error('Reseña no encontrada');
        }

        // Verificar que el fotógrafo es el correcto (obtener de la reserva)
        const reserva = await ReservationRepository.findById(review.reservaId);
        if (reserva?.fotografoId !== fotografoId) {
            throw new Error('Solo el fotógrafo puede responder a esta reseña');
        }

        return ReviewRepository.update(reviewId, { respuesta });
    }

    /**
     * Admin oculta/muestra una reseña
     */
    static async toggleVisibility(reviewId: number, visible: boolean): Promise<Resena> {
        const review = await ReviewRepository.findById(reviewId);
        if (!review) {
            throw new Error('Reseña no encontrada');
        }

        const updated = await ReviewRepository.update(reviewId, { visible });

        // Actualizar rating del fotógrafo (obtener de la reserva)
        const reserva = await ReservationRepository.findById(review.reservaId);
        if (reserva) {
            await this.updatePhotographerRating(reserva.fotografoId);
        }

        return updated;
    }

    /**
     * Eliminar reseña (solo admin)
     */
    static async deleteReview(reviewId: number): Promise<void> {
        const review = await ReviewRepository.findById(reviewId);
        if (!review) {
            throw new Error('Reseña no encontrada');
        }

        // Obtener el fotografo ID antes de eliminar
        const reserva = await ReservationRepository.findById(review.reservaId);
        const fotografoId = reserva?.fotografoId;

        await ReviewRepository.delete(reviewId);

        // Actualizar rating del fotógrafo
        if (fotografoId) {
            await this.updatePhotographerRating(fotografoId);
        }
    }

    /**
     * Actualizar rating promedio del fotógrafo
     */
    private static async updatePhotographerRating(fotografoId: number): Promise<void> {
        const stats = await ReviewRepository.getStats(fotografoId);

        // Buscar el perfil del fotógrafo
        const profile = await ProfileRepository.findByUserId(fotografoId);
        if (!profile) {
            return;
        }

        // Actualizar el perfil con los nuevos valores
        await ProfileRepository.updateRating(
            profile.id,
            stats.calificacionPromedio,
            stats.totalResenas
        );
    }
}
