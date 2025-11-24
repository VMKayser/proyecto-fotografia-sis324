# 📋 CASOS DE USO - SISTEMA DE GESTIÓN DE SERVICIOS FOTOGRÁFICOS

## 🎯 Guía para Elaborar el Diagrama de Casos de Uso

---

## 1. ACTORES DEL SISTEMA

### 👤 Actor 1: CLIENTE
**Descripción:** Usuario que busca contratar servicios fotográficos
**Responsabilidades:**
- Buscar fotógrafos
- Hacer reservas
- Gestionar perfil personal
- Comunicarse con fotógrafos
- Calificar servicios

### 📸 Actor 2: FOTÓGRAFO
**Descripción:** Profesional que ofrece servicios fotográficos
**Responsabilidades:**
- Gestionar perfil profesional
- Publicar portafolio
- Ofrecer paquetes de servicios
- Atender reservas
- Comunicarse con clientes

### 👨‍💼 Actor 3: ADMINISTRADOR
**Descripción:** Gestor del sistema con permisos especiales
**Responsabilidades:**
- Verificar fotógrafos
- Aprobar solicitudes destacadas
- Configurar sistema de pagos
- Gestionar usuarios
- Supervisar plataforma

---

## 2. CASOS DE USO POR ACTOR

### 📱 CASOS DE USO - CLIENTE

#### CU-01: Registrarse en el Sistema
**Actor Principal:** Cliente
**Precondición:** Ninguna
**Flujo Principal:**
1. Cliente accede a la página de registro
2. Sistema muestra formulario de registro
3. Cliente ingresa: nombre completo, email, contraseña, teléfono
4. Cliente selecciona rol "Cliente"
5. Sistema valida datos
6. Sistema crea cuenta y envía email de confirmación
7. Cliente confirma email
8. Sistema habilita cuenta

**Postcondición:** Cliente registrado y activo en el sistema

#### CU-02: Iniciar Sesión
**Actor Principal:** Cliente
**Precondición:** Cuenta registrada y activa
**Flujo Principal:**
1. Cliente accede a página de login
2. Sistema muestra formulario
3. Cliente ingresa email y contraseña
4. Sistema valida credenciales
5. Sistema genera token JWT
6. Sistema redirige a dashboard

**Postcondición:** Cliente autenticado en el sistema

#### CU-03: Buscar Fotógrafos
**Actor Principal:** Cliente
**Precondición:** Sesión iniciada
**Flujo Principal:**
1. Cliente accede a búsqueda de fotógrafos
2. Sistema muestra filtros (categoría, ubicación, precio)
3. Cliente aplica filtros deseados
4. Sistema consulta base de datos
5. Sistema muestra resultados ordenados
6. Cliente visualiza perfiles destacados primero
7. Cliente puede ver detalles de cada fotógrafo

**Postcondición:** Lista de fotógrafos filtrada mostrada

#### CU-04: Ver Perfil de Fotógrafo
**Actor Principal:** Cliente
**Precondición:** Fotógrafo seleccionado
**Flujo Principal:**
1. Cliente selecciona un fotógrafo
2. Sistema carga perfil completo
3. Sistema muestra: bio, portafolio, paquetes, reseñas
4. Cliente visualiza galería de fotos
5. Cliente puede ver paquetes disponibles
6. Cliente puede leer reseñas de otros clientes

**Postcondición:** Perfil detallado del fotógrafo visualizado

#### CU-05: Realizar Reserva
**Actor Principal:** Cliente
**Precondición:** Perfil de fotógrafo visualizado
**Flujo Principal:**
1. Cliente selecciona paquete deseado
2. Sistema muestra formulario de reserva
3. Cliente ingresa: fecha evento, hora, ubicación
4. Cliente agrega notas adicionales
5. Sistema valida disponibilidad del fotógrafo
6. Cliente confirma reserva
7. Sistema crea reserva con estado PENDIENTE
8. Sistema envía notificación al fotógrafo
9. Sistema muestra confirmación al cliente

**Flujo Alternativo 5a:** Fecha no disponible
- Sistema muestra mensaje de error
- Sistema sugiere fechas alternativas

**Postcondición:** Reserva creada y notificada al fotógrafo

#### CU-06: Subir Comprobante de Pago
**Actor Principal:** Cliente
**Precondición:** Reserva confirmada por fotógrafo
**Flujo Principal:**
1. Cliente accede a "Mis Reservas"
2. Cliente selecciona reserva confirmada
3. Sistema muestra opción de subir comprobante
4. Cliente selecciona archivo (JPG, PNG, PDF)
5. Cliente opcionalmente agrega notas
6. Sistema valida archivo (formato, tamaño)
7. Sistema sube archivo a servidor
8. Sistema actualiza estado del comprobante a PENDIENTE
9. Sistema notifica al fotógrafo

**Postcondición:** Comprobante subido y en revisión

#### CU-07: Cancelar Reserva
**Actor Principal:** Cliente
**Precondición:** Reserva existente no completada
**Flujo Principal:**
1. Cliente accede a "Mis Reservas"
2. Cliente selecciona reserva a cancelar
3. Sistema muestra política de cancelación
4. Cliente confirma cancelación
5. Cliente ingresa motivo
6. Sistema calcula penalización si aplica
7. Sistema crea solicitud de cancelación
8. Sistema notifica al fotógrafo
9. Sistema actualiza estado a CANCELADA

**Postcondición:** Reserva cancelada con registro

#### CU-08: Solicitar Cambio de Reserva
**Actor Principal:** Cliente
**Precondición:** Reserva confirmada
**Flujo Principal:**
1. Cliente accede a reserva
2. Cliente selecciona "Solicitar cambio"
3. Sistema muestra formulario de cambios
4. Cliente modifica: fecha, hora, ubicación
5. Cliente ingresa motivo del cambio
6. Sistema crea solicitud de cambio
7. Sistema notifica al fotógrafo
8. Fotógrafo aprueba o rechaza
9. Sistema actualiza reserva si fue aprobada

**Postcondición:** Solicitud de cambio creada

#### CU-09: Calificar Servicio
**Actor Principal:** Cliente
**Precondición:** Reserva completada
**Flujo Principal:**
1. Cliente accede a reserva completada
2. Sistema muestra formulario de reseña
3. Cliente selecciona calificación (1-5 estrellas)
4. Cliente escribe comentario
5. Sistema valida datos
6. Sistema guarda reseña
7. Sistema actualiza calificación promedio del fotógrafo
8. Sistema notifica al fotógrafo

**Postcondición:** Reseña publicada y calificación actualizada

#### CU-10: Chatear con Fotógrafo
**Actor Principal:** Cliente
**Precondición:** Sesión iniciada
**Flujo Principal:**
1. Cliente selecciona fotógrafo
2. Cliente inicia conversación
3. Sistema crea/recupera hilo de chat
4. Cliente escribe mensaje
5. Sistema guarda mensaje
6. Sistema notifica al fotógrafo
7. Cliente recibe respuesta en tiempo real

**Postcondición:** Conversación establecida

---

### 📷 CASOS DE USO - FOTÓGRAFO

#### CU-11: Crear Perfil Profesional
**Actor Principal:** Fotógrafo
**Precondición:** Cuenta registrada como fotógrafo
**Flujo Principal:**
1. Fotógrafo accede a "Mi Perfil"
2. Sistema muestra formulario de perfil
3. Fotógrafo ingresa: nombre público, biografía, ubicación
4. Fotógrafo sube foto de perfil
5. Fotógrafo sube foto de portada
6. Fotógrafo agrega sitio web
7. Fotógrafo selecciona categorías de especialización
8. Sistema valida y guarda datos
9. Sistema muestra perfil creado

**Postcondición:** Perfil profesional público creado

#### CU-12: Gestionar Portafolio
**Actor Principal:** Fotógrafo
**Precondición:** Perfil creado
**Flujo Principal:**
1. Fotógrafo accede a "Portafolio"
2. Sistema muestra galería actual
3. Fotógrafo selecciona "Agregar fotos"
4. Fotógrafo sube múltiples imágenes
5. Fotógrafo organiza en álbumes
6. Fotógrafo agrega descripciones
7. Fotógrafo marca fotos destacadas
8. Sistema procesa y guarda imágenes
9. Sistema publica portafolio actualizado

**Postcondición:** Portafolio actualizado y visible

#### CU-13: Crear Paquetes de Servicios
**Actor Principal:** Fotógrafo
**Precondición:** Perfil creado
**Flujo Principal:**
1. Fotógrafo accede a "Mis Paquetes"
2. Sistema muestra paquetes actuales
3. Fotógrafo selecciona "Crear paquete"
4. Fotógrafo ingresa: título, descripción, precio
5. Fotógrafo especifica duración en horas
6. Fotógrafo lista lo que incluye
7. Fotógrafo sube imagen representativa
8. Fotógrafo marca si es destacado
9. Sistema guarda paquete
10. Sistema publica paquete en perfil

**Postcondición:** Nuevo paquete disponible para clientes

#### CU-14: Subir Documento de Identidad
**Actor Principal:** Fotógrafo
**Precondición:** Perfil creado, no verificado
**Flujo Principal:**
1. Fotógrafo accede a "Verificación"
2. Sistema muestra sección de documento
3. Fotógrafo selecciona archivo (CI, Pasaporte)
4. Sistema valida formato y tamaño
5. Sistema sube documento
6. Sistema guarda URL en BD
7. Sistema crea solicitud de verificación
8. Sistema notifica a administrador
9. Sistema muestra estado "En revisión"

**Postcondición:** Documento enviado para verificación

#### CU-15: Solicitar Perfil Destacado
**Actor Principal:** Fotógrafo
**Precondición:** Perfil creado
**Flujo Principal:**
1. Fotógrafo accede a "Destacar Perfil"
2. Sistema muestra QR de pago del admin
3. Sistema muestra instrucciones de pago
4. Fotógrafo selecciona plan (7, 30, 90 días)
5. Sistema muestra precio del plan
6. Fotógrafo realiza pago externo
7. Fotógrafo sube comprobante de pago
8. Fotógrafo ingresa referencia (opcional)
9. Fotógrafo agrega notas
10. Sistema crea solicitud con estado PENDIENTE
11. Sistema notifica a administrador

**Postcondición:** Solicitud de destacado creada

#### CU-16: Gestionar Disponibilidad
**Actor Principal:** Fotógrafo
**Precondición:** Perfil creado
**Flujo Principal:**
1. Fotógrafo accede a "Calendario"
2. Sistema muestra calendario con reservas
3. Fotógrafo selecciona fechas a bloquear
4. Fotógrafo ingresa motivo del bloqueo
5. Sistema guarda bloqueos
6. Sistema previene reservas en esas fechas

**Postcondición:** Fechas bloqueadas registradas

#### CU-17: Atender Reserva
**Actor Principal:** Fotógrafo
**Precondición:** Reserva recibida
**Flujo Principal:**
1. Sistema notifica nueva reserva
2. Fotógrafo accede a "Mis Reservas"
3. Fotógrafo visualiza detalles
4. Fotógrafo verifica disponibilidad
5. Fotógrafo acepta o rechaza reserva
6. Si acepta: estado cambia a CONFIRMADA
7. Si rechaza: estado cambia a RECHAZADA
8. Sistema notifica al cliente
9. Sistema actualiza calendario

**Postcondición:** Reserva procesada

#### CU-18: Aprobar Comprobante de Pago
**Actor Principal:** Fotógrafo
**Precondición:** Comprobante recibido
**Flujo Principal:**
1. Sistema notifica comprobante subido
2. Fotógrafo accede a reserva
3. Fotógrafo visualiza comprobante
4. Fotógrafo verifica pago
5. Fotógrafo aprueba comprobante
6. Sistema actualiza estado a APROBADO
7. Sistema notifica al cliente

**Flujo Alternativo 5a:** Comprobante no válido
- Fotógrafo rechaza comprobante
- Fotógrafo ingresa motivo
- Sistema notifica al cliente

**Postcondición:** Pago verificado

#### CU-19: Responder Reseña
**Actor Principal:** Fotógrafo
**Precondición:** Reseña recibida
**Flujo Principal:**
1. Sistema notifica nueva reseña
2. Fotógrafo accede a "Reseñas"
3. Fotógrafo lee comentario del cliente
4. Fotógrafo escribe respuesta
5. Sistema guarda respuesta
6. Sistema publica respuesta en perfil

**Postcondición:** Respuesta a reseña publicada

#### CU-20: Configurar QR de Pago Personal
**Actor Principal:** Fotógrafo
**Precondición:** Perfil creado
**Flujo Principal:**
1. Fotógrafo accede a "Configuración de Pago"
2. Sistema muestra sección de QR
3. Fotógrafo sube imagen de QR personal
4. Fotógrafo escribe instrucciones de pago
5. Sistema valida y guarda
6. Sistema muestra QR en perfil público

**Postcondición:** QR personal configurado

---

### 🛡️ CASOS DE USO - ADMINISTRADOR

#### CU-21: Verificar Fotógrafo
**Actor Principal:** Administrador
**Precondición:** Solicitud de verificación recibida
**Flujo Principal:**
1. Admin accede a "Verificaciones"
2. Sistema lista solicitudes pendientes
3. Admin selecciona solicitud
4. Sistema muestra documento del fotógrafo
5. Admin visualiza documento (con zoom)
6. Admin verifica autenticidad
7. Admin aprueba verificación
8. Sistema marca fotógrafo como verificado
9. Sistema agrega badge de verificado
10. Sistema notifica al fotógrafo

**Flujo Alternativo 7a:** Documento no válido
- Admin rechaza verificación
- Admin ingresa motivo
- Sistema notifica al fotógrafo

**Postcondición:** Fotógrafo verificado o rechazado

#### CU-22: Revisar Solicitud de Destacado
**Actor Principal:** Administrador
**Precondición:** Solicitud recibida
**Flujo Principal:**
1. Admin accede a "Solicitudes Destacado"
2. Sistema lista solicitudes pendientes
3. Admin filtra por estado si desea
4. Admin selecciona solicitud
5. Sistema muestra: fotógrafo, plan, precio, comprobante
6. Admin visualiza comprobante (con zoom)
7. Admin verifica pago
8. Admin aprueba solicitud
9. Sistema calcula fecha de expiración
10. Sistema actualiza destacadoHasta del fotógrafo
11. Sistema cambia estado a APROBADO
12. Sistema notifica al fotógrafo

**Flujo Alternativo 8a:** Pago no válido
- Admin rechaza solicitud
- Admin ingresa motivo
- Sistema notifica al fotógrafo

**Postcondición:** Perfil destacado o solicitud rechazada

#### CU-23: Configurar QR de Pago del Sistema
**Actor Principal:** Administrador
**Precondición:** Acceso de administrador
**Flujo Principal:**
1. Admin accede a "Configuración"
2. Sistema muestra configuración actual
3. Admin selecciona "QR de Pago"
4. Admin sube nueva imagen de QR
5. Admin escribe/edita instrucciones de pago
6. Sistema valida archivo
7. Sistema guarda en configuracion_sistema
8. Sistema muestra confirmación
9. QR visible para fotógrafos al solicitar destacado

**Postcondición:** QR del sistema actualizado

#### CU-24: Gestionar Usuarios
**Actor Principal:** Administrador
**Precondición:** Acceso de administrador
**Flujo Principal:**
1. Admin accede a "Usuarios"
2. Sistema lista todos los usuarios
3. Admin filtra por rol (Cliente, Fotógrafo)
4. Admin puede buscar por nombre/email
5. Admin selecciona usuario
6. Admin puede: suspender, activar, eliminar
7. Sistema ejecuta acción
8. Sistema registra cambio en log

**Postcondición:** Usuario gestionado

#### CU-25: Ver Estadísticas del Sistema
**Actor Principal:** Administrador
**Precondición:** Acceso de administrador
**Flujo Principal:**
1. Admin accede a Dashboard
2. Sistema calcula estadísticas
3. Sistema muestra: total usuarios, reservas, fotógrafos
4. Sistema muestra gráficas de crecimiento
5. Sistema muestra ingresos por destacados

**Postcondición:** Estadísticas visualizadas

---

## 3. RELACIONES ENTRE CASOS DE USO

### 🔗 Inclusiones (<<include>>)

1. **CU-02 (Iniciar Sesión)** incluido en:
   - CU-03: Buscar Fotógrafos
   - CU-05: Realizar Reserva
   - CU-10: Chatear con Fotógrafo
   - CU-11: Crear Perfil Profesional

2. **CU-04 (Ver Perfil de Fotógrafo)** incluido en:
   - CU-05: Realizar Reserva
   - CU-10: Chatear con Fotógrafo

3. **Validar Archivo** incluido en:
   - CU-06: Subir Comprobante de Pago
   - CU-12: Gestionar Portafolio
   - CU-14: Subir Documento de Identidad
   - CU-15: Solicitar Perfil Destacado

### ➕ Extensiones (<<extend>>)

1. **CU-07 (Cancelar Reserva)** extiende:
   - CU-05: Realizar Reserva

2. **CU-08 (Solicitar Cambio de Reserva)** extiende:
   - CU-05: Realizar Reserva

3. **CU-09 (Calificar Servicio)** extiende:
   - CU-05: Realizar Reserva (después de completada)

4. **CU-19 (Responder Reseña)** extiende:
   - CU-09: Calificar Servicio

### 🔄 Generalizaciones

1. **Usuario** (Actor Generalizado)
   - Cliente
   - Fotógrafo
   - Administrador
   
   Todos heredan:
   - CU-01: Registrarse
   - CU-02: Iniciar Sesión
   - Editar Perfil Personal

---

## 4. INSTRUCCIONES PARA EL DIAGRAMA

### 📐 Estructura del Diagrama

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA DE FOTOGRAFÍA                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  👤 Cliente          📷 Fotógrafo         🛡️ Administrador  │
│     │                    │                      │            │
│     ├─ CU-01: Registrarse (heredado de Usuario)             │
│     ├─ CU-02: Iniciar Sesión                                │
│     ├─ CU-03: Buscar Fotógrafos                             │
│     ├─ CU-04: Ver Perfil                                    │
│     ├─ CU-05: Realizar Reserva                              │
│     │    ├─ <<extend>> CU-07: Cancelar                      │
│     │    ├─ <<extend>> CU-08: Solicitar Cambio              │
│     │    └─ <<extend>> CU-09: Calificar                     │
│     ├─ CU-06: Subir Comprobante                             │
│     └─ CU-10: Chatear                                       │
│                                                               │
│                       ├─ CU-11: Crear Perfil                │
│                       ├─ CU-12: Gestionar Portafolio        │
│                       ├─ CU-13: Crear Paquetes              │
│                       ├─ CU-14: Subir Documento             │
│                       ├─ CU-15: Solicitar Destacado         │
│                       ├─ CU-16: Gestionar Disponibilidad    │
│                       ├─ CU-17: Atender Reserva             │
│                       ├─ CU-18: Aprobar Comprobante         │
│                       ├─ CU-19: Responder Reseña            │
│                       └─ CU-20: Configurar QR Personal      │
│                                                               │
│                                          ├─ CU-21: Verificar │
│                                          ├─ CU-22: Revisar   │
│                                          ├─ CU-23: Config QR │
│                                          ├─ CU-24: Gestionar │
│                                          └─ CU-25: Stats     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 🎨 Elementos a Dibujar

1. **Actores (Palitos o Íconos):**
   - Cliente (izquierda)
   - Fotógrafo (centro)
   - Administrador (derecha)

2. **Sistema (Rectángulo grande):**
   - Nombre: "Sistema de Gestión de Servicios Fotográficos"

3. **Casos de Uso (Elipses):**
   - 25 casos de uso en total
   - Distribuidos según actor

4. **Relaciones (Líneas):**
   - Línea continua: Actor → Caso de Uso
   - Línea punteada con <<include>>
   - Línea punteada con <<extend>>
   - Flecha hueca: Generalización

### 🖊️ Recomendaciones de Diseño

1. **Colores sugeridos:**
   - Cliente: Azul
   - Fotógrafo: Verde
   - Administrador: Rojo
   - Sistema: Gris claro

2. **Organización espacial:**
   - Casos de uso compartidos al centro
   - Casos específicos cerca de su actor
   - Evitar cruces de líneas

3. **Leyenda:**
   - Incluir leyenda de símbolos
   - Explicar <<include>> y <<extend>>

---

## 5. PRIORIZACIÓN DE CASOS DE USO

### 🔴 Prioridad ALTA (MVP)
- CU-01: Registrarse
- CU-02: Iniciar Sesión
- CU-03: Buscar Fotógrafos
- CU-05: Realizar Reserva
- CU-11: Crear Perfil Profesional
- CU-13: Crear Paquetes
- CU-17: Atender Reserva

### 🟡 Prioridad MEDIA
- CU-06: Subir Comprobante
- CU-09: Calificar Servicio
- CU-12: Gestionar Portafolio
- CU-14: Subir Documento
- CU-15: Solicitar Destacado
- CU-21: Verificar Fotógrafo
- CU-22: Revisar Solicitud

### 🟢 Prioridad BAJA
- CU-07: Cancelar Reserva
- CU-08: Solicitar Cambio
- CU-10: Chatear
- CU-16: Gestionar Disponibilidad
- CU-20: Configurar QR Personal
- CU-24: Gestionar Usuarios
- CU-25: Ver Estadísticas

---

## 6. MATRIZ DE TRAZABILIDAD

| Caso de Uso | Requerimiento Funcional | Módulo del Sistema |
|-------------|------------------------|-------------------|
| CU-01 | RF-01: Registro de usuarios | Autenticación |
| CU-02 | RF-02: Inicio de sesión | Autenticación |
| CU-03 | RF-03: Búsqueda de fotógrafos | Búsqueda |
| CU-05 | RF-04: Gestión de reservas | Reservas |
| CU-09 | RF-05: Sistema de reseñas | Calificaciones |
| CU-12 | RF-06: Gestión de portafolio | Portafolio |
| CU-15 | RF-07: Perfiles destacados | Destacados |
| CU-21 | RF-08: Verificación de fotógrafos | Verificación |

---

## 📚 GLOSARIO DE TÉRMINOS

- **Destacado:** Perfil que aparece en posición prioritaria en búsquedas
- **Verificado:** Fotógrafo cuya identidad ha sido confirmada por admin
- **Comprobante:** Imagen o PDF que demuestra realización de pago
- **Portafolio:** Galería de trabajos previos del fotógrafo
- **Paquete:** Conjunto de servicios fotográficos con precio definido
- **Reserva:** Solicitud de servicio fotográfico para fecha específica
- **QR:** Código de respuesta rápida para facilitar pagos
- **Token JWT:** Credencial de autenticación con tiempo de expiración

---

**Última actualización:** 24 de noviembre de 2025
**Versión:** 1.0
**Estado:** Completo y Validado
