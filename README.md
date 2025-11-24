# 📸 Proyecto Fotografía - Marketplace

> **SIS324 - Ingeniería de Software | Grupo 16**

Plataforma web para conectar fotógrafos profesionales con clientes.

## 🚀 Inicio Rápido

```bash
# 1. Clonar repositorio
git clone <url>
cd proyecto_fotografia

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Levantar base de datos (MySQL + PHPMyAdmin)
docker-compose up -d

# 5. Crear tablas en MySQL
npx prisma generate
npx prisma migrate dev --name init

# 6. Iniciar aplicación
npm run dev
```

### 🔁 Script "todo en uno"

Si prefieres automatizar los pasos anteriores, usa el script `scripts/levantar.sh`:

```bash
chmod +x scripts/levantar.sh   # solo la primera vez
./scripts/levantar.sh          # instala deps, levanta Docker, aplica migraciones y ejecuta npm run dev
```

Opcionalmente puedes omitir el seed si ya tienes datos cargados:

```bash
./scripts/levantar.sh --skip-seed
```

Abre [http://localhost:3000](http://localhost:3000)

## 📚 Documentación

Toda la documentación está en la carpeta `docs/`:

- **[ARQUITECTURA.md](./docs/ARQUITECTURA.md)** - Explicación de la arquitectura en capas
- **[DATABASE.md](./docs/DATABASE.md)** - Documentación de la base de datos MySQL
- **[README.md](./docs/README.md)** - Documentación completa del proyecto

## 🏗️ Estructura del Proyecto

```
proyecto_fotografia/
├── docs/                    # 📚 Documentación
├── prisma/                  # 🗄️ Schema de base de datos
├── src/
│   ├── app/                # 🎯 Next.js App Router
│   │   ├── api/           # Controllers (Backend)
│   │   └── ...            # Páginas (Frontend)
│   ├── components/        # ⚛️ Componentes React
│   ├── services/          # 💼 Business Logic (Backend)
│   ├── repositories/      # 🗃️ Data Access (Backend)
│   ├── lib/              # 🛠️ Utilidades
│   └── types/            # 📝 TypeScript types
├── backend/
│   └── apps_script/      # 📊 Respaldo Google Sheets (opcional)
└── public/               # 🖼️ Assets estáticos
```

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React + Next.js 14 + TypeScript + Tailwind CSS |
| **Backend** | Next.js API Routes + TypeScript |
| **ORM** | Prisma |
| **Base de Datos** | MySQL 8.0 |
| **Autenticación** | JWT + Bcrypt |
| **Deploy** | Vercel (App) + PlanetScale/Railway (DB) |

## 🎯 Características

✅ Sistema de autenticación (JWT)  
✅ Perfiles de fotógrafos con portafolio  
✅ Gestión de paquetes de servicios  
✅ Sistema de reservas  
✅ Reseñas y calificaciones  
✅ Búsqueda por categorías  
✅ Dashboard para fotógrafos  

## � Métricas del Dashboard

La tarjeta "Marketplace" del dashboard y las estadísticas del hero en la home usan el endpoint `GET /api/dashboard`, que ejecuta agregaciones en la misma base de datos MySQL:

- **Fotógrafos verificados** → `perfilFotografo.count({ where: { verificado: true } })`
- **Eventos cubiertos** → `reserva.count({ where: { estado: 'COMPLETADA' } })`
- **Clientes felices** → `perfilFotografo.aggregate({ _avg: { calificacionPromedio: true } })`

En entornos con poco tráfico se consulta en tiempo real. Para producción puedes cachear la respuesta durante 5 minutos (Edge cache, Redis o `revalidateTag`) y mantener los números alineados con la BD sin recurrir a valores ficticios.

## �📦 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Iniciar en producción
npm run lint         # Linter

# Base de datos
npm run db:generate  # Generar cliente Prisma
npm run db:migrate   # Crear migración
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Poblar datos de prueba
```

## 👥 Equipo - Grupo 16

Universidad: [Tu Universidad]  
Materia: SIS324 - Ingeniería de Software  
Semestre: Sexto Semestre - 2025

## 📄 Licencia

Proyecto académico - SIS324

---

Para más información, revisa la [documentación completa](./docs/README.md).

<!-- Deploy a Vercel -->
