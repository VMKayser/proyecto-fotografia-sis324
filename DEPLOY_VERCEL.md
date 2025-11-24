# 🚀 DESPLIEGUE RÁPIDO A VERCEL

## ✅ TODO LISTO PARA DESPLEGAR

### **YA CONFIGURADO:**
- ✅ Código en GitHub: https://github.com/VMKayser/proyecto-fotografia-sis324
- ✅ Base de datos en Railway (15+ tablas creadas)
- ✅ Cloudinary configurado (almacenamiento de imágenes)
- ✅ Variables de entorno preparadas

---

## 🌐 PASO 1: IMPORTAR EN VERCEL

1. **Ve a:** https://vercel.com
2. **Login** con tu cuenta de GitHub
3. **Click en "Add New"** → **"Project"**
4. **Selecciona:** `VMKayser/proyecto-fotografia-sis324`
5. **Click en "Import"**

---

## ⚙️ PASO 2: CONFIGURAR EL PROYECTO

### Configuración del Build:
```
Framework Preset: Next.js ✅ (detectado automáticamente)
Root Directory: ./ ✅
Build Command: npm run build ✅
Output Directory: .next ✅
Install Command: npm install ✅
```

**No cambies nada, está todo correcto.**

---

## 🔐 PASO 3: AGREGAR VARIABLES DE ENTORNO

En la sección **"Environment Variables"**, agrega estas **11 variables** (copia y pega cada una):

### 1. Base de Datos
```
Name: DATABASE_URL
Value: mysql://root:qgcgpgLLJEgSGpSXPoYbUnYFifsZGqGU@shuttle.proxy.rlwy.net:40556/railway
```

### 2-4. Seguridad
```
Name: JWT_SECRET
Value: proyecto_fotografia_sis324_secret_super_seguro_cambiar_en_produccion_2025
```

```
Name: JWT_EXPIRES_IN
Value: 7d
```

```
Name: BCRYPT_ROUNDS
Value: 10
```

### 5-6. URLs del Proyecto (IMPORTANTE: cambiar después del deploy)
```
Name: NEXT_PUBLIC_API_URL
Value: https://proyecto-fotografia-sis324.vercel.app/api
```

```
Name: NEXT_PUBLIC_BASE_URL
Value: https://proyecto-fotografia-sis324.vercel.app
```

**⚠️ NOTA:** Vercel te dará una URL diferente. Después del primer deploy, actualiza estas dos variables con tu URL real.

### 7-10. Cloudinary
```
Name: CLOUDINARY_CLOUD_NAME
Value: dpebumjn2
```

```
Name: CLOUDINARY_API_KEY
Value: 614822155246415
```

```
Name: CLOUDINARY_API_SECRET
Value: uKbPBRFVCKrYVCASPeOHBRwIC4A
```

```
Name: CLOUDINARY_URL
Value: cloudinary://614822155246415:uKbPBRFVCKrYVCASPeOHBRwIC4A@dpebumjn2
```

### 11. Entorno
```
Name: NODE_ENV
Value: production
```

---

## 🚀 PASO 4: DEPLOY

1. **Click en "Deploy"**
2. **Espera 2-3 minutos** (verás el progreso)
3. **¡Listo!** 🎉

---

## 📝 PASO 5: ACTUALIZAR URLs (IMPORTANTE)

Después del deploy, Vercel te dará una URL como:
```
https://proyecto-fotografia-sis324-vmkayser.vercel.app
```

**Actualiza estas 2 variables de entorno:**

1. Ve a tu proyecto en Vercel
2. Click en **"Settings"** → **"Environment Variables"**
3. Edita:
   - `NEXT_PUBLIC_API_URL` → `https://TU-URL.vercel.app/api`
   - `NEXT_PUBLIC_BASE_URL` → `https://TU-URL.vercel.app`
4. **Redeploy** (Vercel lo hace automáticamente)

---

## 👤 PASO 6: CREAR USUARIO ADMINISTRADOR

### Opción A: Desde la aplicación
1. Ve a `https://TU-URL.vercel.app/registro`
2. Crea una cuenta
3. Conéctate a Railway y ejecuta:
```sql
UPDATE usuarios SET rol = 'ADMIN' WHERE email = 'tu_email@example.com';
```

### Opción B: Seed (si configuraste seed.ts)
En tu terminal local:
```bash
DATABASE_URL="mysql://root:qgcgpgLLJEgSGpSXPoYbUnYFifsZGqGU@shuttle.proxy.rlwy.net:40556/railway" npx prisma db seed
```

---

## ✅ VERIFICACIÓN FINAL

Prueba estas funcionalidades:

1. ✅ **Registro/Login** → `/registro` y `/login`
2. ✅ **Admin Panel** → `/admin` (con usuario admin)
3. ✅ **Subir imagen** → Perfil de fotógrafo (debe subir a Cloudinary)
4. ✅ **Crear perfil** → Fotógrafo puede crear perfil
5. ✅ **Buscar fotógrafos** → Cliente puede buscar
6. ✅ **Crear reserva** → Sistema de reservas funciona

---

## 🎯 DOMINIO PERSONALIZADO (OPCIONAL)

Si tienes un dominio:

1. **Ve a Settings** → **Domains**
2. **Add Domain** → Escribe tu dominio
3. **Configura DNS** según instrucciones de Vercel
4. **Actualiza variables** `NEXT_PUBLIC_*` con tu dominio

---

## 🐛 TROUBLESHOOTING

### Error de conexión a BD
✅ Verifica que `DATABASE_URL` sea correcta
✅ Revisa que Railway esté activo

### Imágenes no se ven
✅ Verifica variables de Cloudinary
✅ Revisa console de navegador

### Error 500
✅ Ve a Vercel Dashboard → Functions → Logs
✅ Revisa errores en tiempo real

---

## 📊 COSTOS

- **Vercel:** $0/mes (plan Hobby)
- **Railway:** $5/mes después de 500 horas gratis
- **Cloudinary:** $0/mes (25GB gratis)

**Total:** ~$5 USD/mes (después del trial de Railway)

---

## 🎉 ¡LISTO!

Tu aplicación está en producción en:
**https://TU-URL.vercel.app**

**Próximos pasos:**
1. Probar todas las funcionalidades
2. Crear usuarios de prueba
3. Configurar dominio personalizado (opcional)
4. Monitorear logs en Vercel

---

**Fecha:** 24 de noviembre de 2025
**Repositorio:** https://github.com/VMKayser/proyecto-fotografia-sis324
