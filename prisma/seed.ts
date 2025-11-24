/**
 * 🌱 SEED - Datos de Prueba
 * Script para poblar la base de datos con datos iniciales
 */

import { PrismaClient, RolUsuario, EstadoReserva, Moneda } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar datos existentes
  console.log('🗑️  Limpiando datos existentes...');
  await prisma.resena.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.portafolioImagen.deleteMany();
  await prisma.paquete.deleteMany();
  await prisma.fotografoCategoria.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.perfilFotografo.deleteMany();
  await prisma.usuario.deleteMany();

  // Crear hash de contraseña
  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. USUARIOS
  console.log('👥 Creando usuarios...');
  
  const admin = await prisma.usuario.create({
    data: {
      nombre: 'admin',
      nombreCompleto: 'Administrador del Sistema',
      email: 'admin@fotografia.com',
      passwordHash,
      rol: RolUsuario.ADMIN,
      telefono: '70000000',
      activo: true,
      emailVerificado: true,
    },
  });

  const cliente1 = await prisma.usuario.create({
    data: {
      nombre: 'maria',
      nombreCompleto: 'María García López',
      email: 'maria@email.com',
      passwordHash,
      rol: RolUsuario.CLIENTE,
      telefono: '70111111',
      activo: true,
      emailVerificado: true,
    },
  });

  const cliente2 = await prisma.usuario.create({
    data: {
      nombre: 'carlos',
      nombreCompleto: 'Carlos Mendoza Rojas',
      email: 'carlos@email.com',
      passwordHash,
      rol: RolUsuario.CLIENTE,
      telefono: '70222222',
      activo: true,
      emailVerificado: true,
    },
  });

  const fotografo1 = await prisma.usuario.create({
    data: {
      nombre: 'ana',
      nombreCompleto: 'Ana Pérez Gutiérrez',
      email: 'ana@fotografia.com',
      passwordHash,
      rol: RolUsuario.FOTOGRAFO,
      telefono: '70333333',
      activo: true,
      emailVerificado: true,
    },
  });

  const fotografo2 = await prisma.usuario.create({
    data: {
      nombre: 'luis',
      nombreCompleto: 'Luis Fernández Morales',
      email: 'luis@fotografia.com',
      passwordHash,
      rol: RolUsuario.FOTOGRAFO,
      telefono: '70444444',
      activo: true,
      emailVerificado: true,
    },
  });

  const fotografo3 = await prisma.usuario.create({
    data: {
      nombre: 'sofia',
      nombreCompleto: 'Sofía Rodríguez Castro',
      email: 'sofia@fotografia.com',
      passwordHash,
      rol: RolUsuario.FOTOGRAFO,
      telefono: '70555555',
      activo: true,
      emailVerificado: true,
    },
  });

  console.log(`✅ Creados 6 usuarios`);

  // 2. CATEGORÍAS
  console.log('📁 Creando categorías...');
  
  const catBodas = await prisma.categoria.create({
    data: {
      nombre: 'Bodas',
      tipo: 'Tipo de Evento',
      descripcion: 'Fotografía profesional para bodas y ceremonias nupciales',
      icono: '💒',
      activo: true,
      orden: 1,
    },
  });

  const catEventos = await prisma.categoria.create({
    data: {
      nombre: 'Eventos Corporativos',
      tipo: 'Tipo de Evento',
      descripcion: 'Cobertura de eventos empresariales, conferencias y seminarios',
      icono: '🏢',
      activo: true,
      orden: 2,
    },
  });

  const catRetratos = await prisma.categoria.create({
    data: {
      nombre: 'Retratos',
      tipo: 'Estilo Fotográfico',
      descripcion: 'Sesiones de retratos individuales y familiares',
      icono: '👤',
      activo: true,
      orden: 3,
    },
  });

  const catProductos = await prisma.categoria.create({
    data: {
      nombre: 'Productos',
      tipo: 'Tipo de Servicio',
      descripcion: 'Fotografía de productos para catálogos y e-commerce',
      icono: '📦',
      activo: true,
      orden: 4,
    },
  });

  const catDeportes = await prisma.categoria.create({
    data: {
      nombre: 'Deportes',
      tipo: 'Tipo de Evento',
      descripcion: 'Fotografía deportiva y de acción',
      icono: '⚽',
      activo: true,
      orden: 5,
    },
  });

  const catNaturaleza = await prisma.categoria.create({
    data: {
      nombre: 'Naturaleza',
      tipo: 'Estilo Fotográfico',
      descripcion: 'Fotografía de paisajes, vida silvestre y naturaleza',
      icono: '🌿',
      activo: true,
      orden: 6,
    },
  });

  const catArquitectura = await prisma.categoria.create({
    data: {
      nombre: 'Arquitectura',
      tipo: 'Tipo de Servicio',
      descripcion: 'Fotografía arquitectónica, interiores y bienes raíces',
      icono: '🏛️',
      activo: true,
      orden: 7,
    },
  });

  const catModa = await prisma.categoria.create({
    data: {
      nombre: 'Moda',
      tipo: 'Estilo Fotográfico',
      descripcion: 'Sesiones de moda, pasarelas y lookbooks',
      icono: '👗',
      activo: true,
      orden: 8,
    },
  });

  const catGastronomia = await prisma.categoria.create({
    data: {
      nombre: 'Gastronomía',
      tipo: 'Tipo de Servicio',
      descripcion: 'Fotografía de alimentos y bebidas para restaurantes',
      icono: '🍽️',
      activo: true,
      orden: 9,
    },
  });

  const catInfantil = await prisma.categoria.create({
    data: {
      nombre: 'Infantil',
      tipo: 'Tipo de Evento',
      descripcion: 'Fotografía infantil, cumpleaños y eventos para niños',
      icono: '👶',
      activo: true,
      orden: 10,
    },
  });

  console.log(`✅ Creadas 10 categorías`);

  // 3. PERFILES DE FOTÓGRAFOS
  console.log('📸 Creando perfiles de fotógrafos...');

  const perfilAna = await prisma.perfilFotografo.create({
    data: {
      usuarioId: fotografo1.id,
      nombrePublico: 'Ana Pérez Photography',
      biografia: 'Fotógrafa especializada en bodas y eventos sociales con más de 10 años de experiencia. Mi pasión es capturar momentos únicos e irrepetibles.',
      ubicacion: 'La Paz, Bolivia',
      sitioWeb: 'https://anaperez.photography',
      urlFotoPerfil: 'https://via.placeholder.com/200/FF6B6B/FFFFFF?text=AP',
      urlFotoPortada: 'https://via.placeholder.com/1200x400/FF6B6B/FFFFFF?text=Ana+Perez+Photography',
      calificacionPromedio: 4.8,
      totalResenas: 24,
      verificado: true,
    },
  });

  const perfilLuis = await prisma.perfilFotografo.create({
    data: {
      usuarioId: fotografo2.id,
      nombrePublico: 'Luis F. Studio',
      biografia: 'Especialista en fotografía corporativa y eventos empresariales. Trabajo con las principales empresas de Bolivia.',
      ubicacion: 'Santa Cruz, Bolivia',
      sitioWeb: 'https://luisfstudio.com',
      urlFotoPerfil: 'https://via.placeholder.com/200/4ECDC4/FFFFFF?text=LF',
      urlFotoPortada: 'https://via.placeholder.com/1200x400/4ECDC4/FFFFFF?text=Luis+F+Studio',
      calificacionPromedio: 4.9,
      totalResenas: 31,
      verificado: true,
    },
  });

  const perfilSofia = await prisma.perfilFotografo.create({
    data: {
      usuarioId: fotografo3.id,
      nombrePublico: 'Sofía Rodríguez Fotos',
      biografia: 'Fotógrafa creativa especializada en retratos y fotografía artística. Cada sesión es una experiencia única.',
      ubicacion: 'Cochabamba, Bolivia',
      sitioWeb: 'https://sofiarodriguez.photo',
      urlFotoPerfil: 'https://via.placeholder.com/200/95E1D3/FFFFFF?text=SR',
      urlFotoPortada: 'https://via.placeholder.com/1200x400/95E1D3/FFFFFF?text=Sofia+Rodriguez',
      calificacionPromedio: 4.7,
      totalResenas: 18,
      verificado: true,
    },
  });

  console.log(`✅ Creados 3 perfiles de fotógrafos`);

  // 4. RELACIÓN FOTÓGRAFOS-CATEGORÍAS
  console.log('🔗 Asociando fotógrafos con categorías...');

  await prisma.fotografoCategoria.createMany({
    data: [
      { fotografoId: perfilAna.id, categoriaId: catBodas.id },
      { fotografoId: perfilAna.id, categoriaId: catRetratos.id },
      { fotografoId: perfilAna.id, categoriaId: catInfantil.id },
      
      { fotografoId: perfilLuis.id, categoriaId: catEventos.id },
      { fotografoId: perfilLuis.id, categoriaId: catProductos.id },
      { fotografoId: perfilLuis.id, categoriaId: catArquitectura.id },
      
      { fotografoId: perfilSofia.id, categoriaId: catRetratos.id },
      { fotografoId: perfilSofia.id, categoriaId: catDeportes.id },
      { fotografoId: perfilSofia.id, categoriaId: catModa.id },
      { fotografoId: perfilSofia.id, categoriaId: catNaturaleza.id },
    ],
  });

  console.log(`✅ Creadas 10 asociaciones`);

  // 5. PAQUETES DE SERVICIOS
  console.log('📦 Creando paquetes de servicios...');

  const paquete1 = await prisma.paquete.create({
    data: {
      fotografoId: perfilAna.id,
      titulo: 'Paquete Boda Premium',
      descripcion: 'Cobertura completa de boda con álbum digital y físico. Incluye pre-boda y sesión post-boda.',
      precio: 3500,
      moneda: Moneda.BOB,
      duracionHoras: '8 horas',
      incluye: '- Cobertura completa del evento\n- 500+ fotos editadas\n- Álbum digital\n- Álbum físico 30x30cm\n- Sesión pre-boda\n- USB personalizado',
      imagenUrl: 'https://via.placeholder.com/600x400/FF6B6B/FFFFFF?text=Boda+Premium',
      activo: true,
      destacado: true,
    },
  });

  await prisma.paquete.create({
    data: {
      fotografoId: perfilAna.id,
      titulo: 'Paquete Boda Básico',
      descripcion: 'Cobertura esencial de boda con álbum digital.',
      precio: 1800,
      moneda: Moneda.BOB,
      duracionHoras: '4 horas',
      incluye: '- Cobertura de ceremonia y recepción\n- 250+ fotos editadas\n- Álbum digital\n- USB con todas las fotos',
      imagenUrl: 'https://via.placeholder.com/600x400/FF6B6B/FFFFFF?text=Boda+Basico',
      activo: true,
      destacado: false,
    },
  });

  await prisma.paquete.create({
    data: {
      fotografoId: perfilLuis.id,
      titulo: 'Cobertura Evento Corporativo',
      descripcion: 'Fotografía profesional para eventos empresariales.',
      precio: 1200,
      moneda: Moneda.BOB,
      duracionHoras: '3 horas',
      incluye: '- Cobertura del evento\n- 150+ fotos editadas\n- Entrega en 48 horas\n- Galería online privada\n- Fotos en alta resolución',
      imagenUrl: 'https://via.placeholder.com/600x400/4ECDC4/FFFFFF?text=Evento+Corporativo',
      activo: true,
      destacado: true,
    },
  });

  await prisma.paquete.create({
    data: {
      fotografoId: perfilLuis.id,
      titulo: 'Fotografía de Productos',
      descripcion: 'Sesión profesional de productos para catálogo.',
      precio: 800,
      moneda: Moneda.BOB,
      duracionHoras: '2 horas',
      incluye: '- Hasta 20 productos\n- 5 fotos por producto\n- Fondo blanco y contextual\n- Retoque profesional\n- Entrega en 3 días',
      imagenUrl: 'https://via.placeholder.com/600x400/4ECDC4/FFFFFF?text=Productos',
      activo: true,
      destacado: false,
    },
  });

  await prisma.paquete.create({
    data: {
      fotografoId: perfilSofia.id,
      titulo: 'Sesión de Retratos Familiar',
      descripcion: 'Sesión fotográfica familiar en estudio o exteriores.',
      precio: 500,
      moneda: Moneda.BOB,
      duracionHoras: '1 hora',
      incluye: '- Sesión de 1 hora\n- 30+ fotos editadas\n- Galería online\n- Opción de locación exterior\n- Retoques incluidos',
      imagenUrl: 'https://via.placeholder.com/600x400/95E1D3/FFFFFF?text=Retratos+Familiar',
      activo: true,
      destacado: true,
    },
  });

  await prisma.paquete.create({
    data: {
      fotografoId: perfilSofia.id,
      titulo: 'Cobertura Deportiva',
      descripcion: 'Fotografía de eventos deportivos y competencias.',
      precio: 600,
      moneda: Moneda.BOB,
      duracionHoras: '2 horas',
      incluye: '- Cobertura del evento\n- 100+ fotos de acción\n- Entrega rápida 24h\n- Fotos de premiación\n- USB con todas las fotos',
      imagenUrl: 'https://via.placeholder.com/600x400/95E1D3/FFFFFF?text=Deportes',
      activo: true,
      destacado: false,
    },
  });

  console.log(`✅ Creados 6 paquetes`);

  // 6. ÁLBUMES DEL PORTAFOLIO
  console.log('📚 Creando álbumes de portafolio...');

  const albumAnaBodas = await prisma.portafolioAlbum.create({
    data: {
      fotografoId: perfilAna.id,
      nombre: 'Bodas editoriales',
      slug: slugify('Bodas editoriales'),
      descripcion: 'Ceremonias, getting ready y recepciones con estética editorial.',
      portadaUrl: 'https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Boda+1',
      orden: 1,
    },
  });

  const albumAnaEngagement = await prisma.portafolioAlbum.create({
    data: {
      fotografoId: perfilAna.id,
      nombre: 'Sesiones íntimas',
      slug: slugify('Sesiones íntimas'),
      descripcion: 'Prebodas y sesiones de compromiso en exteriores.',
      portadaUrl: 'https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Boda+3',
      orden: 2,
    },
  });

  const albumLuisCorporativo = await prisma.portafolioAlbum.create({
    data: {
      fotografoId: perfilLuis.id,
      nombre: 'Eventos corporativos',
      slug: slugify('Eventos corporativos'),
      descripcion: 'Cobertura de conferencias y lanzamientos de marca.',
      portadaUrl: 'https://via.placeholder.com/800x600/4ECDC4/FFFFFF?text=Corporativo+1',
      orden: 1,
    },
  });

  const albumLuisProductos = await prisma.portafolioAlbum.create({
    data: {
      fotografoId: perfilLuis.id,
      nombre: 'Catálogos y productos',
      slug: slugify('Catálogos y productos'),
      descripcion: 'Sesiones para e-commerce y material publicitario.',
      portadaUrl: 'https://via.placeholder.com/800x600/4ECDC4/FFFFFF?text=Producto+1',
      orden: 2,
    },
  });

  const albumSofiaRetratos = await prisma.portafolioAlbum.create({
    data: {
      fotografoId: perfilSofia.id,
      nombre: 'Retratos editoriales',
      slug: slugify('Retratos editoriales'),
      descripcion: 'Familias y sesiones personales con dirección de arte.',
      portadaUrl: 'https://via.placeholder.com/800x600/95E1D3/FFFFFF?text=Retrato+1',
      orden: 1,
    },
  });

  const albumSofiaDeportes = await prisma.portafolioAlbum.create({
    data: {
      fotografoId: perfilSofia.id,
      nombre: 'Cobertura deportiva',
      slug: slugify('Cobertura deportiva'),
      descripcion: 'Acción y momentos decisivos en competencias.',
      portadaUrl: 'https://via.placeholder.com/800x600/95E1D3/FFFFFF?text=Deporte+1',
      orden: 2,
    },
  });

  console.log('✅ Creados 6 álbumes curados');

  // 7. PORTAFOLIO
  console.log('🖼️  Creando imágenes de portafolio...');

  await prisma.portafolioImagen.createMany({
    data: [
      // Ana
      { fotografoId: perfilAna.id, urlImagen: 'https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Boda+1', descripcion: 'Ceremonia de boda', orden: 1, destacada: true, albumId: albumAnaBodas.id, album: albumAnaBodas.nombre },
  { fotografoId: perfilAna.id, urlImagen: 'https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Boda+2', descripcion: 'Recepción nupcial', orden: 2, destacada: true, albumId: albumAnaBodas.id, album: albumAnaBodas.nombre },
      { fotografoId: perfilAna.id, urlImagen: 'https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Boda+3', descripcion: 'Sesión íntima al atardecer', orden: 3, destacada: false, albumId: albumAnaEngagement.id, album: albumAnaEngagement.nombre },
      
      // Luis
      { fotografoId: perfilLuis.id, urlImagen: 'https://via.placeholder.com/800x600/4ECDC4/FFFFFF?text=Corporativo+1', descripcion: 'Evento corporativo', orden: 1, destacada: true, albumId: albumLuisCorporativo.id, album: albumLuisCorporativo.nombre },
      { fotografoId: perfilLuis.id, urlImagen: 'https://via.placeholder.com/800x600/4ECDC4/FFFFFF?text=Producto+1', descripcion: 'Fotografía de producto', orden: 2, destacada: true, albumId: albumLuisProductos.id, album: albumLuisProductos.nombre },
      { fotografoId: perfilLuis.id, urlImagen: 'https://via.placeholder.com/800x600/4ECDC4/FFFFFF?text=Conferencia+1', descripcion: 'Conferencia empresarial', orden: 3, destacada: false, albumId: albumLuisCorporativo.id, album: albumLuisCorporativo.nombre },
      
      // Sofía
      { fotografoId: perfilSofia.id, urlImagen: 'https://via.placeholder.com/800x600/95E1D3/FFFFFF?text=Retrato+1', descripcion: 'Retrato familiar', orden: 1, destacada: true, albumId: albumSofiaRetratos.id, album: albumSofiaRetratos.nombre },
      { fotografoId: perfilSofia.id, urlImagen: 'https://via.placeholder.com/800x600/95E1D3/FFFFFF?text=Deporte+1', descripcion: 'Fotografía deportiva', orden: 2, destacada: true, albumId: albumSofiaDeportes.id, album: albumSofiaDeportes.nombre },
      { fotografoId: perfilSofia.id, urlImagen: 'https://via.placeholder.com/800x600/95E1D3/FFFFFF?text=Retrato+2', descripcion: 'Retrato individual', orden: 3, destacada: false, albumId: albumSofiaRetratos.id, album: albumSofiaRetratos.nombre },
    ],
  });

  console.log(`✅ Creadas 9 imágenes de portafolio`);

  // 8. RESERVAS
  console.log('📅 Creando reservas...');

  const reserva1 = await prisma.reserva.create({
    data: {
      clienteId: cliente1.id,
      fotografoId: fotografo1.id,
      paqueteId: paquete1.id,
      fechaEvento: new Date('2024-12-15'),
      horaEvento: '15:00',
      ubicacionEvento: 'Salón Las Flores, La Paz',
      estado: EstadoReserva.CONFIRMADA,
      monto: 3500,
      moneda: Moneda.BOB,
      notas: 'Boda de María y Pedro. Ceremonia a las 15:00, recepción a las 18:00.',
    },
  });

  const reserva2 = await prisma.reserva.create({
    data: {
      clienteId: cliente2.id,
      fotografoId: fotografo2.id,
      paqueteId: paquete1.id + 2, // Paquete corporativo
      fechaEvento: new Date('2024-11-20'),
      horaEvento: '09:00',
      ubicacionEvento: 'Hotel Camino Real, Santa Cruz',
      estado: EstadoReserva.COMPLETADA,
      monto: 1200,
      moneda: Moneda.BOB,
      notas: 'Conferencia anual de empresa. Cobertura completa del evento.',
    },
  });

  const reserva3 = await prisma.reserva.create({
    data: {
      clienteId: cliente1.id,
      fotografoId: fotografo3.id,
      paqueteId: paquete1.id + 4, // Paquete retratos
      fechaEvento: new Date('2024-11-25'),
      horaEvento: '10:00',
      ubicacionEvento: 'Estudio Fotográfico, Cochabamba',
      estado: EstadoReserva.PENDIENTE,
      monto: 500,
      moneda: Moneda.BOB,
      notas: 'Sesión familiar para navidad.',
    },
  });

  console.log(`✅ Creadas 3 reservas`);

  // 9. RESEÑAS
  console.log('⭐ Creando reseñas...');

  await prisma.resena.create({
    data: {
      reservaId: reserva2.id,
      calificacion: 5,
      comentario: 'Excelente trabajo! Luis es muy profesional y las fotos quedaron perfectas. Totalmente recomendado.',
      publicadoPor: 'Carlos Mendoza',
      respuesta: 'Muchas gracias Carlos! Fue un placer trabajar en su evento.',
      visible: true,
    },
  });

  console.log(`✅ Creada 1 reseña`);

  console.log('\n✅ ¡Seed completado exitosamente!\n');
  console.log('📊 Resumen:');
  console.log('   - 6 usuarios (1 admin, 2 clientes, 3 fotógrafos)');
  console.log('   - 10 categorías');
  console.log('   - 3 perfiles de fotógrafos');
  console.log('   - 6 paquetes de servicios');
  console.log('   - 6 álbumes curados');
  console.log('   - 9 imágenes de portafolio');
  console.log('   - 3 reservas');
  console.log('   - 1 reseña');
  console.log('\n🔑 Credenciales de prueba:');
  console.log('   Admin: admin@fotografia.com / 123456');
  console.log('   Cliente: maria@email.com / 123456');
  console.log('   Fotógrafo: ana@fotografia.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
