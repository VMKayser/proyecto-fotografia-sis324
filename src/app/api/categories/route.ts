/**
 * 📁 API Route - Categorías
 * GET /api/categories - Listar todas las categorías
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/categories
 * Obtener todas las categorías activas
 */
export async function GET() {
  try {
    const categories = await prisma.categoria.findMany({
      where: {
        activo: true,
      },
      include: {
        _count: {
          select: {
            fotografos: true,
          },
        },
      },
      orderBy: {
        orden: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json(
      { message: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}
