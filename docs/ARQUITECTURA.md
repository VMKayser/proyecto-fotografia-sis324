# 🏗️ Arquitectura del Proyecto - Explicación Detallada

## 📚 Arquitectura en 3 Capas (Layered Architecture)

La arquitectura que te dieron se llama **Layered Architecture** o **Arquitectura en Capas**. Es un patrón arquitectónico muy usado en aplicaciones empresariales.

---

## 🎯 Capas Explicadas

### 1. **Capa de Presentación (Frontend)**
```
src/frontend/
├── components/          # Componentes React (botones, formularios, etc.)
├── interfaces/          # Tipos TypeScript
│   ├── IUser.ts
│   ├── IProfile.ts
│   └── IPackage.ts
├── models/             # Clases de dominio
│   ├── User.ts
│   ├── Profile.ts
│   └── Package.ts
├── services/           # Comunicación con API
│   ├── userService.ts
│   ├── profileService.ts
│   └── packageService.ts
└── repositories/       # Gestión de estado/caché
    ├── userRepository.ts
    ├── profileRepository.ts
    └── packageRepository.ts
```

**¿Qué hace cada subcapa?**

- **Interfaces**: Define los "contratos" (tipos TypeScript)
  ```typescript
  // interfaces/IUser.ts
  export interface IUser {
    id: number;
    nombreCompleto: string;
    email: string;
    rol: 'CLIENTE' | 'FOTOGRAFO';
  }
  ```

- **Models**: Clases con lógica de dominio
  ```typescript
  // models/User.ts
  export class User {
    constructor(
      public id: number,
      public nombreCompleto: string,
      public email: string
    ) {}
    
    getInitials(): string {
      return this.nombreCompleto.split(' ').map(n => n[0]).join('');
    }
  }
  ```

- **Services**: Llama a la API
  ```typescript
  // services/userService.ts
  export class UserService {
    async getUser(id: number): Promise<User> {
      const response = await fetch(`/api/users/${id}`);
      const data = await response.json();
      return new User(data.id, data.nombreCompleto, data.email);
    }
  }
  ```

- **Repositories**: Caché y gestión de estado
  ```typescript
  // repositories/userRepository.ts
  export class UserRepository {
    private cache = new Map<number, User>();
    
    async getUser(id: number): Promise<User> {
      if (this.cache.has(id)) {
        return this.cache.get(id)!;
      }
      const user = await userService.getUser(id);
      this.cache.set(id, user);
      return user;
    }
  }
  ```

---

### 2. **Capa de Lógica de Negocio (Backend)**

```
src/
├── app/api/            # Controllers (API Routes)
│   ├── users/
│   │   └── route.ts
│   ├── profiles/
│   │   └── route.ts
│   └── packages/
│       └── route.ts
├── services/           # Business Logic
│   ├── userService.ts
│   ├── profileService.ts
│   └── packageService.ts
├── repositories/       # Data Access
│   ├── userRepository.ts
│   ├── profileRepository.ts
│   └── packageRepository.ts
└── models/            # Types/Interfaces
    └── types.ts
```

**¿Qué hace cada subcapa?**

- **Controllers** (API Routes): Manejan HTTP
  ```typescript
  // app/api/users/route.ts
  import { NextRequest, NextResponse } from 'next/server';
  import { UserService } from '@/services/userService';
  
  export async function GET(request: NextRequest) {
    try {
      const users = await UserService.getAllUsers();
      return NextResponse.json({ success: true, data: users });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }
  ```

- **Services**: Lógica de negocio y CRUD
  ```typescript
  // services/userService.ts
  import { UserRepository } from '@/repositories/userRepository';
  import bcrypt from 'bcrypt';
  
  export class UserService {
    static async createUser(data: CreateUserDTO) {
      // Validaciones de negocio
      if (!this.isValidEmail(data.email)) {
        throw new Error('Email inválido');
      }
      
      // Hash de contraseña
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      // Crear usuario
      return UserRepository.create({
        ...data,
        passwordHash: hashedPassword
      });
    }
    
    static async getAllUsers() {
      return UserRepository.findAll();
    }
    
    private static isValidEmail(email: string): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
  }
  ```

- **Repositories**: Acceso a base de datos
  ```typescript
  // repositories/userRepository.ts
  import { prisma } from '@/lib/prisma';
  
  export class UserRepository {
    static async findAll() {
      return prisma.usuario.findMany({
        select: {
          id: true,
          nombreCompleto: true,
          email: true,
          rol: true,
          activo: true
        }
      });
    }
    
    static async findById(id: number) {
      return prisma.usuario.findUnique({
        where: { id },
        include: {
          perfilFotografo: true
        }
      });
    }
    
    static async create(data: any) {
      return prisma.usuario.create({
        data
      });
    }
  }
  ```

- **Models** (Prisma Schema): Define la estructura de BD
  ```prisma
  // prisma/schema.prisma
  model Usuario {
    id            Int       @id @default(autoincrement())
    nombreCompleto String   @map("nombre_completo")
    email         String    @unique
    passwordHash  String    @map("password_hash")
    rol           RolUsuario
    // ...
  }
  ```

---

### 3. **Capa de Datos (Database)**

```
MySQL Database
├── usuarios
├── perfiles_fotografos
├── categorias
├── fotografo_categorias
├── paquetes_servicios
├── portafolio_imagenes
├── reservas
└── resenas
```

---

## 🔄 Flujo de una Petición

Ejemplo: **Obtener lista de fotógrafos**

```
1. FRONTEND
   Usuario hace clic en "Ver Fotógrafos"
   ↓
   Component llama a → Repository
   
2. FRONTEND REPOSITORY
   UserRepository.getPhotographers()
   ↓
   Verifica caché → Si no hay, llama a Service
   
3. FRONTEND SERVICE
   UserService.getPhotographers()
   ↓
   Hace fetch a → /api/fotografos
   
4. BACKEND CONTROLLER (API Route)
   GET /api/fotografos/route.ts
   ↓
   Valida request → Llama a Service
   
5. BACKEND SERVICE
   ProfileService.getAllPhotographers()
   ↓
   Aplica lógica de negocio → Llama a Repository
   
6. BACKEND REPOSITORY
   ProfileRepository.findAllActive()
   ↓
   Ejecuta query Prisma → SELECT * FROM perfiles_fotografos
   
7. DATABASE
   MySQL ejecuta query
   ↓
   Retorna datos
   
8. RESPUESTA (camino inverso)
   Database → Repository → Service → Controller → HTTP Response
   ↓
   Frontend Service recibe JSON
   ↓
   Frontend Repository cachea
   ↓
   Component muestra datos
```

---

## 🎨 Ventajas de esta Arquitectura

### ✅ Separación de Responsabilidades
Cada capa tiene una función específica:
- **Controllers**: HTTP
- **Services**: Negocio
- **Repositories**: Datos

### ✅ Reutilización de Código
Un Service puede ser usado por múltiples Controllers

### ✅ Facilidad de Testing
Puedes testear cada capa independientemente:
```typescript
// Test de Service (sin BD)
test('UserService.createUser valida email', () => {
  expect(() => {
    UserService.createUser({ email: 'invalido' })
  }).toThrow('Email inválido');
});

// Test de Repository (con BD de prueba)
test('UserRepository.findById retorna usuario', async () => {
  const user = await UserRepository.findById(1);
  expect(user.email).toBe('test@example.com');
});
```

### ✅ Mantenibilidad
Si cambias de base de datos (MySQL → PostgreSQL), solo modificas Repositories

### ✅ Escalabilidad
Puedes mover capas a diferentes servidores si es necesario

---

## 🆚 Comparación con tu código actual

### ❌ Código Actual (Todo mezclado)
```javascript
// frontend/login.js
async function login() {
  // Lógica mezclada
  const user = localStorage.getItem('user');
  if (user) {
    const hashedPassword = sha256(password); // ❌ Negocio en frontend
    if (user.password === hashedPassword) { // ❌ Validación insegura
      window.location = 'dashboard.html';
    }
  }
}
```

### ✅ Código Nuevo (Arquitectura en Capas)

**Frontend Service:**
```typescript
// services/authService.ts
export class AuthService {
  static async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  }
}
```

**Backend Controller:**
```typescript
// app/api/auth/login/route.ts
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const result = await AuthService.login(email, password);
  return NextResponse.json(result);
}
```

**Backend Service:**
```typescript
// services/authService.ts
export class AuthService {
  static async login(email: string, password: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error('Usuario no encontrado');
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Contraseña incorrecta');
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
    return { token, user };
  }
}
```

**Backend Repository:**
```typescript
// repositories/userRepository.ts
export class UserRepository {
  static async findByEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email }
    });
  }
}
```

---

## 📊 Resumen Visual

```
┌──────────────────────────────────────────────────┐
│              USUARIO FINAL                       │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│  FRONTEND (React Components)                     │
│  ┌────────────────────────────────────────────┐ │
│  │ Repository (Caché) ←→ Service (API calls) │ │
│  │        ↑                      ↓            │ │
│  │    Interface            HTTP Request       │ │
│  └────────────────────────────────────────────┘ │
└────────────────┬─────────────────────────────────┘
                 │ HTTP
                 ▼
┌──────────────────────────────────────────────────┐
│  BACKEND (Next.js API)                           │
│  ┌────────────────────────────────────────────┐ │
│  │ Controller → Service → Repository         │ │
│  │    ↓            ↓           ↓             │ │
│  │   HTTP      Business     Prisma           │ │
│  └────────────────────────────────────────────┘ │
└────────────────┬─────────────────────────────────┘
                 │ SQL
                 ▼
┌──────────────────────────────────────────────────┐
│  DATABASE (MySQL)                                │
│  Tables: usuarios, perfiles_fotografos, etc.     │
└──────────────────────────────────────────────────┘
```

---

## 🎓 Conclusión

Esta arquitectura NO es Web Services (que sería SOAP/REST puro), es una **Layered Architecture** moderna usando:

1. **Next.js** como framework full-stack
2. **Prisma ORM** para acceso a datos
3. **MySQL** como base de datos
4. **Arquitectura en 3 capas** para organizar el código

Es la misma arquitectura que usan empresas grandes porque:
- ✅ Es escalable
- ✅ Es mantenible
- ✅ Es testeable
- ✅ Separa responsabilidades
- ✅ Facilita el trabajo en equipo

---

**¿Preguntas?** Revisa los ejemplos de código en cada sección.
