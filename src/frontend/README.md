# FotoEvento - Proyecto Grupo 16

## Descripción del Proyecto
Este proyecto consiste en la implementación de las páginas D, E y F del marketplace FotoEvento, una plataforma para conectar fotógrafos con clientes.

## Páginas Implementadas

### D. Página de Edición del Perfil (`editar-perfil.html`)
Permite al fotógrafo gestionar toda la información de su perfil público.

**Funcionalidades:**
- ✅ Formulario de información del perfil (Nombre, Especialidad, Biografía)
- ✅ Gestor de galería con drag & drop para subir imágenes
- ✅ Vista previa de imágenes con opción de eliminar
- ✅ Creador de paquetes de servicios con título, descripción y precio
- ✅ Botón "Guardar Cambios" que almacena toda la información
- ✅ Los datos se guardan en localStorage y persisten entre sesiones

### E. Dashboard del Fotógrafo (`dashboard.html`)
Ofrece un resumen visual de la actividad del fotógrafo en la plataforma.

**Funcionalidades:**
- ✅ Título personalizado con el nombre del fotógrafo
- ✅ Mensaje de bienvenida
- ✅ Tarjetas de estadísticas con animación:
  - Visitas al Perfil
  - Nuevas Solicitudes
  - Mensajes sin Leer
- ✅ Accesos rápidos a "Editar Perfil" y "Ver Mensajes"
- ✅ Lista de notificaciones recientes con íconos y marcas de tiempo
- ✅ Actualización automática de estadísticas

### F. Página de Registro de Usuario (`registro.html`)
Permite crear cuentas diferenciando entre Cliente y Fotógrafo.

**Funcionalidades:**
- ✅ Selector de rol (Cliente/Fotógrafo) con botones interactivos
- ✅ Formulario de registro con validación en tiempo real
- ✅ Validación de email
- ✅ Indicador de fortaleza de contraseña
- ✅ Checkbox de términos y condiciones
- ✅ Redirección automática según el rol seleccionado
- ✅ Mensajes de error y éxito animados

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica de las páginas
- **CSS3**: Estilos modernos con animaciones y diseño responsivo
- **JavaScript (ES6+)**: Funcionalidades interactivas y manejo de datos

## Características Técnicas

### Diseño
- ✨ Diseño moderno y limpio siguiendo las imágenes de referencia
- 🎨 Paleta de colores morada (#8b5cf6) como color principal
- 📱 Totalmente responsivo (funciona en móviles, tablets y escritorio)
- ⚡ Animaciones suaves y transiciones elegantes

### JavaScript
- 💾 LocalStorage para persistencia de datos
- 🖼️ Drag & Drop para subir imágenes
- ✅ Validación de formularios en tiempo real
- 🔄 Actualización dinámica de contenido
- 🎯 Event listeners eficientes

### Funcionalidades Especiales
- 📸 Gestor de imágenes con preview
- 📦 Sistema de paquetes de servicios dinámico
- 🔔 Sistema de notificaciones
- 📊 Estadísticas animadas
- 🎨 Indicador de fortaleza de contraseña

## Estructura de Archivos

```
Software/
│
├── editar-perfil.html      # Página D - Edición de perfil
├── dashboard.html          # Página E - Dashboard del fotógrafo
├── registro.html           # Página F - Registro de usuario
│
├── styles.css              # Estilos compartidos para todas las páginas
│
├── editar-perfil.js        # JavaScript para la página de edición
├── dashboard.js            # JavaScript para el dashboard
├── registro.js             # JavaScript para el registro
│
└── README.md              # Este archivo
```

## Cómo Usar el Proyecto

### 1. Iniciar el Servidor Local
Como estás usando XAMPP, los archivos ya están en `c:\xampp\htdocs\Software\`

### 2. Acceder a las Páginas

Abre tu navegador y visita:

- **Registro**: `http://localhost/Software/registro.html`
- **Dashboard**: `http://localhost/Software/dashboard.html`
- **Editar Perfil**: `http://localhost/Software/editar-perfil.html`

### 3. Flujo de Uso Recomendado

1. **Empezar en Registro**: Crea una cuenta como Fotógrafo
2. **Ver Dashboard**: Automáticamente serás redirigido al dashboard
3. **Editar Perfil**: Haz clic en "Editar Perfil y Portafolio"
4. **Agregar Contenido**:
   - Completa tu información personal
   - Sube imágenes a tu portafolio (arrastra o haz clic)
   - Crea paquetes de servicios
   - Guarda los cambios
5. **Volver al Dashboard**: Para ver las estadísticas y notificaciones

## Datos Persistentes

Toda la información se guarda en localStorage del navegador:

- **`photographerProfile`**: Datos del perfil, imágenes y paquetes
- **`currentUser`**: Información del usuario registrado
- **`dashboardStats`**: Estadísticas del dashboard
- **`notifications`**: Notificaciones recientes

## Validaciones Implementadas

### Página de Registro
- ✓ Email con formato válido
- ✓ Contraseña mínimo 6 caracteres
- ✓ Todos los campos obligatorios
- ✓ Aceptación de términos y condiciones

### Página de Edición de Perfil
- ✓ Campos de perfil obligatorios
- ✓ Formato de precio para bolivianos
- ✓ Validación de campos de paquetes antes de agregar

## Características Especiales

### Animaciones
- Fade in para elementos dinámicos
- Slide in para mensajes de notificación
- Números animados en estadísticas
- Hover effects en tarjetas y botones

### Interactividad
- Drag & Drop para subir imágenes
- Vista previa inmediata de imágenes
- Eliminación dinámica de elementos
- Toggle entre roles de usuario
- Indicador de fortaleza de contraseña en tiempo real

## Compatibilidad

✅ **Navegadores Compatibles:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

✅ **Dispositivos:**
- Desktop (1920x1080 y superiores)
- Laptop (1366x768 y superiores)
- Tablet (768px y superiores)
- Mobile (320px y superiores)

## Notas Importantes

1. **LocalStorage**: Los datos se guardan en el navegador local. Si borras los datos del navegador, se perderá la información.

2. **Imágenes**: Las imágenes se guardan como Base64 en localStorage. Para proyectos de producción, se recomienda usar un servidor para almacenar archivos.

3. **Seguridad**: Este es un proyecto educativo. En producción, las contraseñas deberían hashearse y enviarse a un backend seguro.

4. **Responsive**: Todas las páginas son totalmente responsivas y se adaptan a diferentes tamaños de pantalla.

## Autor

**Grupo 16 - Proyecto FotoEvento**
Puntos D, E y F implementados con HTML, CSS y JavaScript

## Fecha de Desarrollo

Octubre 2025

---

¡Disfruta explorando el proyecto! 🎉📷