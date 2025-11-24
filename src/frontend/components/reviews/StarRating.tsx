/**
 * ⭐ StarRating Component
 * Componente para mostrar y seleccionar calificaciones con estrellas
 */

'use client';

import React, { useState } from 'react';

interface StarRatingProps {
    rating: number; // 0-5
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showNumber?: boolean;
}

export function StarRating({
    rating,
    onRatingChange,
    readonly = false,
    size = 'md',
    showNumber = false,
}: StarRatingProps) {
    const [hover, setHover] = useState(0);

    const sizeClasses = {
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-4xl',
    };

    const handleClick = (value: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(value);
        }
    };

    const getStarClass = (index: number) => {
        const filled = hover || rating;
        const baseClass = `${sizeClasses[size]} transition-all duration-150`;

        if (index <= filled) {
            return `${baseClass} text-yellow-400`;
        }
        return `${baseClass} text-gray-300`;
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                            } ${getStarClass(star)}`}
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => !readonly && setHover(star)}
                        onMouseLeave={() => !readonly && setHover(0)}
                        disabled={readonly}
                    >
                        ★
                    </button>
                ))}
            </div>
            {showNumber && (
                <span className="text-sm font-semibold text-slate-600">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
