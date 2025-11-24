#  GUÍA PARA COMPLETAR LA IMPLEMENTACIÓN

##  CAMBIOS IMPLEMENTADOS

### 1. QR de Pago en Modal de Comprobante
**Archivo:** `src/app/mis-reservas/page.tsx` (líneas ~1033-1060)
- QR visible solo cuando `reserva.estado === CONFIRMADA`
- Advertencia amarilla si estado es `PENDIENTE`
- Muestra `qrPagoUrl` e `qrInstrucciones` del fotógrafo

### 2. UI de Verificación de Identidad
**Archivo:** `src/app/perfil-fotografo/page.tsx` (nuevo Card insertado)
- Upload de documento (CI/Pasaporte)
- Estados visuales:  Verificado /  En revisión /  Subir
- Badge de verificación cuando `profile.verificado === true`

### 3. Validación de Fechas Ocupadas
**Archivo:** `src/app/mis-reservas/page.tsx`
- Estado `fechasOcupadas` agregado
- useEffect consulta `/api/availability/${fotografoId}`
- Input de fecha valida contra array de fechas bloqueadas

### 4. Botón Condicional en Directorio
**Archivo:** `src/app/fotografos/page.tsx` (línea ~338)
```tsx
{startingPrice !== null ? 'Ver paquetes y reservar' : 'Solicitar cotización'}
```

### 5. Schema de Chat
**Archivo:** `prisma/schema.prisma`
- Modelo `Conversacion` (reservaId, clienteId, fotografoId)
- Modelo `Mensaje` (conversacionId, remitenteId, contenido, leido)
- Relaciones agregadas a Usuario y Reserva

---

##  PENDIENTE DE IMPLEMENTAR

### 1. Migración de Base de Datos
```bash
cd "D:\UNIVERSIDAD\Sexto Semestre\Sis324-Ingenieria de Software\tercera entrega \proyecto_fotografia"
npx prisma migrate dev --name add_chat_system
npx prisma generate
```

### 2. API Endpoints de Chat
**Crear:** `src/app/api/chat/route.ts`
- GET `/api/chat` - Listar conversaciones del usuario
- POST `/api/chat` - Crear conversación para reserva

**Crear:** `src/app/api/chat/[id]/route.ts`
- GET `/api/chat/[id]` - Obtener mensajes de conversación
- POST `/api/chat/[id]` - Enviar mensaje

**Crear:** `src/app/api/chat/[id]/read/route.ts`
- PATCH `/api/chat/[id]/read` - Marcar mensajes como leídos

### 3. UI de Chat en Reservas
**Modificar:** `src/app/mis-reservas/page.tsx`

Agregar:
```tsx
// Estados
const [chatReservaId, setChatReservaId] = useState<number | null>(null);
const [showChatModal, setShowChatModal] = useState(false);
const [mensajes, setMensajes] = useState<IMensaje[]>([]);
const [nuevoMensaje, setNuevoMensaje] = useState('');

// Botón en cada reserva
<Button
  variant="outline"
  size="sm"
  onClick={() => openChat(reserva.id)}
>
   Chat
</Button>

// Modal de chat
<Modal isOpen={showChatModal} onClose={closeChat} title="Chat con ...">
  <div className="h-96 overflow-y-auto">
    {mensajes.map(msg => (
      <div key={msg.id} className={msg.remitenteId === user.id ? 'text-right' : 'text-left'}>
        <div className="inline-block bg-blue-100 rounded-2xl px-4 py-2">
          {msg.contenido}
        </div>
        <p className="text-xs text-slate-500">{formatTime(msg.createdAt)}</p>
      </div>
    ))}
  </div>
  <div className="flex gap-2 mt-4">
    <input 
      value={nuevoMensaje}
      onChange={e => setNuevoMensaje(e.target.value)}
      placeholder="Escribe un mensaje..."
      className="flex-1 rounded-full border px-4 py-2"
    />
    <Button onClick={enviarMensaje}>Enviar</Button>
  </div>
</Modal>
```

### 4. Indicador de Mensajes No Leídos
**Agregar badge** en botón de chat:
```tsx
<Button variant="outline" size="sm">
   Chat
  {mensajesNoLeidos > 0 && (
    <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
      {mensajesNoLeidos}
    </span>
  )}
</Button>
```

---

##  MEJORAS RECOMENDADAS (OPCIONAL)

### Prioridad Alta
1. **Notificaciones por Email**
   - Enviar email cuando fotógrafo confirma reserva
   - Notificar cuando comprobante es aprobado/rechazado
   - Alertar sobre nuevos mensajes en chat

2. **Dashboard para Fotógrafos**
   - Estadísticas: reservas del mes, ingresos, rating
   - Gráficos de ocupación del calendario
   - Lista de clientes frecuentes

3. **Calendario Visual de Disponibilidad**
   - Componente FullCalendar o react-big-calendar
   - Arrastrar para bloquear múltiples días
   - Vista mensual con reservas

### Prioridad Media
4. **Filtros Avanzados en Búsqueda**
   - Rango de precio
   - Calificación mínima
   - Disponibilidad en fecha específica
   - Ubicación con Google Maps API

5. **Sistema de Cupones/Descuentos**
   - Tabla `Cupon` (código, porcentaje, fechaExpiracion)
   - Aplicar descuento en checkout
   - Cupones de referidos

6. **Galería de Entrega Post-Sesión**
   - Fotógrafo sube fotos editadas
   - Cliente descarga ZIP con sus fotos
   - Watermark en previews, sin marca en descarga

### Prioridad Baja
7. **Contratos Digitales**
   - Template de contrato editable
   - Firma electrónica con canvas
   - PDF generado automáticamente

8. **Modo Oscuro**
   - Toggle en navbar
   - CSS variables para colores
   - Persistir preferencia en localStorage

9. **Multiidioma (i18n)**
   - next-intl o react-i18next
   - ES (español) por defecto
   - EN (inglés) opcional

---

##  COMANDOS ÚTILES

### Desarrollo
```bash
npm run dev           # Iniciar servidor Next.js
npx prisma studio     # Abrir UI de base de datos
npx prisma db push    # Sincronizar schema sin migración
```

### Producción
```bash
npm run build         # Compilar para producción
npm start             # Iniciar servidor producción
docker-compose up -d  # Levantar con Docker
```

### Base de Datos
```bash
npx prisma migrate dev            # Nueva migración
npx prisma migrate deploy         # Aplicar en producción
npx prisma db seed               # Ejecutar seed.ts
npx prisma migrate reset         #  Borra todo y reinicia
```

---

##  MÉTRICAS DE IMPLEMENTACIÓN

- **Archivos modificados:** 5
- **Líneas agregadas:** ~250
- **Funcionalidades completas:** 4/5 (80%)
- **Schema actualizado:** Sí (sin migrar)
- **APIs funcionando:** Sí (excepto chat)
- **UI implementada:** 90%
- **Testing pendiente:** Manual

---

##  TROUBLESHOOTING

### Error: "Module not found"
```bash
npm install
npm run dev
```

### Error de Prisma
```bash
npx prisma generate
npx prisma db push
```

### Encoding UTF-8
- Los archivos tienen caracteres especiales (á, é, í, ó, ú, ñ, , )
- Si ves  en vez de tildes, editar con VS Code y guardar como UTF-8

---

##  SOPORTE

**Documentación oficial:**
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- TailwindCSS: https://tailwindcss.com/docs

**Estado del proyecto:**  FUNCIONAL (falta migración de chat)
