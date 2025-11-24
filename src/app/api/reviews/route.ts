/**
 * POST /api/reviews - Crear nueva reseña
 * GET /api/reviews - Listar reseñas (con filtros)
 */

export { dynamic } from '@/backend/config/routeConfig';
import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/backend/services/reviewService';
import { AuthService } from '@/backend/services/authService';

/**
 * POST /api/reviews
 * Crear una nueva reseña
 */
export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = await AuthService.verifyToken(token);

        if (!decoded) {
            return NextResponse.json(
                { success: false, error: 'Token inválido' },
                { status: 401 }
            );
        }

        // Solo clientes pueden crear reseñas
        if (decoded.rol !== 'CLIENTE') {
            return NextResponse.json(
                { success: false, error: 'Solo clientes pueden dejar reseñas' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { reservaId, calificacion, comentario } = body;

        if (!reservaId || !calificacion) {
            return NextResponse.json(
                { success: false, error: 'Faltan datos requeridos: reservaId, calificacion' },
                { status: 400 }
            );
        }

        // Crear la reseña
        const review = await ReviewService.createReview(decoded.userId, {
            reservaId: Number(reservaId),
            calificacion: Number(calificacion),
            comentario: comentario || undefined,
            // publicadoPor se tomará del nombre del cliente en la BD
        });

        return NextResponse.json({
            success: true,
            data: review,
            message: 'Reseña creada exitosamente',
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Error al crear reseña',
            },
            { status: 400 }
        );
    }
}

/**
 * GET /api/reviews?fotografoId=X&page=1&limit=10
 * Obtener reseñas de un fotógrafo
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const fotografoId = searchParams.get('fotografoId');

        if (!fotografoId) {
            return NextResponse.json(
                { success: false, error: 'fotografoId es requerido' },
                { status: 400 }
            );
        }

        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 10;

        const result = await ReviewService.getReviewsByFotografo(
            Number(fotografoId),
            page,
            limit
        );

        return NextResponse.json({
            success: true,
            data: result.reviews,
            pagination: result.pagination,
            stats: result.stats,
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Error al obtener reseñas',
            },
            { status: 500 }
        );
    }
}
