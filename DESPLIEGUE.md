# 🚀 GUÍA DE DESPLIEGUE EN VERCEL

## Sistema de Gestión de Servicios Fotográficos

---

## 📋 PRE-REQUISITOS

1. ✅ Cuenta en [Vercel](https://vercel.com)
2. ✅ Cuenta en [PlanetScale](https://planetscale.com) (Base de datos MySQL)
3. ✅ Cuenta en [GitHub](https://github.com)
4. ✅ Código fuente en repositorio Git

---

## 🗄️ PASO 1: CONFIGURAR BASE DE DATOS (PlanetScale)

### Opción A: PlanetScale (Recomendado - Gratis)

1. **Crear cuenta en PlanetScale**
   - Ve a https://planetscale.com
   - Crea cuenta gratuita

2. **Crear base de datos**
   ```
   Nombre: fotografia-prod
   Región: US East (o la más cercana)
   ```

3. **Obtener URL de conexión**
   - Click en "Connect"
   - Selecciona "Prisma" como framework
   - Copia la DATABASE_URL
   - Ejemplo: `mysql://user:pass@aws.connect.psdb.cloud/fotografia-prod?sslaccept=strict`

4. **Aplicar schema**
   ```bash
   # En tu terminal local con la URL de PlanetScale
   DATABASE_URL="tu_url_de_planetscale" npx prisma db push
   ```

### Opción B: Railway (Alternativa)

1. Ve a https://railway.app
2. Crea un nuevo proyecto MySQL
3. Copia la DATABASE_URL
4. Aplica el schema con `prisma db push`

---

## 📦 PASO 2: SUBIR CÓDIGO A GITHUB

```bash
# 1. Inicializar Git (si no está inicializado)
git init

# 2. Agregar archivos
git add .

# 3. Hacer commit
git commit -m "Initial commit - Sistema de fotografía"

# 4. Cambiar a rama main
git branch -M main

# 5. Conectar con GitHub
# Primero crea un repo en https://github.com/new
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# 6. Subir código
git push -u origin main
```

---

## 🌐 PASO 3: DESPLEGAR EN VERCEL

### Método 1: Desde la web (Recomendado)

1. **Ir a Vercel**
   - Ve a https://vercel.com
   - Inicia sesión con GitHub

2. **Importar proyecto**
   - Click en "Add New" → "Project"
   - Selecciona tu repositorio de GitHub
   - Click en "Import"

3. **Configurar proyecto**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Configurar Variables de Entorno**
   
   En "Environment Variables" agrega:
   
   ```
   DATABASE_URL = mysql://user:pass@host/db?sslaccept=strict
   JWT_SECRET = tu_secret_super_seguro_de_32_caracteres_minimo
   JWT_EXPIRES_IN = 7d
   BCRYPT_ROUNDS = 10
   NODE_ENV = production
   NEXT_PUBLIC_API_URL = https://tu-proyecto.vercel.app/api
   NEXT_PUBLIC_BASE_URL = https://tu-proyecto.vercel.app
   ```

5. **Deploy**
   - Click en "Deploy"
   - Espera 2-3 minutos

### Método 2: Desde CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Configurar variables de entorno
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NEXT_PUBLIC_API_URL

# 5. Deploy a producción
vercel --prod
```

---

## ⚙️ PASO 4: POST-DESPLIEGUE

### 1. Migrar Base de Datos

```bash
# Con la URL de producción configurada
DATABASE_URL="tu_url_planetscale" npx prisma db push
```

### 2. Crear Usuario Administrador

Opción A: Usar seed (si tienes seed.ts configurado)
```bash
DATABASE_URL="tu_url_planetscale" npx prisma db seed
```

Opción B: Manualmente desde tu app
- Ve a `/registro`
- Crea una cuenta
- Conéctate a la BD y cambia el rol manualmente a `ADMIN`

### 3. Verificar Funcionamiento

- ✅ Visita tu URL: `https://tu-proyecto.vercel.app`
- ✅ Prueba login/registro
- ✅ Verifica que las imágenes se suban correctamente
- ✅ Prueba todas las funcionalidades principales

---

## 📁 CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS

### Problema: Uploads en Vercel

⚠️ **Vercel es serverless**, los archivos subidos se pierden entre deploys.

### Soluciones:

#### Opción 1: Cloudinary (Recomendado)

1. Crea cuenta en https://cloudinary.com (gratis 25GB)
2. Obtén credenciales
3. Agrega a Vercel:
   ```
   CLOUDINARY_CLOUD_NAME = tu_cloud_name
   CLOUDINARY_API_KEY = tu_api_key
   CLOUDINARY_API_SECRET = tu_api_secret
   ```
4. Modifica `/api/upload` para usar Cloudinary

#### Opción 2: AWS S3

1. Crea bucket en S3
2. Configura variables:
   ```
   AWS_ACCESS_KEY_ID = tu_key
   AWS_SECRET_ACCESS_KEY = tu_secret
   AWS_REGION = us-east-1
   AWS_S3_BUCKET = fotografia-uploads
   ```

#### Opción 3: Vercel Blob (Nuevo)

1. Habilita Vercel Blob en tu dashboard
2. Usa `@vercel/blob` package
3. Documentación: https://vercel.com/docs/storage/vercel-blob

---

## 🔐 VARIABLES DE ENTORNO REQUERIDAS

### Mínimas (obligatorias):
```env
DATABASE_URL=mysql://...
JWT_SECRET=secret_muy_largo_y_seguro
NODE_ENV=production
```

### Recomendadas:
```env
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
NEXT_PUBLIC_API_URL=https://tu-app.vercel.app/api
NEXT_PUBLIC_BASE_URL=https://tu-app.vercel.app
```

### Opcionales (uploads en la nube):
```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 🔄 ACTUALIZACIONES CONTINUAS

Cada vez que hagas `git push` a `main`, Vercel desplegará automáticamente.

```bash
# Hacer cambios
git add .
git commit -m "Descripción del cambio"
git push origin main

# Vercel detecta y despliega automáticamente
```

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot connect to database"
- ✅ Verifica que DATABASE_URL sea correcta
- ✅ Asegúrate de incluir `?sslaccept=strict` para PlanetScale
- ✅ Revisa que la BD esté activa

### Error: "JWT malformed"
- ✅ Regenera JWT_SECRET (mínimo 32 caracteres)
- ✅ Verifica que esté en variables de entorno de Vercel

### Imágenes no se guardan
- ✅ Vercel es serverless, usa Cloudinary o AWS S3
- ✅ Configura variables de entorno de Cloudinary

### Build falla
```bash
# Prueba build local primero
npm run build

# Si falla, revisa errores en código
```

### Prisma errors
```bash
# Regenera cliente Prisma
npx prisma generate

# Aplica schema
DATABASE_URL="tu_url" npx prisma db push
```

---

## 📊 MONITOREO

### Logs en Vercel
1. Ve al dashboard de Vercel
2. Click en tu proyecto
3. Ve a "Deployments" → Click en el último deploy
4. Ve a "Functions" para ver logs

### Analytics
Vercel incluye analytics gratuito para:
- Visitas
- Errores
- Performance

---

## 💰 COSTOS

### Vercel (Free Tier)
- ✅ 100GB bandwidth/mes
- ✅ Serverless Functions
- ✅ Deploys ilimitados
- ✅ Custom domains

### PlanetScale (Hobby - Gratis)
- ✅ 10GB storage
- ✅ 1 billion row reads/mes
- ✅ 10 million row writes/mes

### Cloudinary (Free Tier)
- ✅ 25GB storage
- ✅ 25GB bandwidth/mes

**Total: $0 USD/mes** 🎉

---

## 🔗 RECURSOS ÚTILES

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PlanetScale Docs](https://planetscale.com/docs)
- [Prisma + PlanetScale](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-planetscale)
- [Cloudinary Docs](https://cloudinary.com/documentation)

---

## ✅ CHECKLIST FINAL

- [ ] Base de datos en PlanetScale/Railway creada
- [ ] Schema aplicado con `prisma db push`
- [ ] Código en GitHub
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] Usuario admin creado
- [ ] Uploads configurados (Cloudinary/S3)
- [ ] Todas las funcionalidades probadas
- [ ] Custom domain configurado (opcional)

---

**¡Listo para producción!** 🚀

**Fecha:** 24 de noviembre de 2025
**Versión:** 1.0
