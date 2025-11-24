/**
 * GET /api/destacado/precios - Obtener precios de perfiles destacados
 */

import { NextResponse } from 'next/server';
import { DESTACADO_CONFIG, getPrecioDestacado } from '@/backend/config/monetization';

export async function GET() {
  try {
    const precios = {
      opciones: DESTACADO_CONFIG.DIAS_OPCIONES.map((dias) => ({
        dias,
        precio: getPrecioDestacado(dias),
        ahorro: dias === 7 
          ? 0 
          : dias === 30 
          ? DESTACADO_CONFIG.DESCUENTO_30_DIAS 
          : DESTACADO_CONFIG.DESCUENTO_90_DIAS,
        precioOriginal: dias === 7 
          ? getPrecioDestacado(7) 
          : (getPrecioDestacado(7) / 7) * dias,
      })),
      moneda: 'BOB',
      beneficios: [
        '⭐ Badge "Destacado" en tu perfil',
        '📍 Apareces primero en búsquedas',
        '🎨 Banner especial en página de inicio',
        '📊 Estadísticas detalladas',
        '👁️ Mayor visibilidad',
      ],
    };

    return NextResponse.json({
      success: true,
      data: precios,
    });
  } catch (error) {
    console.error('Error al obtener precios:', error);
    return NextResponse.json(
      { error: 'Error al obtener precios' },
      { status: 500 }
    );
  }
}
