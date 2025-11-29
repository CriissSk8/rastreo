// Configuración
const ADMIN_PASSWORD = 'admin123'; // Cambia esto por tu contraseña
const STORAGE_KEY = 'visitors_data';

let allVisitors = [];
let filteredVisitors = [];

// Login
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('passwordInput').value;
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        loadVisitors();
    } else {
        document.getElementById('errorMsg').classList.remove('hidden');
        document.getElementById('passwordInput').value = '';
    }
});

// Logout
function logout() {
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('passwordInput').value = '';
    document.getElementById('errorMsg').classList.add('hidden');
}

// Cargar visitantes desde localStorage O desde servidor
async function loadVisitors() {
    // Intentar cargar desde JSONBin si está configurado
    if (typeof CONFIG !== 'undefined' && CONFIG.STORAGE_METHOD === 'jsonbin' && CONFIG.JSONBIN_API_KEY && CONFIG.JSONBIN_BIN_ID) {
        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.JSONBIN_BIN_ID}/latest`, {
                headers: {
                    'X-Master-Key': CONFIG.JSONBIN_API_KEY
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                allVisitors = result.record.visitors || [];
                console.log('✅ Datos cargados desde JSONBin');
            }
        } catch (error) {
            console.log('Error cargando desde JSONBin:', error);
        }
    }
    
    // Si no hay datos del servidor, cargar desde localStorage
    if (allVisitors.length === 0) {
        const stored = localStorage.getItem(STORAGE_KEY);
        allVisitors = stored ? JSON.parse(stored) : [];
    }
    
    filteredVisitors = [...allVisitors];
    
    // Ordenar por fecha más reciente
    allVisitors.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    updateStats();
    updateCountryFilter();
    displayVisitors();
}

// Actualizar estadísticas
function updateStats() {
    const total = allVisitors.length;
    const withGPS = allVisitors.filter(v => v.location?.latitude).length;
    const countries = new Set(allVisitors.map(v => v.ip?.country).filter(Boolean));
    const lastVisit = allVisitors.length > 0 ? formatDate(allVisitors[0].timestamp) : '-';
    
    document.getElementById('totalVisitors').textContent = total;
    document.getElementById('gpsCount').textContent = withGPS;
    document.getElementById('countryCount').textContent = countries.size;
    document.getElementById('lastVisit').textContent = lastVisit;
    document.getElementById('visitorCount').textContent = `${total} visitante${total !== 1 ? 's' : ''}`;
}

// Actualizar filtro de países
function updateCountryFilter() {
    const countries = new Set(allVisitors.map(v => v.ip?.country).filter(Boolean));
    const select = document.getElementById('countryFilter');
    
    // Limpiar opciones existentes excepto la primera
    select.innerHTML = '<option value="">Todos los países</option>';
    
    // Agregar países
    [...countries].sort().forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        select.appendChild(option);
    });
}

// Mostrar visitantes en la tabla
function displayVisitors() {
    const tbody = document.getElementById('visitorsTable');
    const noData = document.getElementById('noData');
    
    if (filteredVisitors.length === 0) {
        tbody.innerHTML = '';
        noData.classList.remove('hidden');
        return;
    }
    
    noData.classList.add('hidden');
    
    tbody.innerHTML = filteredVisitors.map((visitor, index) => {
        const hasGPS = visitor.location?.latitude;
        const lat = hasGPS ? visitor.location.latitude : visitor.ip?.latitude;
        const lon = hasGPS ? visitor.location.longitude : visitor.ip?.longitude;
        const accuracy = hasGPS ? 'GPS Preciso' : 'IP Aproximado';
        const accuracyColor = hasGPS ? 'text-green-400' : 'text-yellow-400';
        
        return `
            <tr class="hover:bg-gray-700 transition">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${index + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    ${formatDate(visitor.timestamp)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="text-blue-400 font-mono">${visitor.ip?.ip || 'N/A'}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-300">
                    <div class="flex items-center">
                        <i class="fas fa-map-marker-alt mr-2 ${accuracyColor}"></i>
                        <div>
                            <div>${visitor.ip?.city || 'N/A'}, ${visitor.ip?.country || 'N/A'}</div>
                            <div class="text-xs text-gray-500">${accuracy}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-300">
                    ${lat && lon ? `
                        <div class="font-mono text-xs">
                            ${lat.toFixed(4)}, ${lon.toFixed(4)}
                        </div>
                    ` : 'N/A'}
                </td>
                <td class="px-6 py-4 text-sm text-gray-300">
                    ${visitor.ip?.isp || 'N/A'}
                </td>
                <td class="px-6 py-4 text-sm text-gray-300">
                    <div class="flex items-center">
                        ${getDeviceIcon(visitor.browser?.platform)}
                        <span class="ml-2">${getDeviceName(visitor.browser?.platform)}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button onclick="showDetails(${index})" class="text-blue-400 hover:text-blue-300 mr-3">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${lat && lon ? `
                        <a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank" class="text-green-400 hover:text-green-300">
                            <i class="fas fa-map"></i>
                        </a>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// Filtrar visitantes
function filterVisitors() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const countryFilter = document.getElementById('countryFilter').value;
    
    filteredVisitors = allVisitors.filter(visitor => {
        const matchesSearch = !searchTerm || 
            visitor.ip?.ip?.toLowerCase().includes(searchTerm) ||
            visitor.ip?.city?.toLowerCase().includes(searchTerm) ||
            visitor.ip?.country?.toLowerCase().includes(searchTerm) ||
            visitor.ip?.isp?.toLowerCase().includes(searchTerm);
        
        const matchesCountry = !countryFilter || visitor.ip?.country === countryFilter;
        
        return matchesSearch && matchesCountry;
    });
    
    displayVisitors();
}

// Mostrar detalles del visitante
function showDetails(index) {
    const visitor = filteredVisitors[index];
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('modalContent');
    
    const hasGPS = visitor.location?.latitude;
    const lat = hasGPS ? visitor.location.latitude : visitor.ip?.latitude;
    const lon = hasGPS ? visitor.location.longitude : visitor.ip?.longitude;
    
    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-700 p-4 rounded-lg">
                <h3 class="font-bold text-lg mb-3 text-blue-400">
                    <i class="fas fa-clock mr-2"></i>Información General
                </h3>
                <div class="space-y-2 text-sm">
                    <p><strong>Fecha:</strong> ${formatDate(visitor.timestamp)}</p>
                    <p><strong>Timestamp:</strong> ${visitor.timestamp}</p>
                </div>
            </div>
            
            <div class="bg-gray-700 p-4 rounded-lg">
                <h3 class="font-bold text-lg mb-3 text-green-400">
                    <i class="fas fa-map-marker-alt mr-2"></i>Ubicación
                </h3>
                <div class="space-y-2 text-sm">
                    ${hasGPS ? `
                        <p class="text-green-400"><strong>GPS Preciso:</strong></p>
                        <p><strong>Latitud:</strong> ${visitor.location.latitude}</p>
                        <p><strong>Longitud:</strong> ${visitor.location.longitude}</p>
                        <p><strong>Precisión:</strong> ${visitor.location.accuracy}m</p>
                        ${visitor.location.displayName ? `<p><strong>Dirección:</strong> ${visitor.location.displayName}</p>` : ''}
                    ` : `
                        <p class="text-yellow-400"><strong>Ubicación por IP:</strong></p>
                        <p><strong>Ciudad:</strong> ${visitor.ip?.city || 'N/A'}</p>
                        <p><strong>Región:</strong> ${visitor.ip?.region || 'N/A'}</p>
                        <p><strong>País:</strong> ${visitor.ip?.country || 'N/A'}</p>
                        <p><strong>Código Postal:</strong> ${visitor.ip?.postal || 'N/A'}</p>
                        <p><strong>Lat/Lon:</strong> ${visitor.ip?.latitude}, ${visitor.ip?.longitude}</p>
                    `}
                </div>
            </div>
            
            <div class="bg-gray-700 p-4 rounded-lg">
                <h3 class="font-bold text-lg mb-3 text-purple-400">
                    <i class="fas fa-network-wired mr-2"></i>Red
                </h3>
                <div class="space-y-2 text-sm">
                    <p><strong>IP:</strong> <span class="font-mono text-blue-400">${visitor.ip?.ip || 'N/A'}</span></p>
                    <p><strong>ISP:</strong> ${visitor.ip?.isp || 'N/A'}</p>
                    <p><strong>Timezone:</strong> ${visitor.ip?.timezone || visitor.timezone?.timezone || 'N/A'}</p>
                    ${visitor.ipExtra ? `
                        <p><strong>Móvil:</strong> ${visitor.ipExtra.mobile ? 'Sí' : 'No'}</p>
                        <p><strong>Proxy:</strong> ${visitor.ipExtra.proxy ? 'Sí' : 'No'}</p>
                    ` : ''}
                </div>
            </div>
            
            <div class="bg-gray-700 p-4 rounded-lg">
                <h3 class="font-bold text-lg mb-3 text-orange-400">
                    <i class="fas fa-laptop mr-2"></i>Dispositivo
                </h3>
                <div class="space-y-2 text-sm">
                    <p><strong>Plataforma:</strong> ${visitor.browser?.platform || 'N/A'}</p>
                    <p><strong>Idioma:</strong> ${visitor.browser?.language || 'N/A'}</p>
                    <p><strong>Pantalla:</strong> ${visitor.screen?.width}x${visitor.screen?.height}</p>
                    <p><strong>Viewport:</strong> ${visitor.viewport?.width}x${visitor.viewport?.height}</p>
                    <p><strong>User Agent:</strong> <span class="text-xs break-all">${visitor.browser?.userAgent || 'N/A'}</span></p>
                </div>
            </div>
        </div>
        
        ${lat && lon ? `
            <div class="mt-4">
                <a href="https://www.google.com/maps?q=${lat},${lon}" 
                   target="_blank" 
                   class="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition">
                    <i class="fas fa-map-marked-alt mr-2"></i>Ver en Google Maps
                </a>
            </div>
        ` : ''}
        
        <div class="mt-4">
            <button onclick="copyVisitorData(${index})" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
                <i class="fas fa-copy mr-2"></i>Copiar Datos JSON
            </button>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Cerrar modal
function closeModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

// Copiar datos de un visitante
function copyVisitorData(index) {
    const visitor = filteredVisitors[index];
    const json = JSON.stringify(visitor, null, 2);
    navigator.clipboard.writeText(json).then(() => {
        alert('✅ Datos copiados al portapapeles');
    });
}

// Exportar todos los datos
function exportData() {
    const json = JSON.stringify(allVisitors, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitantes_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Limpiar datos
function clearData() {
    if (confirm('¿Estás seguro de que quieres eliminar todos los datos de visitantes?')) {
        localStorage.removeItem(STORAGE_KEY);
        allVisitors = [];
        filteredVisitors = [];
        updateStats();
        displayVisitors();
        updateCountryFilter();
    }
}

// Actualizar datos
function refreshData() {
    loadVisitors();
}

// Formatear fecha
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Obtener icono de dispositivo
function getDeviceIcon(platform) {
    if (!platform) return '<i class="fas fa-question-circle text-gray-500"></i>';
    
    const p = platform.toLowerCase();
    if (p.includes('win')) return '<i class="fab fa-windows text-blue-400"></i>';
    if (p.includes('mac')) return '<i class="fab fa-apple text-gray-400"></i>';
    if (p.includes('linux')) return '<i class="fab fa-linux text-yellow-400"></i>';
    if (p.includes('android')) return '<i class="fab fa-android text-green-400"></i>';
    if (p.includes('iphone') || p.includes('ipad')) return '<i class="fab fa-apple text-gray-400"></i>';
    return '<i class="fas fa-desktop text-gray-400"></i>';
}

// Obtener nombre de dispositivo
function getDeviceName(platform) {
    if (!platform) return 'Desconocido';
    
    const p = platform.toLowerCase();
    if (p.includes('win')) return 'Windows';
    if (p.includes('mac')) return 'macOS';
    if (p.includes('linux')) return 'Linux';
    if (p.includes('android')) return 'Android';
    if (p.includes('iphone')) return 'iPhone';
    if (p.includes('ipad')) return 'iPad';
    return platform;
}

// Cerrar modal al hacer clic fuera
document.getElementById('detailModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'detailModal') {
        closeModal();
    }
});

// Auto-refresh cada 30 segundos
setInterval(() => {
    loadVisitors();
}, 30000);
