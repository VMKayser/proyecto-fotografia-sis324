
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Buscando fotógrafo con calificación 4.8...");

    // Buscar por calificación exacta o cercana
    const photographers = await prisma.perfilFotografo.findMany({
        where: {
            calificacionPromedio: {
                gte: 4.7,
                lte: 4.9
            }
        },
        include: {
            usuario: true,
            albums: true,
            portafolio: true
        }
    });

    if (photographers.length > 0) {
        for (const p of photographers) {
            console.log("------------------------------------------------");
            console.log(`Fotógrafo: ${p.nombrePublico} (ID: ${p.id})`);
            console.log(`Calificación almacenada: ${p.calificacionPromedio}`);
            console.log(`Total reseñas almacenado: ${p.totalResenas}`);
            console.log(`Total álbumes reales: ${p.albums.length}`);
            console.log(`Total imágenes sueltas reales: ${p.portafolio.length}`);

            // Contar reseñas reales
            const reservas = await prisma.reserva.findMany({
                where: { fotografoId: p.usuarioId },
                include: { resena: true }
            });

            let totalReviews = 0;
            let sumRatings = 0;

            reservas.forEach(r => {
                if (r.resena) {
                    totalReviews++;
                    sumRatings += r.resena.calificacion;
                }
            });

            console.log(`Total reseñas reales encontradas: ${totalReviews}`);
            const calculatedAvg = totalReviews > 0 ? sumRatings / totalReviews : 0;
            console.log(`Promedio calculado: ${calculatedAvg.toFixed(2)}`);
            console.log("------------------------------------------------");
        }
    } else {
        console.log("No se encontraron fotógrafos con calificación entre 4.7 y 4.9.");
        const all = await prisma.perfilFotografo.findMany({
            select: { nombrePublico: true, calificacionPromedio: true }
        });
        console.log("Todos los fotógrafos:", all);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
