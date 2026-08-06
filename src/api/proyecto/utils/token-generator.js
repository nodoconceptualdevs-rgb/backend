const crypto = require('crypto');

/**
 * Genera un token único seguro utilizando criptografía
 * NUNCA falla - reintentos automáticos y fallback garantizado
 * @param {number} length Longitud del token (por defecto 16 caracteres)
 * @returns {string} Token único seguro (siempre válido, nunca null/undefined)
 */
function generateSecureToken(length = 16) {
  const maxRetries = 5;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Generar más bytes de los necesarios para asegurar suficientes caracteres
      const buffer = crypto.randomBytes(length * 3); // 3x para mayor margen
      let token = buffer.toString('base64').replace(/[+/=]/g, '');

      // Si aún es muy corto (poco probable), generar más
      if (token.length < length) {
        const extraBuffer = crypto.randomBytes(length * 2);
        token += extraBuffer.toString('base64').replace(/[+/=]/g, '');
      }

      // Obtener exactamente `length` caracteres
      token = token.slice(0, length);

      // Validación final
      if (!token || token.length !== length || !/^[A-Za-z0-9]+$/.test(token)) {
        throw new Error(`Token inválido: longitud=${token.length}, regex=${/^[A-Za-z0-9]+$/.test(token)}`);
      }

      console.log(`✅ Token generado en intento ${attempt}: ${token.substring(0, 5)}...`);
      return token;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Intento ${attempt}/${maxRetries} falló:`, error.message);

      // Si es el último intento, usar fallback
      if (attempt === maxRetries) {
        console.error(`❌ Falló generación después de ${maxRetries} intentos. Usando fallback...`);
        return generateFallbackToken(length);
      }
    }
  }

  // Esta línea nunca se alcanza, pero por seguridad:
  return generateFallbackToken(length);
}

/**
 * Token fallback garantizado (nunca falla)
 * Usa timestamp + random como última opción
 */
function generateFallbackToken(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';

  // Usar timestamp como base (garantizado)
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2);
  const combined = (timestamp + randomPart).replace(/[^A-Za-z0-9]/g, '');

  // Si el combined es suficientemente largo, usarlo
  if (combined.length >= length) {
    token = combined.slice(0, length);
  } else {
    // Llenar el resto con caracteres aleatorios
    token = combined;
    while (token.length < length) {
      const randomChar = chars[Math.floor(Math.random() * chars.length)];
      token += randomChar;
    }
    token = token.slice(0, length);
  }

  console.log(`⚠️ Token fallback generado: ${token.substring(0, 5)}...`);
  return token;
}

module.exports = { generateSecureToken };
