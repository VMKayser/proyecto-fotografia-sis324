/**
 * 💬 ReviewResponseModal Component
 * Modal para que fotógrafos respondan a reseñas de clientes
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components';

interface ReviewResponseModalProps {
    isOpen: boolean;
    onClose: () => void;
    reviewId: number;
    clienteNombre: string;
    calificacion: number;
    comentario: string;
    onSuccess: () => void;
}

export function ReviewResponseModal({
    isOpen,
    onClose,
    reviewId,
    clienteNombre,
    calificacion,
    comentario,
    onSuccess,
}: ReviewResponseModalProps) {
    const [respuesta, setRespuesta] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!respuesta.trim()) {
            setError('La respuesta no puede estar vacía');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No estás autenticado');
            }

            const response = await fetch(`/api/reviews/${reviewId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ respuesta: respuesta.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al enviar respuesta');
            }

            // Éxito
            onSuccess();
            onClose();
            setRespuesta('');

        } catch (err) {
            console.error('Error submitting response:', err);
            setError(err instanceof Error ? err.message : 'Error al enviar respuesta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
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
                        Responder a reseña
                    </h2>
                    <p className="text-slate-600 text-sm">
                        Responde de manera profesional y agradece el feedback de <span className="font-semibold">{clienteNombre}</span>
                    </p>
                </div>

                {/* Reseña original */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-slate-900">{clienteNombre}</span>
                        <div className="flex text-yellow-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < calificacion ? 'text-yellow-400' : 'text-gray-300'}>
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                    {comentario && (
                        <p className="text-slate-700 text-sm leading-relaxed">
                            "{comentario}"
                        </p>
                    )}
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Respuesta */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Tu respuesta *
                        </label>
                        <textarea
                            value={respuesta}
                            onChange={(e) => setRespuesta(e.target.value)}
                            placeholder="Agradece el feedback y comparte tu experiencia trabajando con este cliente..."
                            rows={5}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            maxLength={500}
                            disabled={loading}
                        />
                        <p className="text-xs text-slate-500 mt-1 text-right">
                            {respuesta.length}/500
                        </p>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-900 mb-2">💡 Consejos para una buena respuesta:</p>
                        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                            <li>Agradece el tiempo que tomaron para dejar la reseña</li>
                            <li>Sé profesional y cortés, incluso con críticas</li>
                            <li>Menciona algo específico sobre su evento si es posible</li>
                            <li>Invita a futuros clientes a contactarte</li>
                        </ul>
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
                            disabled={loading || !respuesta.trim()}
                            className="flex-1"
                        >
                            {loading ? 'Enviando...' : 'Enviar Respuesta'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
