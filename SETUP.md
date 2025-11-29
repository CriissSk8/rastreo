# 🚀 Guía de Configuración para Recibir Datos Remotos

Como localStorage solo funciona localmente, necesitas configurar un método para recibir los datos de visitantes remotos.

## 📋 Opciones Disponibles

### Opción 1: JSONBin.io (RECOMENDADO - Más completo)

**Ventajas:** Dashboard completo, todos los datos en un lugar, fácil de consultar

**Pasos:**

1. Ve a https://jsonbin.io/
2. Regístrate gratis (no requiere tarjeta)
3. Crea un nuevo "Bin":
   - Click en "Create Bin"
   - Pega este contenido inicial:
   ```json
   {
     "visitors": []
   }
   ```
   - Click en "Create"
4. Copia el **Bin ID** (aparece en la URL, ejemplo: `65a1b2c3d4e5f6g7h8i9j0k1`)
5. Ve a tu perfil y copia tu **API Key** (X-Master-Key)
6. Abre `config.js` y configura:
   ```javascript
   JSONBIN_API_KEY: '$2a$10$tu_api_key_aqui',
   JSONBIN_BIN_ID: '65a1b2c3d4e5f6g7h8i9j0k1',
   STORAGE_METHOD: 'jsonbin'
   ```
7. Sube todos los archivos a tu servidor
8. ¡Listo! Ahora `admin.html` mostrará todos los visitantes

---

### Opción 2: Discord Webhook (Notificaciones en tiempo real)

**Ventajas:** Recibes notificación instantánea cada vez que alguien visita

**Pasos:**

1. Abre Discord y ve a tu servidor (o crea uno)
2. Ve a Configuración del Canal → Integraciones → Webhooks
3. Click en "Nuevo Webhook"
4. Copia la URL del webhook
5. Abre `config.js` y configura:
   ```javascript
   DISCORD_WEBHOOK: 'https://discord.com/api/webhooks/123456789/tu_webhook_aqui',
   STORAGE_METHOD: 'discord'
   ```
6. Cada visitante enviará un mensaje a tu canal de Discord con:
   - IP, ubicación, coordenadas
   - Enlace directo a Google Maps
   - Información del dispositivo

**Nota:** Discord no almacena los datos en formato consultable, solo notificaciones.

---

### Opción 3: Email (FormSubmit.co)

**Ventajas:** Recibes los datos por email, no requiere registro

**Pasos:**

1. Abre `config.js` y configura:
   ```javascript
   EMAIL_ENDPOINT: 'https://formsubmit.co/tu_email@ejemplo.com',
   STORAGE_METHOD: 'email'
   ```
2. La primera vez que alguien visite, FormSubmit te enviará un email de confirmación
3. Confirma tu email
4. A partir de ahí, recibirás un email por cada visitante

**Nota:** Los emails pueden ir a spam. No tendrás dashboard, solo emails.

---

### Opción 4: Telegram Bot (Avanzado)

Si prefieres Telegram, puedes crear un bot:

1. Habla con @BotFather en Telegram
2. Crea un bot con `/newbot`
3. Obtén el token del bot
4. Obtén tu Chat ID hablando con @userinfobot
5. Modifica `script.js` para enviar a:
   ```
   https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>&text=...
   ```

---

## 🎯 ¿Cuál elegir?

- **Para ver dashboard completo:** JSONBin.io
- **Para notificaciones instantáneas:** Discord Webhook
- **Para simplicidad máxima:** Email
- **Para privacidad total:** Crea tu propio backend (PHP, Node.js, etc.)

---

## 🔧 Solución Alternativa: Backend Propio

Si tienes un servidor con PHP, puedes crear un archivo `save.php`:

```php
<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$file = 'visitors.json';

$visitors = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
$visitors[] = $data;

file_put_contents($file, json_encode($visitors));

echo json_encode(['success' => true]);
?>
```

Y en `config.js`:
```javascript
STORAGE_METHOD: 'custom',
CUSTOM_ENDPOINT: 'https://tu-servidor.com/save.php'
```

---

## ✅ Verificar que Funciona

1. Configura uno de los métodos arriba
2. Abre `index.html` desde el servidor
3. Espera 5-10 segundos
4. Verifica:
   - **JSONBin:** Abre admin.html y deberías ver tu visita
   - **Discord:** Deberías recibir un mensaje en Discord
   - **Email:** Deberías recibir un email

---

## ⚠️ Importante

- Nunca compartas tu API key o webhook públicamente
- Los webhooks de Discord pueden ser abusados si se exponen
- JSONBin tiene límite de 10,000 requests/mes en plan gratuito
- Considera las leyes de privacidad de tu país
