// Configuración para almacenamiento en la nube
// Usa JSONBin.io (gratuito) para almacenar datos de visitantes

const CONFIG = {
    // Crea tu API key gratis en: https://jsonbin.io/
    // 1. Ve a https://jsonbin.io/
    // 2. Regístrate gratis
    // 3. Copia tu API key
    // 4. Pégala aquí:
    JSONBIN_API_KEY: '$2a$10$TU_API_KEY_AQUI',
    
    // Después de crear tu primera bin, pega el ID aquí:
    JSONBIN_BIN_ID: 'TU_BIN_ID_AQUI',
    
    // Alternativamente, usa un webhook de Discord, Telegram, o email
    // Para Discord: Crea un webhook en tu servidor y pega la URL aquí
    DISCORD_WEBHOOK: '',
    
    // Para recibir por email (usando FormSubmit.co - gratis)
    EMAIL_ENDPOINT: 'https://formsubmit.co/tu_email@ejemplo.com',
    
    // Método de almacenamiento: 'jsonbin', 'discord', 'email', 'local'
    STORAGE_METHOD: 'local' // Cambia a 'jsonbin', 'discord' o 'email' cuando configures
};

// No edites esto
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
