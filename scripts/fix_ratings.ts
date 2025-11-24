import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔄 Recalculando calificaciones y reseñas de fotógrafos...\n");

    const fotografos = await prisma.perfilFotografo.findMany();

    for (const foto of fotografos) {
        // Obtener todas las reservas del fotógrafo con sus reseñas
        const reservas = await prisma.reserva.findMany({
            where: { fotografoId: foto.usuarioId },
            include: { resena: true }
        });

        // Contar solo las reseñas visibles
        const resenasReales = reservas
            .map(r => r.resena)
            .filter(r => r && r.visible);

        const totalResenas = resenasReales.length;

        let calificacionPromedio = 0;

        if (totalResenas > 0) {
            const suma = resenasReales.reduce((acc, r) => acc + (r?.calificacion || 0), 0);
            calificacionPromedio = suma / totalResenas;
        }

        // Actualizar perfil
        await prisma.perfilFotografo.update({
            where: { id: foto.id },
            data: {
                totalResenas: totalResenas,
                calificacionPromedio: calificacionPromedio
            }
        });

        console.log(`✅ ${foto.nombrePublico || 'Sin nombre'}: ${totalResenas} reseñas, promedio ${calificacionPromedio.toFixed(2)}`);
    }

    console.log("\n✨ Proceso completado. Todas las calificaciones ahora reflejan datos reales.");
}

main()
    .catch(e => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
