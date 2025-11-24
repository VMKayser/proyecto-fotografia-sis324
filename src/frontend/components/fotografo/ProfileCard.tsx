/**
 * ⚛️ Componente ProfileCard
 * Tarjeta de perfil de fotógrafo
 */

'use client';

import React from 'react';
import { Card } from '../ui';
import { IPerfilFotografo } from '../../interfaces';

interface ProfileCardProps {
  profile: IPerfilFotografo;
  onClick?: () => void;
}

export function ProfileCard({ profile, onClick }: ProfileCardProps) {
  return (
    <Card hover className="cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
            {profile.nombrePublico?.charAt(0).toUpperCase() || 'F'}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {profile.nombrePublico || 'Fotógrafo'}
            </h3>
            {profile.verificado && (
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Calificación */}
          <div className="flex items-center gap-1 my-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={i <= (profile.calificacionPromedio || 0) ? 'text-yellow-400' : 'text-gray-300'}>
                ★
              </span>
            ))}
            <span className="text-sm text-gray-600 ml-1">
              ({profile.totalResenas || 0} reseñas)
            </span>
          </div>

          {/* Ubicación y experiencia */}
          <div className="text-sm text-gray-600 space-y-1">
            {profile.ubicacion && (
              <p>📍 {profile.ubicacion}</p>
            )}
            {profile.experiencia && (
              <p>🎯 {profile.experiencia} años de experiencia</p>
            )}
          </div>

          {/* Biografía */}
          {profile.biografia && (
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
              {profile.biografia}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
