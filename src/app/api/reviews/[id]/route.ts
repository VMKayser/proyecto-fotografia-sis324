/**
 * PATCH /api/reviews/[id] - Fotógrafo responde a reseña
 * DELETE /api/reviews/[id] - Admin elimina reseña
 */

export { dynamic } from '@/backend/config/routeConfig';
import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/backend/services/reviewService';
import { AuthService } from '@/backend/services/authService';

/**
 * PATCH /api/reviews/[id]
 * Fotógrafo responde a una reseña
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id);
        if (Number.isNaN(id)) {
            return NextResponse.json(
                { success: false, error: 'ID inválido' },
                { status: 400 }
            );
        }

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

        // Solo fotógrafos pueden responder
        if (decoded.rol !== 'FOTOGRAFO') {
            return NextResponse.json(
                { success: false, error: 'Solo fotógrafos pueden responder reseñas' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { respuesta } = body;

        if (!respuesta) {
            return NextResponse.json(
                { success: false, error: 'La respuesta es requerida' },
                { status: 400 }
            );
        }

        const review = await ReviewService.respondToReview(
            id,
            decoded.userId,
            respuesta
        );

        return NextResponse.json({
            success: true,
            data: review,
            message: 'Respuesta agregada exitosamente',
        });

    } catch (error) {
        console.error('Error responding to review:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Error al responder reseña',
            },
            { status: 400 }
        );
    }
}

/**
 * DELETE /api/reviews/[id]
 * Admin elimina una reseña
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id);
        if (Number.isNaN(id)) {
            return NextResponse.json(
                { success: false, error: 'ID inválido' },
                { status: 400 }
            );
        }

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

        // Solo admin puede eliminar
        if (decoded.rol !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Solo administradores pueden eliminar reseñas' },
                { status: 403 }
            );
        }

        await ReviewService.deleteReview(id);

        return NextResponse.json({
            success: true,
            message: 'Reseña eliminada exitosamente',
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Error al eliminar reseña',
            },
            { status: 400 }
        );
    }
}
