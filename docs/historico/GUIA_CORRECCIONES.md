# GUÍA DE CORRECCIONES - PASO A PASO

##  VERIFICADO: Ya funciona correctamente

1. **El QR SÍ se guarda en la base de datos**
   - Los campos están en el schema
   - Los endpoints POST/PUT lo manejan
   - Si no lo ves, verifica que estés guardando el perfil después de subir el QR

2. **El botón de pago destacado SÍ funciona**
   - Endpoint /api/profiles/destacado-request activo
   - El admin puede revisar en /admin/solicitudes-destacado
   - El flujo completo está implementado

3. **Las reservas con paquetes SÍ funcionan**
   - El monto se auto-completa
   - El flujo está correcto

##  CORRECCIONES NECESARIAS

### 1. Habilitar solicitud de verificación (10 minutos)

**Archivo:** src/app/perfil-fotografo/page.tsx

**Paso 1:** Busca la línea ~83 y descomenta:
\\\	ypescript
// ANTES:
// const [documentFile, setDocumentFile] = useState<File | null>(null);
// const [uploadingDocument, setUploadingDocument] = useState(false);

// DESPUÉS:
const [documentFile, setDocumentFile] = useState<File | null>(null);
const [uploadingDocument, setUploadingDocument] = useState(false);
\\\

**Paso 2:** Busca la línea ~240 y descomenta:
\\\	ypescript
// ANTES:
// const handleDocumentFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//   setDocumentFile(event.target.files?.[0] || null);
// };

// DESPUÉS:
const handleDocumentFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setDocumentFile(event.target.files?.[0] || null);
};
\\\

**Paso 3:** Busca la línea ~244 y descomenta toda la función handleUploadDocument (hasta línea ~278)

**Paso 4:** Busca la sección de Categorías (línea ~850) y DESPUÉS de ella agrega:

\\\	sx
<Card padding="lg" className="space-y-6">
  <div>
    <p className="text-sm font-semibold text-blue-600">Verificación de identidad</p>
    <h2 className="text-2xl font-semibold text-slate-900 mt-1">
      Solicita verificación oficial
    </h2>
    <p className="text-sm text-slate-500">
      Sube tu documento de identidad para recibir el badge verificado.
    </p>
  </div>

  {profile?.verificado ? (
    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
      <div className="text-5xl mb-3"></div>
      <p className="text-lg font-bold text-green-900">Perfil Verificado!</p>
      <p className="text-sm text-green-700 mt-2">
        Tu perfil cuenta con el badge oficial de verificación.
      </p>
    </div>
  ) : formData.urlDocumentoIdentidad ? (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
      <div className="text-5xl mb-3"></div>
      <p className="text-lg font-bold text-amber-900">Solicitud en revisión</p>
      <p className="text-sm text-amber-700 mt-2">
        Tu documento está siendo revisado. Te notificaremos pronto.
      </p>
      <a
        href={formData.urlDocumentoIdentidad}
        target="_blank"
        rel="noreferrer"
        className="inline-block mt-3 text-sm text-blue-600 hover:underline"
      >
        Ver documento enviado
      </a>
    </div>
  ) : (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Subir documento de identidad
        </label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={handleDocumentFileChange}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-600 hover:file:bg-purple-100"
        />
        {documentFile && (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600">
            <span>
              {documentFile.name}  {(documentFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
            <Button onClick={handleUploadDocument} disabled={uploadingDocument}>
              {uploadingDocument ? 'Subiendo...' : 'Enviar para verificación'}
            </Button>
          </div>
        )}
        <p className="text-xs text-slate-500 mt-2">
          Formatos: JPG, PNG, PDF (máx. 8MB).
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-2">Por qué verificar mi cuenta?</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Badge de verificado visible en tu perfil</li>
          <li>Aumenta la confianza de los clientes</li>
          <li>Prioridad en resultados de búsqueda</li>
        </ul>
      </div>
    </div>
  )}
</Card>
\\\

### 2. Validar fechas ocupadas (20 minutos)

**Archivo:** src/app/mis-reservas/page.tsx

**Paso 1:** Agregar estado para fechas ocupadas (cerca de la línea 50):
\\\	ypescript
const [fechasOcupadas, setFechasOcupadas] = useState<string[]>([]);
\\\

**Paso 2:** Agregar useEffect para cargar fechas (después del useEffect de photographer data, línea ~280):
\\\	ypescript
useEffect(() => {
  if (!selectedPhotographerId) {
    setFechasOcupadas([]);
    return;
  }

  const loadFechasOcupadas = async () => {
    try {
      const response = await fetch(\/api/availability/\\);
      if (response.ok) {
        const data = await response.json();
        setFechasOcupadas(data.data?.fechasOcupadas || []);
      }
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
    }
  };

  loadFechasOcupadas();
}, [selectedPhotographerId, solicitudPhotographer]);
\\\

**Paso 3:** Modificar el input de fecha en el modal (línea ~680):
\\\	ypescript
<input
  type="date"
  value={solicitudDate}
  onChange={(event) => {
    const fechaSeleccionada = event.target.value;
    if (fechasOcupadas.includes(fechaSeleccionada)) {
      setSolicitudError('Esta fecha ya está ocupada. Por favor elige otra fecha disponible.');
      return;
    }
    setSolicitudDate(fechaSeleccionada);
    setSolicitudError(null);
  }}
  min={new Date().toISOString().split('T')[0]}
  className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
{fechasOcupadas.length > 0 && (
  <p className="text-xs text-slate-500 mt-1">
     {fechasOcupadas.length} fecha(s) no disponible(s) para este fotógrafo
  </p>
)}
\\\

### 3. (OPCIONAL) Mejorar texto del botón de reservas (5 minutos)

**Archivo:** src/app/fotografos/page.tsx

Busca la línea ~338 y cambia:
\\\	sx
// ANTES:
<Button variant="outline">Solicitar disponibilidad</Button>

// DESPUÉS:
<Button variant="outline">
  {startingPrice !== null ? 'Ver paquetes y reservar' : 'Solicitar cotización'}
</Button>
\\\

##  Pruebas

1. **Verificación:**
   - Entra como fotógrafo a /perfil-fotografo
   - Verifica que veas la sección de "Verificación de identidad"
   - Sube un documento y verifica que el admin lo vea en /admin/verificaciones

2. **Fechas ocupadas:**
   - Crea una reserva para un fotógrafo en una fecha específica
   - Intenta crear otra reserva con el mismo fotógrafo en la misma fecha
   - Verifica que muestre mensaje de error

3. **QR y Destacado:**
   - Sube un QR en el perfil del fotógrafo
   - Guarda y recarga la página
   - Verifica que el QR aparezca
   - Prueba el flujo de destacar perfil completo

##  Listo

Tiempo total estimado: **30-45 minutos**

Si encuentras problemas, revisa:
- La consola del navegador para errores
- Los logs del servidor
- Que la base de datos esté sincronizada (\
px prisma db push\)
