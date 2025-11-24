# 🚀 Instrucciones para Deployment de Apps Script

## ⚠️ PROBLEMA ACTUAL

El código de Apps Script ha sido actualizado pero **la URL que estás usando apunta a una versión antigua**. Por eso:
- ❌ No se muestran los fotógrafos en resultados.html
- ❌ El endpoint de profiles retorna "Moved Temporarily" (302 redirect)

## ✅ SOLUCIÓN: Crear Nuevo Deployment

### Paso 1: Ir a Apps Script Editor

1. Abre tu proyecto de Apps Script en: https://script.google.com
2. Busca el proyecto que contiene el código de tu backend (Spreadsheet ID: `1ZNi0Ur30YsROXx9-hUNRzcIeYHBL__Bm0XVc2NZssE4`)

### Paso 2: Verificar que todos los archivos estén actualizados

Asegúrate de que estos archivos existan en tu proyecto Apps Script:

- ✅ `Code.gs` (router principal)
- ✅ `controllers/Users.gs`
- ✅ `controllers/Profiles.gs` ⭐ **ESTE ES NUEVO**
- ✅ `controllers/Categories.gs`
- ✅ `controllers/PhotographerCategories.gs`
- ✅ `controllers/Packages.gs`
- ✅ `controllers/Portfolio.gs`
- ✅ `controllers/Reservations.gs`
- ✅ `controllers/Reviews.gs`
- ✅ `controllers/Seed.gs`
- ✅ `services/SheetsService.gs`
- ✅ `utils/HashUtils.gs`

### Paso 3: Crear Nuevo Deployment

1. En el editor de Apps Script, haz clic en el botón **"Deploy"** (Implementar) en la parte superior derecha
2. Selecciona **"New deployment"** (Nueva implementación)
3. En "Select type" (Tipo), elige **"Web app"** (Aplicación web)
4. Configuración:
   - **Description**: "Backend con ProfilesController - v2"
   - **Execute as**: "Me" (tú)
   - **Who has access**: "Anyone" (Cualquiera)
5. Haz clic en **"Deploy"** (Implementar)
6. **IMPORTANTE**: Copia la nueva URL que te da. Será algo como:
   ```
   https://script.google.com/macros/s/NUEVA_ID_DIFERENTE/exec
   ```

### Paso 4: Actualizar Frontend

Una vez que tengas la nueva URL, actualiza el archivo:

**Archivo**: `src/frontend/services/sheetsService.js`

**Línea 13**, cambia:
```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwfo7HwzW3HnR63k-CTfn-XzUoXEB3upjUSbuZvw08xOlfsoHwiCowVRLDN69_lubsGJg/exec';
```

Por:
```javascript
const APPS_SCRIPT_URL = 'TU_NUEVA_URL_AQUI';
```

### Paso 5: Probar

Prueba que el nuevo deployment funcione:

```bash
# Test login
curl -sS 'TU_NUEVA_URL?resource=users&action=login&key=projfot_demo_7f3b9c2a&email=lucia.vargas@example.com&password=password123&callback=test' | head -c 400

# Test profiles list
curl -sS 'TU_NUEVA_URL?resource=profiles&action=list&key=projfot_demo_7f3b9c2a&callback=test' | head -c 800
```

Deberías ver:
- ✅ Login: `test({"success":true,"data":{"id":"usu_002",...}})`
- ✅ Profiles: `test({"success":true,"data":[{...},...]})`

### Paso 6: Recargar Frontend

1. Recarga la página http://localhost:8000/resultados.html
2. Abre la consola del navegador (F12)
3. Deberías ver:
   ```
   [resultados.js] Cargando fotógrafos desde API...
   [resultados.js] Response: {success: true, data: Array(X)}
   [resultados.js] Fotógrafos cargados: X
   ```

## 🔍 Cómo verificar que el deployment está actualizado

Ejecuta este comando con la nueva URL:

```bash
curl -sS 'TU_NUEVA_URL?resource=profiles&action=list&key=projfot_demo_7f3b9c2a'
```

Si ves `{"success":true,"data":[...]}` con datos, ¡funciona! ✅

Si ves HTML o "Moved Temporarily", necesitas crear otro deployment. ❌

## 📝 Notas

- Cada vez que cambies el código de Apps Script, debes crear un **nuevo deployment**
- La URL vieja seguirá apuntando al código viejo
- Puedes tener múltiples deployments activos al mismo tiempo
- Para testing, puedes usar la URL de "Test deployment" (aparece al lado de Deploy)

## 🆘 Si sigues teniendo problemas

1. Verifica que `ProfilesController` esté definido en `controllers/Profiles.gs`
2. Asegúrate de que el archivo esté guardado en Apps Script (Ctrl+S)
3. En Apps Script, ve a "Executions" (Ejecuciones) para ver errores en tiempo real
4. Comparte la nueva URL conmigo para que pueda ayudarte a probar

---

**Última URL conocida (ANTIGUA - NO USAR):**
```
https://script.google.com/macros/s/AKfycbwfo7HwzW3HnR63k-CTfn-XzUoXEB3upjUSbuZvw08xOlfsoHwiCowVRLDN69_lubsGJg/exec
```

**Nueva URL (actualizar después del deployment):**
```
[PENDIENTE - actualizar aquí cuando hagas el deployment]
```
