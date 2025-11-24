import { NextResponse } from 'next/server';
import { prisma } from '@/backend/lib/prisma';

/**
 * GET /api/dashboard
 * Devuelve métricas agregadas para el dashboard:
 * - fotógrafos verificados
 * - eventos completados
 * - calificación promedio global
 */
export async function GET() {
  try {
    // Agregaciones principales
    const [verifiedPhotographers, eventsCovered, avgAgg] = await prisma.$transaction([
      prisma.perfilFotografo.count({ where: { verificado: true } }),
      prisma.reserva.count({ where: { estado: 'COMPLETADA' } }),
      prisma.perfilFotografo.aggregate({ _avg: { calificacionPromedio: true } }),
    ]);

    const averageRating = avgAgg._avg?.calificacionPromedio
      ? Number(avgAgg._avg.calificacionPromedio)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        verifiedPhotographers,
        eventsCovered,
        averageRating: Math.round(averageRating * 10) / 10, // un decimal
      },
    });
  } catch (error) {
    console.error('Error building dashboard metrics:', error);
    return NextResponse.json({ success: false, error: 'Error al generar métricas' }, { status: 500 });
  }
}
