# 🏗️ DIAGRAMA DE CLASES
## Sistema de Gestión de Servicios Fotográficos

---

## 📐 GUÍA PARA ELABORAR EL DIAGRAMA

### Herramientas Recomendadas:
- **Draw.io / Diagrams.net** (Gratuito, online)
- **Lucidchart** (Freemium)
- **PlantUML** (Código)
- **StarUML** (Profesional)
- **Microsoft Visio** (Comercial)

---

## 🎯 DIAGRAMA CONCEPTUAL

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE FOTOGRAFÍA                        │
│                   Diagrama de Clases UML                        │
└─────────────────────────────────────────────────────────────────┘

          ┌──────────────────┐
          │     Usuario      │◄────────────────────┐
          ├──────────────────┤                      │
          │ - id: Integer    │                      │
          │ - nombre: String │                      │
          │ - email: String  │                      │
          │ - passwordHash   │                      │
          │ - rol: RolUsuario│                      │
          │ - telefono       │                      │
          │ - activo: Boolean│                      │
          ├──────────────────┤                      │
          │ + registrar()    │                      │
          │ + iniciarSesion()│                      │
          │ + actualizarPerfil()│                   │
          └────────┬─────────┘                      │
                   │                                 │
                   │                                 │
          ┌────────┴─────────┐                      │
          │                  │                      │
          │                  │                      │
    ┌─────▼─────┐     ┌─────▼─────┐         ┌─────┴────────┐
    │  Cliente  │     │ Fotógrafo │         │     Admin    │
    ├───────────┤     ├───────────┤         ├──────────────┤
    │ [hereda]  │     │ [hereda]  │         │  [hereda]    │
    ├───────────┤     ├───────────┤         ├──────────────┤
    │+ buscar() │     │+ crear    │         │+ verificar() │
    │+ reservar()│     │  Perfil() │         │+ aprobar()   │
    │+ calificar│     │+ gestionar│         │+ configurar()│
    └───────────┘     │  Portafolio()│      └──────────────┘
                      │+ atender  │
                      │  Reserva()│
                      └─────┬─────┘
                            │
                            │ 1
                            │
                            │ 1
                      ┌─────▼──────────────┐
                      │ PerfilFotografo    │
                      ├────────────────────┤
                      │ - id: Integer      │
                      │ - usuarioId: Int   │
                      │ - nombrePublico    │
                      │ - biografia: Text  │
                      │ - ubicacion        │
                      │ - urlFotoPerfil    │
                      │ - urlDocumento     │
                      │ - verificado: Bool │
                      │ - destacadoHasta   │
                      │ - calificacionPromedio│
                      ├────────────────────┤
                      │ + crearPerfil()    │
                      │ + subirDocumento() │
                      │ + solicitarDestacado()│
                      │ + actualizarPortafolio()│
                      └────────┬───────────┘
                               │
                               │ 1
                               │
                               │ *
                      ┌────────▼────────────┐
                      │ PortafolioImagen   │
                      ├─────────────────────┤
                      │ - id: Integer       │
                      │ - fotografoId       │
                      │ - urlImagen: String │
                      │ - descripcion: Text │
                      │ - orden: Integer    │
                      │ - destacada: Bool   │
                      ├─────────────────────┤
                      │ + subir()           │
                      │ + eliminar()        │
                      │ + reordenar()       │
                      └─────────────────────┘


┌──────────────────┐          ┌──────────────────┐
│    Categoria     │◄─────────│Fotografo         │
├──────────────────┤    *   * │Categoria         │
│ - id: Integer    │          ├──────────────────┤
│ - nombre: String │          │ - id: Integer    │
│ - tipo: String   │          │ - fotografoId    │
│ - descripcion    │          │ - categoriaId    │
│ - icono: String  │          │ - createdAt      │
│ - activo: Boolean│          ├──────────────────┤
├──────────────────┤          │ + asociar()      │
│ + crear()        │          │ + desasociar()   │
│ + listar()       │          └──────────────────┘
└──────────────────┘


┌─────────────────────┐         ┌──────────────────┐
│      Paquete        │◄────────│   Reserva        │
├─────────────────────┤   0..1  ├──────────────────┤
│ - id: Integer       │    1    │ - id: Integer    │
│ - fotografoId       │         │ - clienteId      │
│ - titulo: String    │         │ - fotografoId    │
│ - descripcion: Text │         │ - paqueteId      │
│ - precio: Decimal   │         │ - fechaEvento    │
│ - duracionHoras     │         │ - horaEvento     │
│ - incluye: Text     │         │ - ubicacion      │
│ - imagenUrl: String │         │ - estado: Enum   │
│ - activo: Boolean   │         │ - monto: Decimal │
│ - destacado: Bool   │         │ - comprobanteUrl │
├─────────────────────┤         │ - comprobanteEstado│
│ + crear()           │         ├──────────────────┤
│ + actualizar()      │         │ + crear()        │
│ + eliminar()        │         │ + confirmar()    │
│ + activar()         │         │ + cancelar()     │
└─────────────────────┘         │ + subirComprobante()│
                                │ + solicitarCambio()│
                                └────────┬─────────┘
                                         │
                                         │ 1
                                         │
                                         │ 0..1
                                ┌────────▼──────────┐
                                │     Resena        │
                                ├───────────────────┤
                                │ - id: Integer     │
                                │ - reservaId       │
                                │ - calificacion: Int│
                                │ - comentario: Text│
                                │ - publicadoPor    │
                                │ - respuesta: Text │
                                │ - visible: Boolean│
                                ├───────────────────┤
                                │ + crear()         │
                                │ + responder()     │
                                │ + ocultar()       │
                                └───────────────────┘


┌────────────────────┐          ┌─────────────────────┐
│ SolicitudDestacado │          │ ConfiguracionSistema│
├────────────────────┤          ├─────────────────────┤
│ - id: Integer      │          │ - id: Integer       │
│ - fotografoId      │          │ - clave: String     │
│ - dias: Integer    │          │ - valor: Text       │
│ - precio: Decimal  │          │ - descripcion: Text │
│ - urlComprobante   │          ├─────────────────────┤
│ - referenciaPago   │          │ + obtener(clave)    │
│ - notasFotografo   │          │ + actualizar(clave) │
│ - estado: Enum     │          │ + listar()          │
│ - notasAdmin       │          └─────────────────────┘
│ - revisadoPor      │
│ - fechaRevision    │
├────────────────────┤
│ + crear()          │
│ + aprobar()        │
│ + rechazar()       │
└────────────────────┘


┌─────────────────────┐        ┌──────────────────┐
│ BloqueoCalendario   │        │  Conversacion    │
├─────────────────────┤        ├──────────────────┤
│ - id: Integer       │        │ - id: Integer    │
│ - fotografoId       │        │ - reservaId      │
│ - fechaInicio: Date │        │ - clienteId      │
│ - fechaFin: Date    │        │ - fotografoId    │
│ - motivo: String    │        │ - createdAt      │
├─────────────────────┤        ├──────────────────┤
│ + crear()           │        │ + iniciar()      │
│ + eliminar()        │        │ + enviarMensaje()│
│ + verificar         │        └────────┬─────────┘
│   Disponibilidad()  │                 │
└─────────────────────┘                 │ 1
                                        │
                                        │ *
                                ┌───────▼──────────┐
                                │    Mensaje       │
                                ├──────────────────┤
                                │ - id: Integer    │
                                │ - conversacionId │
                                │ - remitenteId    │
                                │ - contenido: Text│
                                │ - leido: Boolean │
                                │ - createdAt      │
                                ├──────────────────┤
                                │ + enviar()       │
                                │ + marcarLeido()  │
                                └──────────────────┘


┌───────────────────┐
│   Sesion          │
├───────────────────┤
│ - id: Integer     │
│ - usuarioId       │
│ - token: String   │
│ - ipAddress       │
│ - userAgent       │
│ - expiresAt       │
├───────────────────┤
│ + crear()         │
│ + validar()       │
│ + eliminar()      │
└───────────────────┘


┌────────────────────┐
│  Notificacion     │
├────────────────────┤
│ - id: Integer      │
│ - usuarioId        │
│ - tipo: Enum       │
│ - titulo: String   │
│ - mensaje: Text    │
│ - leido: Boolean   │
│ - enlace: String   │
├────────────────────┤
│ + enviar()         │
│ + marcarLeida()    │
│ + eliminar()       │
└────────────────────┘


┌───────────────────────┐
│  SolicitudCambio      │
├───────────────────────┤
│ - id: Integer         │
│ - reservaId           │
│ - tipo: Enum          │
│ - estado: Enum        │
│ - datosOriginales:JSON│
│ - nuevaFecha          │
│ - nuevaHora           │
│ - nuevaUbicacion      │
│ - motivoEdicion       │
│ - motivoCancelacion   │
│ - penalizacion        │
│ - respuestaFotografo  │
├───────────────────────┤
│ + crear()             │
│ + aprobar()           │
│ + rechazar()          │
└───────────────────────┘


┌──────────────────────┐
│  PortafolioAlbum     │
├──────────────────────┤
│ - id: Integer        │
│ - fotografoId        │
│ - nombre: String     │
│ - slug: String       │
│ - descripcion: Text  │
│ - portadaUrl: String │
│ - orden: Integer     │
│ - visible: Boolean   │
├──────────────────────┤
│ + crear()            │
│ + actualizar()       │
│ + eliminar()         │
│ + agregarImagen()    │
└──────────────────────┘
```

---

## 📋 DESCRIPCIÓN DETALLADA DE CLASES

### 🔷 CLASE: Usuario (Clase Padre)

**Responsabilidad:** Gestionar autenticación y datos básicos de usuarios

#### Atributos:
| Nombre | Tipo | Visibilidad | Descripción |
|--------|------|-------------|-------------|
| id | Integer | private | Identificador único |
| nombre | String | private | Nombre corto/usuario |
| nombreCompleto | String | private | Nombre completo |
| email | String | private | Correo único |
| passwordHash | String | private | Contraseña encriptada |
| passwordSalt | String | private | Salt para hash |
| rol | RolUsuario | private | CLIENTE, FOTOGRAFO, ADMIN |
| telefono | String | private | Número de contacto |
| activo | Boolean | private | Estado de cuenta |
| emailVerificado | Boolean | private | Email confirmado |
| cancelacionesTotales | Integer | private | Contador de cancelaciones |
| suspendidoHasta | DateTime | private | Fecha de suspensión |
| createdAt | DateTime | private | Fecha de creación |
| updatedAt | DateTime | private | Última actualización |

#### Métodos:
| Nombre | Parámetros | Retorno | Visibilidad | Descripción |
|--------|------------|---------|-------------|-------------|
| registrar() | email, password, nombre | Usuario | public | Crear cuenta nueva |
| iniciarSesion() | email, password | Sesion | public | Autenticar usuario |
| actualizarPerfil() | datos | Boolean | public | Modificar información |
| cambiarPassword() | oldPass, newPass | Boolean | public | Actualizar contraseña |
| suspender() | motivo, fechaHasta | Boolean | private | Suspender cuenta |
| activar() | - | Boolean | public | Reactivar cuenta |

#### Relaciones:
- 1:1 con **PerfilFotografo** (si rol es FOTOGRAFO)
- 1:* con **Reserva** (como cliente o fotógrafo)
- 1:* con **Sesion**
- 1:* con **Conversacion**
- 1:* con **Mensaje**
- 1:* con **Notificacion**

---

### 🔷 CLASE: Cliente (Hereda de Usuario)

**Responsabilidad:** Operaciones específicas de clientes

#### Métodos adicionales:
| Nombre | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| buscarFotografos() | filtros | List<PerfilFotografo> | Buscar con criterios |
| realizarReserva() | fotografo, paquete, fecha | Reserva | Crear reserva |
| calificarServicio() | reserva, calificacion, comentario | Resena | Dejar reseña |
| subirComprobante() | reserva, archivo | Boolean | Subir pago |
| cancelarReserva() | reserva, motivo | Boolean | Cancelar reserva |
| solicitarCambio() | reserva, cambios | SolicitudCambio | Modificar reserva |
| verMisReservas() | - | List<Reserva> | Listar reservas |

---

### 🔷 CLASE: Fotografo (Hereda de Usuario)

**Responsabilidad:** Operaciones específicas de fotógrafos

#### Métodos adicionales:
| Nombre | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| crearPerfil() | datos | PerfilFotografo | Crear perfil profesional |
| gestionarPortafolio() | imagenes | Boolean | Administrar galería |
| crearPaquete() | datos | Paquete | Crear servicio |
| atenderReserva() | reserva, accion | Boolean | Aceptar/Rechazar |
| aprobarComprobante() | reserva | Boolean | Validar pago |
| responderResena() | resena, texto | Boolean | Responder calificación |
| configurarDisponibilidad() | fechas | BloqueoCalendario | Bloquear fechas |
| solicitarDestacado() | dias, comprobante | SolicitudDestacado | Pedir destacado |
| subirDocumento() | archivo | Boolean | Verificación |

---

### 🔷 CLASE: Administrador (Hereda de Usuario)

**Responsabilidad:** Gestión y supervisión del sistema

#### Métodos adicionales:
| Nombre | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| verificarFotografo() | fotografo, decision | Boolean | Aprobar verificación |
| revisarSolicitudDestacado() | solicitud, decision | Boolean | Aprobar destacado |
| configurarQR() | imagen, instrucciones | Boolean | Config sistema |
| gestionarUsuarios() | usuario, accion | Boolean | Admin usuarios |
| verEstadisticas() | - | Object | Dashboard stats |
| generarReportes() | tipo, filtros | Report | Crear reportes |

---

### 🔷 CLASE: PerfilFotografo

**Responsabilidad:** Información pública del fotógrafo

#### Atributos:
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| id | Integer | ID único |
| usuarioId | Integer | FK a Usuario |
| nombrePublico | String | Nombre mostrado |
| biografia | Text | Descripción profesional |
| ubicacion | String | Ciudad/Región |
| sitioWeb | String | URL externa |
| urlFotoPerfil | String | Avatar |
| urlFotoPortada | String | Banner |
| urlDocumentoIdentidad | String | CI/Pasaporte |
| qrPagoUrl | String | QR personal |
| qrInstrucciones | Text | Instrucciones pago |
| portfolio | Text | JSON de imágenes |
| calificacionPromedio | Decimal | Rating promedio |
| totalResenas | Integer | Cantidad reseñas |
| verificado | Boolean | Verificado por admin |
| destacadoHasta | DateTime | Fin de destacado |
| politicaCancelacion | Text | Política propia |

#### Métodos:
| Nombre | Descripción |
|--------|-------------|
| crear() | Inicializar perfil |
| actualizar() | Modificar datos |
| subirDocumento() | Verificación |
| solicitarDestacado() | Pedir destacado |
| actualizarCalificacion() | Recalcular rating |
| verificar() | Marcar verificado |
| destacar() | Activar destacado |

#### Relaciones:
- 1:1 con **Usuario** (fotografo)
- 1:* con **PortafolioImagen**
- 1:* con **PortafolioAlbum**
- 1:* con **Paquete**
- *:* con **Categoria** (a través de FotografoCategoria)
- 1:* con **BloqueoCalendario**
- 1:* con **SolicitudDestacado**

---

### 🔷 CLASE: Paquete

**Responsabilidad:** Servicios ofrecidos por fotógrafo

#### Atributos:
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| id | Integer | ID único |
| fotografoId | Integer | FK a PerfilFotografo |
| titulo | String | Nombre del paquete |
| descripcion | Text | Detalle del servicio |
| precio | Decimal | Costo |
| moneda | Enum | BOB o USD |
| duracionHoras | String | Tiempo estimado |
| incluye | Text | Lista de incluidos |
| imagenUrl | String | Imagen representativa |
| activo | Boolean | Disponible |
| destacado | Boolean | Destacado en perfil |

#### Métodos:
| Nombre | Descripción |
|--------|-------------|
| crear() | Nuevo paquete |
| actualizar() | Modificar datos |
| activar() | Hacer visible |
| desactivar() | Ocultar |
| eliminar() | Borrar (soft delete) |

#### Relaciones:
- *:1 con **PerfilFotografo**
- 1:* con **Reserva**

---

### 🔷 CLASE: Reserva

**Responsabilidad:** Gestión de contrataciones

#### Atributos:
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| id | Integer | ID único |
| clienteId | Integer | FK a Usuario |
| fotografoId | Integer | FK a Usuario |
| paqueteId | Integer | FK a Paquete |
| fechaEvento | Date | Día del evento |
| horaEvento | String | Hora del evento |
| ubicacionEvento | String | Lugar |
| estado | EstadoReserva | PENDIENTE, CONFIRMADA, etc |
| monto | Decimal | Precio acordado |
| comision | Decimal | Comisión plataforma |
| moneda | Enum | BOB o USD |
| notas | Text | Información adicional |
| comprobanteEstado | EstadoComprobante | Estado del pago |
| comprobanteUrl | String | Imagen de comprobante |
| comprobanteNotas | Text | Notas del pago |

#### Métodos:
| Nombre | Descripción |
|--------|-------------|
| crear() | Nueva reserva |
| confirmar() | Aceptar (fotógrafo) |
| rechazar() | Rechazar (fotógrafo) |
| cancelar() | Cancelar |
| completar() | Marcar finalizada |
| subirComprobante() | Cliente sube pago |
| aprobarComprobante() | Fotografo valida |
| solicitarCambio() | Cliente pide modificar |

#### Relaciones:
- *:1 con **Usuario** (cliente)
- *:1 con **Usuario** (fotógrafo)
- *:1 con **Paquete**
- 1:1 con **Resena**
- 1:* con **Conversacion**
- 1:* con **SolicitudCambio**

---

### 🔷 CLASE: Resena

**Responsabilidad:** Calificaciones de servicios

#### Atributos:
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| id | Integer | ID único |
| reservaId | Integer | FK a Reserva |
| calificacion | Integer | 1-5 estrellas |
| comentario | Text | Opinión del cliente |
| publicadoPor | String | Nombre del cliente |
| respuesta | Text | Respuesta del fotógrafo |
| visible | Boolean | Mostrar públicamente |

#### Métodos:
| Nombre | Descripción |
|--------|-------------|
| crear() | Nueva reseña |
| responder() | Fotógrafo responde |
| ocultar() | Admin oculta |
| mostrar() | Admin muestra |

#### Relaciones:
- 1:1 con **Reserva**

---

### 🔷 CLASE: SolicitudDestacado

**Responsabilidad:** Peticiones de perfil destacado

#### Atributos:
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| id | Integer | ID único |
| fotografoId | Integer | FK a PerfilFotografo |
| dias | Integer | 7, 30 o 90 días |
| precio | Decimal | Monto pagado |
| urlComprobante | String | Imagen de pago |
| referenciaPago | String | Nro de transacción |
| notasFotografo | Text | Comentarios |
| estado | EstadoComprobante | PENDIENTE, APROBADO, etc |
| notasAdmin | Text | Comentarios admin |
| revisadoPor | Integer | ID del admin |
| fechaRevision | DateTime | Cuándo se revisó |

#### Métodos:
| Nombre | Descripción |
|--------|-------------|
| crear() | Nueva solicitud |
| aprobar() | Admin acepta |
| rechazar() | Admin rechaza |
| actualizarEstado() | Cambiar estado |

#### Relaciones:
- *:1 con **PerfilFotografo**

---

### 🔷 CLASE: ConfiguracionSistema

**Responsabilidad:** Parámetros globales del sistema

#### Atributos:
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| id | Integer | ID único |
| clave | String | Identificador config |
| valor | Text | Valor de la config |
| descripcion | Text | Descripción |

#### Métodos:
| Nombre | Descripción |
|--------|-------------|
| obtener(clave) | Obtener valor |
| actualizar(clave, valor) | Modificar |
| listar() | Todas las configs |

---

### 🔷 CLASE: Categoria

**Responsabilidad:** Clasificación de servicios

#### Atributos:
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| id | Integer | ID único |
| nombre | String | Nombre categoría |
| tipo | String | Tipo de evento/estilo |
| descripcion | Text | Descripción |
| icono | String | Ícono visual |
| activo | Boolean | Activa |
| orden | Integer | Orden de visualización |

#### Métodos:
| Nombre | Descripción |
|--------|-------------|
| crear() | Nueva categoría |
| actualizar() | Modificar |
| activar() | Hacer visible |
| desactivar() | Ocultar |

#### Relaciones:
- *:* con **PerfilFotografo** (a través de FotografoCategoria)

---

### 🔷 CLASE: PortafolioImagen

**Responsabilidad:** Imágenes de trabajos previos

#### Atributos:
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| id | Integer | ID único |
| fotografoId | Integer | FK a PerfilFotografo |
| urlImagen | String | URL de imagen |
| descripcion | Text | Descripción foto |
| orden | Integer | Orden de display |
| destacada | Boolean | Imagen principal |
| album | String | Nombre álbum |
| albumId | Integer | FK a PortafolioAlbum |

#### Métodos:
| Nombre | Descripción |
|--------|-------------|
| subir() | Nueva imagen |
| actualizar() | Modificar datos |
| eliminar() | Borrar |
| reordenar() | Cambiar orden |
| destacar() | Marcar principal |

#### Relaciones:
- *:1 con **PerfilFotografo**
- *:1 con **PortafolioAlbum**

---

### 🔷 CLASE: Conversacion

**Responsabilidad:** Hilos de chat

#### Atributos:
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| id | Integer | ID único |
| reservaId | Integer | FK a Reserva (opcional) |
| clienteId | Integer | FK a Usuario |
| fotografoId | Integer | FK a Usuario |

#### Métodos:
| Nombre | Descripción |
|--------|-------------|
| iniciar() | Crear conversación |
| enviarMensaje() | Nuevo mensaje |
| cerrar() | Finalizar |

#### Relaciones:
- *:1 con **Reserva**
- *:1 con **Usuario** (cliente)
- *:1 con **Usuario** (fotógrafo)
- 1:* con **Mensaje**

---

### 🔷 CLASE: Mensaje

**Responsabilidad:** Mensajes individuales

#### Atributos:
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| id | Integer | ID único |
| conversacionId | Integer | FK a Conversacion |
| remitenteId | Integer | FK a Usuario |
| contenido | Text | Texto del mensaje |
| leido | Boolean | Visto |

#### Métodos:
| Nombre | Descripción |
|--------|-------------|
| enviar() | Crear mensaje |
| marcarLeido() | Actualizar estado |
| eliminar() | Borrar mensaje |

#### Relaciones:
- *:1 con **Conversacion**
- *:1 con **Usuario** (remitente)

---

### 🔷 CLASE: Sesion

**Responsabilidad:** Tokens de autenticación activos

#### Atributos:
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| id | Integer | ID único |
| usuarioId | Integer | FK a Usuario |
| token | String | JWT |
| ipAddress | String | IP del cliente |
| userAgent | String | Navegador |
| expiresAt | DateTime | Expiración |

#### Métodos:
| Nombre | Descripción |
|--------|-------------|
| crear() | Nueva sesión |
| validar() | Verificar token |
| eliminar() | Cerrar sesión |
| renovar() | Extender expiración |

#### Relaciones:
- *:1 con **Usuario**

---

### 🔷 CLASE: Notificacion

**Responsabilidad:** Alertas del sistema

#### Atributos:
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| id | Integer | ID único |
| usuarioId | Integer | FK a Usuario |
| tipo | TipoNotificacion | RESERVA, MENSAJE, etc |
| titulo | String | Título corto |
| mensaje | Text | Contenido |
| leido | Boolean | Vista |
| enlace | String | URL destino |

#### Métodos:
| Nombre | Descripción |
|--------|-------------|
| enviar() | Nueva notificación |
| marcarLeida() | Actualizar estado |
| eliminar() | Borrar |

#### Relaciones:
- *:1 con **Usuario**

---

## 🔗 RELACIONES ENTRE CLASES

### Tipos de Relaciones:

#### 1. **Herencia (Generalización)**
```
Usuario (Padre)
   ├── Cliente
   ├── Fotografo
   └── Administrador
```

#### 2. **Asociación 1:1**
- Usuario (Fotógrafo) ⟷ PerfilFotografo
- Reserva ⟷ Resena

#### 3. **Asociación 1:***
- Usuario → Sesion
- Usuario → Notificacion
- Usuario → Reserva (como cliente)
- Usuario → Reserva (como fotógrafo)
- PerfilFotografo → Paquete
- PerfilFotografo → PortafolioImagen
- PerfilFotografo → SolicitudDestacado
- Paquete → Reserva
- Reserva → SolicitudCambio
- Conversacion → Mensaje

#### 4. **Asociación *:***
- PerfilFotografo ⟷ Categoria (tabla intermedia: FotografoCategoria)

---

## 📊 ENUMERACIONES

### 🔹 RolUsuario
```
CLIENTE
FOTOGRAFO
ADMIN
```

### 🔹 EstadoReserva
```
PENDIENTE
CONFIRMADA
CANCELADA
COMPLETADA
RECHAZADA
```

### 🔹 EstadoComprobante
```
NO_ENVIADO
PENDIENTE
APROBADO
RECHAZADO
```

### 🔹 TipoSolicitud
```
EDICION
CANCELACION
```

### 🔹 EstadoSolicitud
```
PENDIENTE
APROBADA
RECHAZADA
```

### 🔹 Moneda
```
BOB (Bolivianos)
USD (Dólares)
```

### 🔹 TipoNotificacion
```
RESERVA
MENSAJE
SISTEMA
PAGO
```

---

## 🎨 PATRONES DE DISEÑO APLICADOS

### 1. **Repository Pattern**
**Clases involucradas:**
- UserRepository
- ProfileRepository
- ReservationRepository
- PackageRepository

**Propósito:** Abstracción de acceso a datos

### 2. **Service Layer Pattern**
**Clases involucradas:**
- AuthService
- ProfileService
- ReservationService
- PortfolioService

**Propósito:** Lógica de negocio centralizada

### 3. **Strategy Pattern** (Implícito)
**Contexto:** Cálculo de precios de destacado según días

### 4. **Observer Pattern** (Implícito)
**Contexto:** Sistema de notificaciones

### 5. **Factory Pattern** (Implícito)
**Contexto:** Creación de diferentes tipos de usuarios

---

## 📝 NOTAS PARA EL DIAGRAMA UML

### Símbolos a Usar:

#### Visibilidad:
- `+` Public
- `-` Private
- `#` Protected

#### Tipos de Líneas:
- **Línea continua** → Asociación
- **Línea con flecha hueca** → Herencia
- **Línea punteada con flecha** → Dependencia
- **Línea con rombo** → Agregación/Composición

#### Multiplicidad:
- `1` - Exactamente uno
- `0..1` - Cero o uno
- `*` - Cero o muchos
- `1..*` - Uno o muchos

---

## 🖼️ RECOMENDACIONES DE DISEÑO

### Distribución Espacial:
1. **Centro:** Clase Usuario (padre)
2. **Izquierda:** Clases relacionadas con Cliente
3. **Derecha:** Clases relacionadas con Fotógrafo
4. **Arriba:** Clases de sistema (Sesion, Configuracion)
5. **Abajo:** Clases de soporte (Notificacion, Mensaje)

### Colores Sugeridos:
- **Clases principales:** Azul claro
- **Clases de soporte:** Verde claro
- **Enumeraciones:** Amarillo claro
- **Clases abstractas:** Gris claro

### Agrupaciones:
- Agrupar clases por módulo funcional
- Usar paquetes/namespaces si la herramienta lo permite

---

**Última actualización:** 24 de noviembre de 2025
**Versión:** 1.0
**Clases totales:** 20+
**Relaciones:** 30+
