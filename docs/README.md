# 📸 Proyecto Fotografía - Marketplace de Fotógrafos

> **SIS324 - Ingeniería de Software | Grupo 16**  
> Plataforma para conectar fotógrafos con clientes

---

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Uso](#uso)
- [Base de Datos](#base-de-datos)
- [API](#api)
- [Despliegue](#despliegue)

---

## 📖 Descripción

Marketplace web que permite a fotógrafos crear perfiles profesionales, mostrar portafolios y ofrecer paquetes de servicios. Los clientes pueden buscar fotógrafos, ver sus trabajos, reservar servicios y dejar reseñas.

### Funcionalidades Principales

#### Para Fotógrafos 📷
- ✅ Registro y perfil profesional
- ✅ Gestión de portafolio (subida de imágenes)
- ✅ Creación de paquetes de servicios
- ✅ Gestión de reservas
- ✅ Dashboard con estadísticas
- ✅ Respuesta a reseñas

#### Para Clientes 👥
- ✅ Búsqueda de fotógrafos por categoría
- ✅ Vista de portafolios
- ✅ Reserva de servicios
- ✅ Sistema de reseñas y calificaciones
- ✅ Historial de reservas

---

## 🏗️ Arquitectura

Este proyecto usa **Arquitectura en 3 Capas (Layered Architecture)**:

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Components (UI)                                   │ │
│  │ ├─ Interfaces (TypeScript types)                 │ │
│  │ ├─ Services (API communication)                  │ │
│  │ ├─ Repositories (Data fetching/caching)          │ │
│  │ └─ Models (Domain entities)                      │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTP/REST
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Next.js API Routes)               │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Controllers (API Routes)                          │ │
│  │ └─ src/app/api/*                                  │ │
│  ├───────────────────────────────────────────────────┤ │
│  │ Services (Business Logic)                         │ │
│  │ └─ src/services/*                                 │ │
│  ├───────────────────────────────────────────────────┤ │
│  │ Repositories (Data Access)                        │ │
│  │ └─ src/repositories/*                             │ │
│  ├───────────────────────────────────────────────────┤ │
│  │ Models (Prisma Schema)                            │ │
│  │ └─ prisma/schema.prisma                           │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↕ Prisma ORM
┌─────────────────────────────────────────────────────────┐
│                   DATABASE (MySQL)                      │
│  Tables: usuarios, perfiles_fotografos, categorias,    │
│  paquetes_servicios, reservas, resenas, etc.            │
└─────────────────────────────────────────────────────────┘
```

### Capas del Backend

1. **Controllers** (`src/app/api/*`)
   - Manejan las peticiones HTTP
   - Validan entrada
   - Retornan respuestas JSON

2. **Services** (`src/services/*`)
   - Lógica de negocio
   - Operaciones CRUD
   - Validaciones de negocio

3. **Repositories** (`src/repositories/*`)
   - Acceso a datos
   - Queries a la BD usando Prisma
   - Abstracción de la capa de datos

4. **Models** (`prisma/schema.prisma`)
   - Definición de entidades
   - Relaciones entre tablas
   - Tipos de datos

### Capas del Frontend

1. **Components** - Componentes React
2. **Interfaces** - Tipos TypeScript
3. **Services** - Llamadas a la API
4. **Repositories** - Gestión de estado/caché
5. **Models** - Clases de dominio

---

## 🛠️ Tecnologías

### Backend
- **Next.js 14+** - Framework full-stack React
- **Prisma ORM** - ORM para MySQL
- **MySQL 8.0** - Base de datos relacional
- **TypeScript** - Tipado estático
- **Bcrypt** - Hashing de contraseñas
- **JWT** - Autenticación

### Frontend
- **React 18** - Librería UI
- **Next.js App Router** - Routing
- **Tailwind CSS** - Estilos
- **TypeScript** - Tipado estático

### DevOps
- **Docker** - Contenedores
- **Docker Compose** - Orquestación
- **Git** - Control de versiones

### Opcionales
- **Google Apps Script** - Respaldo de datos (Google Sheets)
- **Cloudinary/AWS S3** - Almacenamiento de imágenes

---

## 🚀 Instalación

### Prerrequisitos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **Docker** ([Descargar](https://www.docker.com/))
- **Git** ([Descargar](https://git-scm.com/))

### Paso 1: Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd proyecto_fotografia
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
DATABASE_URL="mysql://foto_user:foto_pass@localhost:3306/fotografia_db"
JWT_SECRET="tu_secret_super_seguro_min_32_caracteres"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

### Paso 4: Levantar MySQL con Docker

```bash
docker-compose up -d
```

Esto levantará:
- MySQL en `localhost:3306`
- PHPMyAdmin en `http://localhost:8080`

### Paso 5: Crear la base de datos con Prisma

```bash
# Generar cliente de Prisma
npx prisma generate

# Crear las tablas en MySQL
npx prisma migrate dev --name init

# (Opcional) Poblar con datos de prueba
npx prisma db seed
```

### Paso 6: Ejecutar el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 💻 Uso

### Acceso a PHPMyAdmin

```
URL: http://localhost:8080
Usuario: foto_user
Contraseña: foto_pass
```

### Acceso a Prisma Studio

```bash
npx prisma studio
```

Abre [http://localhost:5555](http://localhost:5555)

### Usuarios de Prueba

Después del seed, tendrás estos usuarios:

**Fotógrafo:**
```
Email: lucia.vargas@example.com
Password: password123
```

**Cliente:**
```
Email: juan.perez@example.com
Password: password123
```

---

## 🗄️ Base de Datos

### Entidades Principales

- **Usuario** - Usuarios del sistema (clientes y fotógrafos)
- **PerfilFotografo** - Información extendida de fotógrafos
- **Categoria** - Categorías de servicios (Bodas, Eventos, etc.)
- **Paquete** - Paquetes de servicios que ofrece cada fotógrafo
- **PortafolioImagen** - Imágenes del portafolio
- **Reserva** - Reservas de servicios
- **Resena** - Reseñas y calificaciones

Ver documentación completa en [DATABASE.md](./DATABASE.md)

### Comandos Útiles

```bash
# Ver estado de migraciones
npx prisma migrate status

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Reset completo (⚠️ borra datos)
npx prisma migrate reset

# Aplicar migraciones en producción
npx prisma migrate deploy
```

---

## 🔌 API

### Endpoints Principales

#### Autenticación
```
POST /api/auth/register - Registrar usuario
POST /api/auth/login - Iniciar sesión
POST /api/auth/logout - Cerrar sesión
GET  /api/auth/me - Obtener usuario actual
```

#### Usuarios
```
GET    /api/users - Listar usuarios
GET    /api/users/:id - Obtener usuario
PUT    /api/users/:id - Actualizar usuario
DELETE /api/users/:id - Eliminar usuario
```

#### Fotógrafos
```
GET    /api/fotografos - Listar fotógrafos
GET    /api/fotografos/:id - Obtener perfil
PUT    /api/fotografos/:id - Actualizar perfil
GET    /api/fotografos/:id/paquetes - Paquetes del fotógrafo
```

#### Paquetes
```
GET    /api/paquetes - Listar paquetes
GET    /api/paquetes/:id - Obtener paquete
POST   /api/paquetes - Crear paquete
PUT    /api/paquetes/:id - Actualizar paquete
DELETE /api/paquetes/:id - Eliminar paquete
```

#### Reservas
```
GET    /api/reservas - Listar reservas
GET    /api/reservas/:id - Obtener reserva
POST   /api/reservas - Crear reserva
PUT    /api/reservas/:id - Actualizar reserva
DELETE /api/reservas/:id - Cancelar reserva
```

#### Reseñas
```
GET    /api/resenas - Listar reseñas
POST   /api/resenas - Crear reseña
PUT    /api/resenas/:id - Actualizar reseña
DELETE /api/resenas/:id - Eliminar reseña
```

Ver documentación completa de la API en `/docs/api.md` (próximamente)

---

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build para producción
npm run start        # Iniciar en producción
npm run lint         # Ejecutar linter

# Base de datos
npm run db:generate  # Generar cliente Prisma
npm run db:migrate   # Crear migración
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Poblar con datos de prueba
npm run db:reset     # Reset completo de BD

# Docker
docker-compose up -d    # Levantar MySQL
docker-compose down     # Detener MySQL
docker-compose logs -f  # Ver logs
```

---

## 🚢 Despliegue

### Opción 1: Vercel (Recomendado)

1. Push a GitHub
2. Conectar con Vercel
3. Configurar variables de entorno
4. Deploy automático

### Opción 2: VPS (Ubuntu)

```bash
# En el servidor
git clone <repo>
cd proyecto_fotografia
npm install
npm run build
pm2 start npm --name "fotografia" -- start
```

### Base de Datos en Producción

Opciones:
- **PlanetScale** (MySQL serverless)
- **AWS RDS**
- **Railway**
- **DigitalOcean Managed Databases**

---

## 📁 Estructura del Proyecto

```
proyecto_fotografia/
├── prisma/
│   ├── schema.prisma        # Schema de base de datos
│   └── migrations/          # Migraciones
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API Routes (Controllers)
│   │   ├── (auth)/         # Páginas de autenticación
│   │   ├── dashboard/      # Dashboard
│   │   └── perfil/         # Perfiles
│   ├── components/         # Componentes React
│   ├── services/           # Business Logic (Backend)
│   ├── repositories/       # Data Access (Backend)
│   ├── lib/                # Utilidades
│   └── types/              # TypeScript types
├── public/                 # Assets estáticos
├── backend/
│   └── apps_script/        # Respaldo en Google Sheets
├── docker-compose.yml      # Configuración Docker
├── .env.example            # Variables de entorno ejemplo
├── DATABASE.md             # Documentación de BD
└── README.md               # Este archivo
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es parte de un trabajo académico para SIS324 - Ingeniería de Software.

---

## 👥 Equipo

**Grupo 16**
- Universidad: [Tu Universidad]
- Materia: SIS324 - Ingeniería de Software
- Semestre: Sexto Semestre
- Año: 2025

---

## 📞 Soporte

Para preguntas o problemas:
- Abrir un issue en GitHub
- Contactar al equipo

---

**Última actualización:** Noviembre 2025
