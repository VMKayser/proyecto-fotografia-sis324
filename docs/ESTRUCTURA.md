# 🏗️ Guía de Estructura del Proyecto - ACTUALIZADA

## 📁 Estructura CORRECTA (Reorganizada)

```
proyecto_fotografia/
│
├── 📚 docs/                           # DOCUMENTACIÓN
│   ├── README.md                     # Documentación completa
│   ├── DATABASE.md                   # Documentación de BD
│   ├── ARQUITECTURA.md               # Explicación de arquitectura
│   ├── ESTRUCTURA.md                 # ⭐ Este archivo - Guía de estructura
│   └── INSTRUCCIONES_DEPLOYMENT.md
│
├── 🗄️ prisma/                         # BASE DE DATOS
│   ├── schema.prisma                 # ✅ Schema MySQL (8 entidades)
│   └── migrations/                   # Migraciones de BD
│
├── 💻 src/                            # ===== CÓDIGO FUENTE =====
│   │
│   ├── 🔧 backend/                   # 🎯 TODO EL BACKEND
│   │   │
│   │   ├── services/                 # 💼 CAPA: Business Logic
│   │   │   ├── authService.ts       # ✅ Autenticación (Login, Register, JWT)
│   │   │   ├── userService.ts       # ✅ Lógica de usuarios
│   │   │   └── index.ts             # Exportaciones
│   │   │
│   │   ├── repositories/             # 🗃️ CAPA: Data Access
│   │   │   ├── userRepository.ts    # ✅ Queries de usuarios (Prisma)
│   │   │   ├── profileRepository.ts # ✅ Queries de perfiles
│   │   │   ├── packageRepository.ts # ✅ Queries de paquetes
│   │   │   ├── reservationRepository.ts # ✅ Queries de reservas
│   │   │   └── index.ts             # Exportaciones
│   │   │
│   │   ├── types/                    # � TypeScript Types (Backend)
│   │   │   └── index.ts             # ✅ DTOs, Interfaces, Response types
│   │   │
│   │   └── lib/                      # 🛠️ Utilidades del Backend
│   │       └── prisma.ts            # ✅ Cliente Prisma (singleton)
│   │
│   ├── 🎨 frontend/                  # 🌟 TODO EL FRONTEND
│   │   │
│   │   ├── components/               # ⚛️ Componentes React
│   │   │   ├── ui/                  # Componentes de UI reutilizables
│   │   │   ├── auth/                # Componentes de autenticación
│   │   │   ├── fotografo/           # Componentes específicos de fotógrafos
│   │   │   └── cliente/             # Componentes específicos de clientes
│   │   │
│   │   ├── services/                 # 📡 CAPA: API Communication
│   │   │   └── (llamadas HTTP a la API backend)
│   │   │
│   │   ├── repositories/             # 💾 CAPA: State Management/Cache
│   │   │   └── (gestión de estado y caché)
│   │   │
│   │   ├── models/                   # 🏗️ CAPA: Domain Models
│   │   │   └── (clases con lógica de dominio)
│   │   │
│   │   └── interfaces/               # 📋 TypeScript Interfaces (Frontend)
│   │       └── (tipos específicos del frontend)
│   │
│   └── 🌐 app/                       # Next.js App Router
│       │
│       ├── api/                     # 🎯 CAPA: Controllers (API Routes)
│       │   └── auth/                # Endpoints de autenticación
│       │       ├── register/route.ts # ✅ POST /api/auth/register
│       │       ├── login/route.ts    # ✅ POST /api/auth/login
│       │       └── me/route.ts       # ✅ GET /api/auth/me
│       │
│       ├── (auth)/                   # 📄 Páginas de autenticación
│       │   ├── login/               # Página de login
│       │   └── registro/            # Página de registro
│       │
│       ├── dashboard/                # � Dashboard del fotógrafo
│       ├── perfil/                   # 👤 Perfiles de usuarios
│       ├── layout.tsx                # Layout principal
│       └── page.tsx                  # Página de inicio
│
├── 📊 backend/                        # Respaldo Google Sheets (Opcional)
│   └── apps_script/                  # Scripts de Apps Script
│       ├── Code.gs
│       ├── Controllers.gs
│       └── ... (otros archivos .gs)
│
├── 🖼️ public/                         # Assets estáticos
│   └── (imágenes, iconos, etc.)
│
└── ⚙️ Archivos de Configuración
    ├── .env                          # 🔐 Variables de entorno (NO subir a Git)
    ├── .env.example                  # ✅ Ejemplo de variables
    ├── .gitignore                    # ✅ Archivos ignorados por Git
    ├── docker-compose.yml            # ✅ 🐳 MySQL + PHPMyAdmin
    ├── package.json                  # ✅ Dependencias npm
    ├── tsconfig.json                 # ✅ Configuración TypeScript
    ├── next.config.js                # ✅ Configuración Next.js
    └── README.md                     # ✅ Documentación principal
```

---

## 🎯 Separación Backend / Frontend

### ✅ **BACKEND** (`src/backend/`)

Toda la lógica del servidor:

1. **Services** - Lógica de negocio
   ```typescript
   // src/backend/services/authService.ts
   export class AuthService {
     static async login(data: LoginDTO) {
       // Validaciones, bcrypt, JWT
     }
   }
   ```

2. **Repositories** - Acceso a BD
   ```typescript
   // src/backend/repositories/userRepository.ts
   export class UserRepository {
     static async findByEmail(email: string) {
       return prisma.usuario.findUnique({ where: { email } });
     }
   }
   ```

3. **Types** - DTOs e interfaces compartidas
4. **Lib** - Utilidades (Prisma client, helpers)

### ✅ **FRONTEND** (`src/frontend/`)

Toda la lógica del cliente:

1. **Components** - Componentes React
2. **Services** - Llamadas a la API
3. **Repositories** - Gestión de estado/caché
4. **Models** - Clases de dominio
5. **Interfaces** - Tipos TypeScript

### ✅ **API ROUTES** (`src/app/api/`)

Controllers que conectan Frontend ↔ Backend:

```typescript
// src/app/api/auth/login/route.ts
import { AuthService } from '@/backend/services';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await AuthService.login(body); // ← Llama al backend
  return NextResponse.json(result);
}
```

---

## 🔄 Flujo Completo de una Petición

```
1. 🎨 FRONTEND (React Component)
   └─ Botón "Login" presionado
   
2. 📡 FRONTEND SERVICE
   └─ fetch('/api/auth/login', { method: 'POST', body: {...} })
   
3. 🌐 CONTROLLER (API Route)
   └─ POST /api/auth/login/route.ts
       └─ Valida entrada
       
4. 💼 BACKEND SERVICE
   └─ AuthService.login(data)
       └─ Valida credenciales
       └─ Genera JWT
       
5. 🗃️ BACKEND REPOSITORY
   └─ UserRepository.findByEmail(email)
       └─ prisma.usuario.findUnique()
       
6. 🗄️ DATABASE (MySQL)
   └─ SELECT * FROM usuarios WHERE email = ?
   
7. ⬅️ RESPUESTA
   └─ DB → Repository → Service → Controller → Frontend
```

---

## � Imports Actualizados

### Backend

```typescript
// Importar desde backend
import { AuthService } from '@/backend/services';
import { UserRepository } from '@/backend/repositories';
import { CreateUsuarioDTO } from '@/backend/types';
import { prisma } from '@/backend/lib/prisma';
```

### Frontend

```typescript
// Importar desde frontend
import { Button } from '@/frontend/components/ui/button';
import { AuthRepository } from '@/frontend/repositories/authRepository';
import { IUser } from '@/frontend/interfaces';
```

### API Routes (Controllers)

```typescript
// API Routes importan del backend
import { AuthService } from '@/backend/services';
import { NextRequest, NextResponse } from 'next/server';
```

---

## ✅ Archivos Completados

### Backend
- ✅ `src/backend/services/authService.ts`
- ✅ `src/backend/services/userService.ts`
- ✅ `src/backend/repositories/userRepository.ts`
- ✅ `src/backend/repositories/profileRepository.ts`
- ✅ `src/backend/repositories/packageRepository.ts`
- ✅ `src/backend/repositories/reservationRepository.ts`
- ✅ `src/backend/types/index.ts`
- ✅ `src/backend/lib/prisma.ts`

### Controllers
- ✅ `src/app/api/auth/register/route.ts`
- ✅ `src/app/api/auth/login/route.ts`
- ✅ `src/app/api/auth/me/route.ts`

### Configuración
- ✅ `package.json`
- ✅ `tsconfig.json` (con paths actualizados)
- ✅ `next.config.js`
- ✅ `docker-compose.yml`
- ✅ `prisma/schema.prisma`


---

## � Por Completar

### Backend
- [ ] Más API Routes (users, profiles, packages, reservations)
- [ ] Más Services (ProfileService, PackageService, etc.)
- [ ] Middleware de autenticación

### Frontend
- [ ] Componentes React
- [ ] Frontend Services (API calls)
- [ ] Frontend Repositories (state management)
- [ ] Frontend Models
- [ ] Páginas de la aplicación

---

## 🚀 Siguientes Pasos

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Levantar MySQL**
   ```bash
   docker-compose up -d
   ```

3. **Crear base de datos**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Iniciar desarrollo**
   ```bash
   npm run dev
   ```

---

## ❓ Preguntas Frecuentes

### ¿Por qué Backend y Frontend separados?
- **Claridad:** Cada desarrollador sabe dónde trabajar
- **Organización:** Fácil encontrar código
- **Arquitectura:** Cumple con las 3 capas pedidas

### ¿Por qué API Routes en src/app/api?
- **Next.js lo requiere:** File-based routing
- **Controllers:** Los API Routes son los Controllers
- **Importan del backend:** Separan responsabilidades

### ¿Dónde está Google Sheets?
- **backend/apps_script:** Respaldo opcional
- **MySQL es principal:** Como lo pediste

---

**Última actualización:** 13 de Noviembre de 2025  
**Estado:** ✅ Estructura reorganizada y limpia
