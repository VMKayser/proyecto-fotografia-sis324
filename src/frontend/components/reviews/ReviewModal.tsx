/**
 * 📝 ReviewModal Component
 * Modal para que el cliente deje una reseña
 */

'use client';

import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { Button } from '@/components';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservaId: number;
    fotografoNombre: string;
    onSuccess: () => void;
}

export function ReviewModal({
    isOpen,
    onClose,
    reservaId,
    fotografoNombre,
    onSuccess,
}: ReviewModalProps) {
    const [calificacion, setCalificacion] = useState(0);
    const [comentario, setComentario] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (calificacion === 0) {
            setError('Por favor selecciona una calificación');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No estás autenticado');
            }

            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    reservaId,
                    calificacion,
                    comentario: comentario.trim() || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al enviar reseña');
            }

            // Éxito
            onSuccess();
            onClose();

            // Resetear formulario
            setCalificacion(0);
            setComentario('');

        } catch (err) {
            console.error('Error submitting review:', err);
            setError(err instanceof Error ? err.message : 'Error al enviar reseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl font-bold"
                    disabled={loading}
                >
                    ×
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Deja tu reseña
                    </h2>
                    <p className="text-slate-600 text-sm">
                        ¿Cómo fue tu experiencia con <span className="font-semibold">{fotografoNombre}</span>?
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Calificación */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Calificación *
                        </label>
                        <div className="flex justify-center">
                            <StarRating
                                rating={calificacion}
                                onRatingChange={setCalificacion}
                                size="lg"
                            />
                        </div>
                        {calificacion > 0 && (
                            <p className="text-center text-sm text-slate-500 mt-2">
                                {calificacion === 5 && '¡Excelente!'}
                                {calificacion === 4 && 'Muy bueno'}
                                {calificacion === 3 && 'Bueno'}
                                {calificacion === 2 && 'Regular'}
                                {calificacion === 1 && 'Necesita mejorar'}
                            </p>
                        )}
                    </div>

                    {/* Comentario */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Comentario (opcional)
                        </label>
                        <textarea
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            placeholder="Cuéntanos sobre tu experiencia..."
                            rows={4}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            maxLength={500}
                            disabled={loading}
                        />
                        <p className="text-xs text-slate-500 mt-1 text-right">
                            {comentario.length}/500
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading || calificacion === 0}
                            className="flex-1"
                        >
                            {loading ? 'Enviando...' : 'Enviar Reseña'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
