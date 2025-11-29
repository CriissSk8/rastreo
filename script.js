// Variables globales para almacenar datos de visitantes
let visitorData = {
    timestamp: new Date().toISOString(),
    location: {},
    ip: {},
    browser: {},
    screen: {}
};

// Capturar información del navegador y dispositivo
function captureDeviceInfo() {
    visitorData.browser = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookiesEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
    };
    
    visitorData.screen = {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio
    };
    
    visitorData.viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };
}

// Obtener IP y datos de geolocalización por IP (múltiples fuentes)
async function getIPInfo() {
    try {
        // Intentar con ipapi.co primero
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        visitorData.ip = {
            ip: data.ip,
            city: data.city,
            region: data.region,
            country: data.country_name,
            countryCode: data.country_code,
            postal: data.postal,
            latitude: data.latitude,
            longitude: data.longitude,
            timezone: data.timezone,
            isp: data.org,
            accuracy: 'Ciudad/ISP (~5-50km)'
        };
        updateAdminPanel();
        
        // Obtener datos adicionales de otra API
        getAdditionalIPData();
    } catch (error) {
        console.log('Error obteniendo IP:', error);
        // Intentar con API alternativa
        try {
            const response2 = await fetch('https://api.ipify.org?format=json');
            const data2 = await response2.json();
            visitorData.ip.ip = data2.ip;
            updateAdminPanel();
        } catch (error2) {
            console.log('Error con API alternativa:', error2);
        }
    }
}

// Obtener datos adicionales de IP
async function getAdditionalIPData() {
    try {
        const response = await fetch('http://ip-api.com/json/');
        const data = await response.json();
        if (data.status === 'success') {
            visitorData.ipExtra = {
                lat: data.lat,
                lon: data.lon,
                city: data.city,
                region: data.regionName,
                country: data.country,
                zip: data.zip,
                isp: data.isp,
                org: data.org,
                as: data.as,
                mobile: data.mobile,
                proxy: data.proxy
            };
            updateAdminPanel();
        }
    } catch (error) {
        console.log('Error obteniendo datos extra:', error);
    }
}

// Obtener ubicación GPS precisa (solo si el usuario da permiso)
function getGPSLocation() {
    if ('geolocation' in navigator) {
        // Intentar sin mostrar prompt (solo funciona si ya se dio permiso antes)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                visitorData.location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    altitudeAccuracy: position.coords.altitudeAccuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                    timestamp: position.timestamp,
                    method: 'GPS'
                };
                updateAdminPanel();
                // Obtener dirección desde coordenadas
                getReverseGeocode(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                // No hacer nada si se niega el permiso (más discreto)
                visitorData.location.gpsStatus = 'Permiso denegado o no disponible';
                updateAdminPanel();
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }
}

// Obtener ubicación aproximada por WiFi/Cell towers (sin permiso explícito)
async function getApproximateLocation() {
    try {
        // Usar API de Google para geolocalización por WiFi/Cell
        // Nota: Requiere API key, pero puedes usar otras alternativas
        const response = await fetch('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyDummy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                considerIp: true
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            visitorData.wifiLocation = {
                latitude: data.location.lat,
                longitude: data.location.lng,
                accuracy: data.accuracy,
                method: 'WiFi/Cell'
            };
            updateAdminPanel();
        }
    } catch (error) {
        console.log('WiFi location no disponible:', error);
    }
}

// Obtener dirección desde coordenadas GPS
async function getReverseGeocode(lat, lon) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await response.json();
        visitorData.location.address = data.address;
        visitorData.location.displayName = data.display_name;
        updateAdminPanel();
    } catch (error) {
        console.log('Error en geocodificación inversa:', error);
    }
}

// Actualizar panel de administración
function updateAdminPanel() {
    const panel = document.getElementById('visitorData');
    
    let html = '<div class="space-y-3">';
    
    // Timestamp
    html += `<div class="bg-gray-100 p-2 rounded">
        <strong class="text-purple-600">⏰ Timestamp:</strong><br>
        <span class="text-xs">${visitorData.timestamp}</span>
    </div>`;
    
    // Ubicación GPS
    if (visitorData.location.latitude) {
        html += `<div class="bg-green-100 p-2 rounded">
            <strong class="text-green-700">📍 GPS Preciso:</strong><br>
            <span class="text-xs">Lat: ${visitorData.location.latitude.toFixed(6)}</span><br>
            <span class="text-xs">Lon: ${visitorData.location.longitude.toFixed(6)}</span><br>
            <span class="text-xs">Precisión: ${visitorData.location.accuracy.toFixed(0)}m</span><br>
            ${visitorData.location.displayName ? `<span class="text-xs mt-1 block">${visitorData.location.displayName}</span>` : ''}
            <a href="https://www.google.com/maps?q=${visitorData.location.latitude},${visitorData.location.longitude}" 
               target="_blank" 
               class="text-blue-600 text-xs underline mt-1 block">
               Ver en Google Maps
            </a>
        </div>`;
    } else if (visitorData.location.error) {
        html += `<div class="bg-yellow-100 p-2 rounded">
            <strong class="text-yellow-700">⚠️ GPS:</strong><br>
            <span class="text-xs">${visitorData.location.error}</span>
        </div>`;
    }
    
    // Información de IP
    if (visitorData.ip.ip) {
        html += `<div class="bg-blue-100 p-2 rounded">
            <strong class="text-blue-700">🌐 Ubicación por IP:</strong><br>
            <span class="text-xs">IP: ${visitorData.ip.ip}</span><br>
            <span class="text-xs">Ciudad: ${visitorData.ip.city}</span><br>
            <span class="text-xs">País: ${visitorData.ip.country}</span><br>
            <span class="text-xs">ISP: ${visitorData.ip.isp}</span><br>
            <span class="text-xs">Lat/Lon: ${visitorData.ip.latitude}, ${visitorData.ip.longitude}</span><br>
            <span class="text-xs text-gray-600">${visitorData.ip.accuracy}</span>
            <a href="https://www.google.com/maps?q=${visitorData.ip.latitude},${visitorData.ip.longitude}" 
               target="_blank" 
               class="text-blue-600 text-xs underline mt-1 block">
               Ver en Google Maps
            </a>
        </div>`;
    }
    
    // Datos extra de IP
    if (visitorData.ipExtra) {
        html += `<div class="bg-cyan-100 p-2 rounded">
            <strong class="text-cyan-700">🌐 Datos IP Extra:</strong><br>
            <span class="text-xs">Lat/Lon: ${visitorData.ipExtra.lat}, ${visitorData.ipExtra.lon}</span><br>
            <span class="text-xs">ZIP: ${visitorData.ipExtra.zip}</span><br>
            <span class="text-xs">Móvil: ${visitorData.ipExtra.mobile ? 'Sí' : 'No'}</span><br>
            <span class="text-xs">Proxy: ${visitorData.ipExtra.proxy ? 'Sí' : 'No'}</span>
        </div>`;
    }
    
    // Estimación por zona horaria
    if (visitorData.timezoneEstimate) {
        html += `<div class="bg-orange-100 p-2 rounded">
            <strong class="text-orange-700">🕐 Estimación por Timezone:</strong><br>
            <span class="text-xs">Ciudad probable: ${visitorData.timezoneEstimate.city}</span><br>
            <span class="text-xs">Lat/Lon: ${visitorData.timezoneEstimate.lat}, ${visitorData.timezoneEstimate.lon}</span><br>
            <span class="text-xs text-gray-600">${visitorData.timezoneEstimate.accuracy}</span>
        </div>`;
    }
    
    // Información del navegador
    html += `<div class="bg-purple-100 p-2 rounded">
        <strong class="text-purple-700">💻 Dispositivo:</strong><br>
        <span class="text-xs">Plataforma: ${visitorData.browser.platform}</span><br>
        <span class="text-xs">Idioma: ${visitorData.browser.language}</span><br>
        <span class="text-xs">Pantalla: ${visitorData.screen.width}x${visitorData.screen.height}</span>
    </div>`;
    
    html += '</div>';
    
    panel.innerHTML = html;
    
    // Enviar datos a consola para que puedas verlos
    console.log('=== DATOS DEL VISITANTE ===');
    console.log(JSON.stringify(visitorData, null, 2));
}

// Toggle panel de administración
function toggleAdmin() {
    const panel = document.getElementById('adminPanel');
    panel.classList.toggle('hidden');
}

// Copiar todos los datos
function copyAllData() {
    const dataString = JSON.stringify(visitorData, null, 2);
    navigator.clipboard.writeText(dataString).then(() => {
        alert('✅ Datos copiados al portapapeles');
    });
}

// Atajo de teclado para mostrar panel admin: Ctrl+Shift+A
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        toggleAdmin();
    }
});

// Obtener zona horaria y estimar ubicación
function getTimezoneLocation() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    visitorData.timezone = {
        timezone: timezone,
        offset: new Date().getTimezoneOffset(),
        locale: Intl.DateTimeFormat().resolvedOptions().locale
    };
    
    // Estimar ubicación aproximada por zona horaria
    const tzCoords = {
        'America/New_York': { lat: 40.7128, lon: -74.0060, city: 'New York' },
        'America/Chicago': { lat: 41.8781, lon: -87.6298, city: 'Chicago' },
        'America/Los_Angeles': { lat: 34.0522, lon: -118.2437, city: 'Los Angeles' },
        'America/Mexico_City': { lat: 19.4326, lon: -99.1332, city: 'Ciudad de México' },
        'America/Argentina/Buenos_Aires': { lat: -34.6037, lon: -58.3816, city: 'Buenos Aires' },
        'America/Sao_Paulo': { lat: -23.5505, lon: -46.6333, city: 'São Paulo' },
        'Europe/London': { lat: 51.5074, lon: -0.1278, city: 'London' },
        'Europe/Paris': { lat: 48.8566, lon: 2.3522, city: 'Paris' },
        'Europe/Madrid': { lat: 40.4168, lon: -3.7038, city: 'Madrid' },
        'Europe/Berlin': { lat: 52.5200, lon: 13.4050, city: 'Berlin' },
        'Asia/Tokyo': { lat: 35.6762, lon: 139.6503, city: 'Tokyo' },
        'Asia/Shanghai': { lat: 31.2304, lon: 121.4737, city: 'Shanghai' },
        'Asia/Dubai': { lat: 25.2048, lon: 55.2708, city: 'Dubai' },
        'Australia/Sydney': { lat: -33.8688, lon: 151.2093, city: 'Sydney' }
    };
    
    if (tzCoords[timezone]) {
        visitorData.timezoneEstimate = {
            ...tzCoords[timezone],
            accuracy: 'Zona horaria (~100-500km)',
            method: 'Timezone'
        };
    }
}

// Inicializar captura de datos al cargar la página
window.addEventListener('load', () => {
    captureDeviceInfo();
    getTimezoneLocation();
    getIPInfo();
    
    // Intentar ubicación aproximada
    setTimeout(() => {
        getApproximateLocation();
    }, 1000);
    
    // Intentar GPS (solo si ya se dio permiso antes, no molesta al usuario)
    setTimeout(() => {
        getGPSLocation();
    }, 3000);
});

// Guardar datos en localStorage Y enviar a servidor
const STORAGE_KEY = 'visitors_data';

// Enviar datos al servidor/webhook
async function sendToServer(data) {
    // Método 1: JSONBin.io (requiere configuración)
    if (CONFIG.STORAGE_METHOD === 'jsonbin' && CONFIG.JSONBIN_API_KEY && CONFIG.JSONBIN_BIN_ID) {
        try {
            // Primero obtener datos existentes
            const getResponse = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.JSONBIN_BIN_ID}/latest`, {
                headers: {
                    'X-Master-Key': CONFIG.JSONBIN_API_KEY
                }
            });
            
            let allData = [];
            if (getResponse.ok) {
                const result = await getResponse.json();
                allData = result.record.visitors || [];
            }
            
            // Agregar nuevo visitante
            allData.push(data);
            
            // Actualizar bin
            const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.JSONBIN_BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': CONFIG.JSONBIN_API_KEY
                },
                body: JSON.stringify({ visitors: allData })
            });
            
            if (updateResponse.ok) {
                console.log('✅ Datos enviados a JSONBin');
            }
        } catch (error) {
            console.log('Error enviando a JSONBin:', error);
        }
    }
    
    // Método 2: Discord Webhook
    if (CONFIG.STORAGE_METHOD === 'discord' && CONFIG.DISCORD_WEBHOOK) {
        try {
            const embed = {
                title: '🎯 Nuevo Visitante',
                color: 3447003,
                fields: [
                    { name: '📍 Ubicación', value: `${data.ip?.city || 'N/A'}, ${data.ip?.country || 'N/A'}`, inline: true },
                    { name: '🌐 IP', value: data.ip?.ip || 'N/A', inline: true },
                    { name: '📱 Dispositivo', value: data.browser?.platform || 'N/A', inline: true },
                    { name: '🗺️ Coordenadas', value: data.location?.latitude ? `${data.location.latitude}, ${data.location.longitude}` : `${data.ip?.latitude}, ${data.ip?.longitude}`, inline: false },
                    { name: '🔗 Google Maps', value: data.location?.latitude ? `[Ver ubicación](https://www.google.com/maps?q=${data.location.latitude},${data.location.longitude})` : `[Ver ubicación](https://www.google.com/maps?q=${data.ip?.latitude},${data.ip?.longitude})`, inline: false }
                ],
                timestamp: new Date().toISOString()
            };
            
            await fetch(CONFIG.DISCORD_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
            
            console.log('✅ Datos enviados a Discord');
        } catch (error) {
            console.log('Error enviando a Discord:', error);
        }
    }
    
    // Método 3: Email (FormSubmit)
    if (CONFIG.STORAGE_METHOD === 'email' && CONFIG.EMAIL_ENDPOINT) {
        try {
            const formData = new FormData();
            formData.append('Visitante', JSON.stringify(data, null, 2));
            formData.append('IP', data.ip?.ip || 'N/A');
            formData.append('Ubicacion', `${data.ip?.city}, ${data.ip?.country}`);
            formData.append('Coordenadas', data.location?.latitude ? `${data.location.latitude}, ${data.location.longitude}` : `${data.ip?.latitude}, ${data.ip?.longitude}`);
            
            await fetch(CONFIG.EMAIL_ENDPOINT, {
                method: 'POST',
                body: formData
            });
            
            console.log('✅ Datos enviados por email');
        } catch (error) {
            console.log('Error enviando email:', error);
        }
    }
}

function saveVisitorData() {
    // Guardar localmente
    const allVisitors = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const exists = allVisitors.some(v => v.timestamp === visitorData.timestamp);
    
    if (!exists && (visitorData.ip.ip || visitorData.location.latitude)) {
        allVisitors.push(visitorData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allVisitors));
        console.log('✅ Datos guardados localmente');
        
        // Enviar al servidor
        sendToServer(visitorData);
    }
}

// Guardar datos cada 5 segundos
setInterval(saveVisitorData, 5000);

// Guardar inmediatamente cuando se obtienen datos importantes
window.addEventListener('beforeunload', saveVisitorData);
