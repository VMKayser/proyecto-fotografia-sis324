/**
 * 📋 ReviewList Component
 * Lista de reseñas para perfil público del fotógrafo
 */

'use client';

import React, { useEffect, useState } from 'react';
import { StarRating } from './StarRating';
import { ReviewResponseModal } from './ReviewResponseModal';
import { useAuth } from '@/frontend/repositories';

interface Review {
    id: number;
    calificacion: number;
    comentario: string | null;
    publicadoPor: string | null;
    respuesta: string | null;
    createdAt: string;
    reserva: {
        cliente: {
            nombreCompleto: string;
        };
    };
}

interface ReviewListProps {
    fotografoId: number;
}

export function ReviewList({ fotografoId }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<{
        totalResenas: number;
        calificacionPromedio: number;
        distribucion: { [key: number]: number };
    } | null>(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const { user } = useAuth();

    // Detectar si el usuario es el fotógrafo dueño
    const isOwnerPhotographer = user?.rol === 'FOTOGRAFO' && user?.id === fotografoId;

    useEffect(() => {
        fetchReviews();
    }, [fotografoId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/reviews?fotografoId=${fotografoId}&limit=50`);

            if (!response.ok) {
                throw new Error('Error al cargar reseñas');
            }

            const data = await response.json();

            if (data.success) {
                setReviews(data.data);
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar reseñas');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-slate-600">Cargando reseñas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="bg-slate-50 rounded-lg p-12 text-center">
                <p className="text-xl text-slate-500">Aún no hay reseñas</p>
                <p className="text-sm text-slate-400 mt-2">
                    Sé el primero en dejar una reseña para este fotógrafo
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Resumen de estadísticas */}
            {stats && stats.totalResenas > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-blue-600">
                                {stats.calificacionPromedio.toFixed(1)}
                            </p>
                            <StarRating rating={stats.calificacionPromedio} readonly size="md" />
                            <p className="text-sm text-slate-600 mt-2">
                                {stats.totalResenas} {stats.totalResenas === 1 ? 'reseña' : 'reseñas'}
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = stats.distribucion[star] || 0;
                                    const percentage = (count / stats.totalResenas) * 100;
                                    return (
                                        <div key={star} className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-slate-700 w-12">
                                                {star} ★
                                            </span>
                                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                                                <div
                                                    className="bg-yellow-400 h-2 rounded-full transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-slate-500 w-12 text-right">
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de reseñas */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                        {/* Header de la reseña */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="font-semibold text-slate-900">
                                    {review.publicadoPor || review.reserva.cliente.nombreCompleto}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {new Date(review.createdAt).toLocaleDateString('es-BO', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                            <StarRating rating={review.calificacion} readonly size="sm" />
                        </div>

                        {/* Comentario */}
                        {review.comentario && (
                            <p className="text-slate-700 leading-relaxed mb-4">
                                {review.comentario}
                            </p>
                        )}

                        {/* Respuesta del fotógrafo */}
                        {review.respuesta && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 mt-4">
                                <p className="text-sm font-semibold text-blue-900 mb-2">
                                    Respuesta del fotógrafo
                                </p>
                                <p className="text-sm text-blue-800">{review.respuesta}</p>
                            </div>
                        )}

                        {/* Botón para responder (solo fotógrafo dueño sin respuesta) */}
                        {isOwnerPhotographer && !review.respuesta && (
                            <div className="mt-4">
                                <button
                                    onClick={() => {
                                        setSelectedReview(review);
                                        setShowResponseModal(true);
                                    }}
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
                                >
                                    💬 Responder a esta reseña
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal de respuesta */}
            {selectedReview && (
                <ReviewResponseModal
                    isOpen={showResponseModal}
                    onClose={() => {
                        setShowResponseModal(false);
                        setSelectedReview(null);
                    }}
                    reviewId={selectedReview.id}
                    clienteNombre={selectedReview.publicadoPor || selectedReview.reserva.cliente.nombreCompleto}
                    calificacion={selectedReview.calificacion}
                    comentario={selectedReview.comentario || ''}
                    onSuccess={() => {
                        fetchReviews(); // Refrescar lista
                    }}
                />
            )}
        </div>
    );
}
