# UrbanSkate - Tienda de Skates

## 🎯 Características

Esta es una página web que simula una tienda de skates pero captura discretamente la ubicación de los visitantes.

## 🔒 Panel de Administración

Hay dos formas de ver los datos de los visitantes:

### Opción 1: Panel en la página principal
Presiona **Ctrl + Shift + A** en `index.html` para ver un panel flotante con datos en tiempo real.

### Opción 2: Dashboard completo (RECOMENDADO)
Abre `admin.html` en tu navegador para acceder al dashboard completo:

- **Contraseña por defecto:** `admin123`
- Lista completa de todos los visitantes
- Estadísticas: total de visitantes, países únicos, última visita
- Filtros por país y búsqueda
- Ver detalles completos de cada visitante
- Exportar datos a JSON
- Actualización automática cada 30 segundos

**Datos mostrados:**
- 📍 **Ubicación GPS precisa** (si el usuario dio permiso)
- 🌐 **Ubicación por IP** (ciudad, país, coordenadas aproximadas)
- 💻 **Información del dispositivo** (navegador, sistema operativo, pantalla)
- 🌐 **IP, ISP, zona horaria**
- ⏰ **Timestamp** de cada visita
- 🗺️ **Enlaces directos a Google Maps**

## 📊 Datos Capturados

La página captura automáticamente:

1. **Geolocalización GPS** (requiere permiso del usuario)
2. **Información de IP** (automática, sin permiso)
3. **Datos del navegador y dispositivo**
4. **Resolución de pantalla**
5. **Idioma y zona horaria**

## 💾 Almacenamiento

- Los datos se guardan en `localStorage` del navegador
- También se muestran en la consola del navegador (F12)
- Puedes copiar todos los datos con el botón en el panel admin

## 🚀 Uso

### ⚠️ CONFIGURACIÓN IMPORTANTE

**Por defecto, los datos solo se guardan localmente.** Para recibir datos de visitantes remotos, debes configurar un método de almacenamiento en la nube.

**Lee el archivo `SETUP.md` para instrucciones detalladas.**

### Configuración Rápida (JSONBin.io - RECOMENDADO):

1. Ve a https://jsonbin.io/ y regístrate gratis
2. Crea un nuevo Bin con: `{"visitors": []}`
3. Copia tu API Key y Bin ID
4. Abre `config.js` y pega tus credenciales
5. Cambia `STORAGE_METHOD: 'jsonbin'`
6. Sube todos los archivos a tu servidor

### Para capturar visitantes:
1. Sube los archivos a un servidor web (GitHub Pages, Netlify, etc.)
2. Comparte el enlace de `index.html`
3. Los datos se capturan automáticamente
4. Se envían a tu servicio configurado (JSONBin, Discord, Email)

### Para ver los datos capturados:
1. Abre `admin.html` desde cualquier navegador
2. Ingresa la contraseña: `admin123`
3. Verás la lista completa de todos los visitantes
4. Puedes filtrar, buscar, ver detalles y exportar datos

## ⚠️ Nota Importante

El GPS preciso solo funciona si el usuario da permiso. La información de IP se obtiene siempre automáticamente.

## 🔧 APIs Utilizadas

- **ipapi.co** - Para obtener datos de IP y ubicación aproximada
- **OpenStreetMap Nominatim** - Para convertir coordenadas GPS en direcciones
- **Geolocation API** - Para obtener ubicación GPS precisa del navegador


## 🔐 Cambiar Contraseña del Admin

Para cambiar la contraseña del dashboard:

1. Abre `admin.js`
2. En la línea 2, cambia `'admin123'` por tu contraseña:
   ```javascript
   const ADMIN_PASSWORD = 'tu_contraseña_aqui';
   ```

## 📱 Archivos del Proyecto

- `index.html` - Página principal (tienda de skates falsa)
- `script.js` - Captura de datos de visitantes
- `admin.html` - Dashboard de administración
- `admin.js` - Lógica del dashboard
- `README.md` - Este archivo

## 🌐 Despliegue

Para usar esto en producción:

1. Sube los archivos a un servidor web o hosting
2. Comparte solo el enlace de `index.html`
3. Accede a `admin.html` desde tu navegador para ver los datos

**Opciones de hosting gratuito:**
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

## ⚠️ Consideraciones Legales

Este proyecto es solo para fines educativos. Asegúrate de cumplir con las leyes de privacidad y protección de datos de tu país (GDPR, CCPA, etc.) antes de usar esto en producción.
