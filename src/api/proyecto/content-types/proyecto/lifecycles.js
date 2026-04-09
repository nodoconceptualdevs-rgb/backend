// Usar crypto nativo de Node.js (módulo estándar, no requiere instalación)
const crypto = require('crypto');

/**
 * Genera un token único seguro utilizando criptografía
 * @param {number} length Longitud del token (por defecto 16 caracteres)
 * @returns {string} Token único seguro
 */
function generateSecureToken(length = 16) {
  // Generar más bytes de los necesarios para asegurar tener suficientes después de limpiar
  const buffer = crypto.randomBytes(length * 2); // Generar el doble para compensar caracteres eliminados
  let token = buffer.toString('base64')
    .replace(/[+/=]/g, ''); // Eliminar caracteres no alfanuméricos
  
  // Asegurar longitud exacta
  while (token.length < length) {
    // Si aún es muy corto, generar más
    const extraBuffer = crypto.randomBytes(length);
    token += extraBuffer.toString('base64').replace(/[+/=]/g, '');
  }
  
  return token.slice(0, length);
}

module.exports = {
  /**
   * Genera token NFC único antes de crear el proyecto
   */
  async beforeCreate(event) {
    const { data } = event.params;
    
    // Si no tiene token, generar uno único
    if (!data.token_nfc) {
      data.token_nfc = generateSecureToken(16);
      console.log('✅ Token NFC generado:', data.token_nfc);
    }
  },

  /**
   * Crea los 7 hitos predeterminados después de crear el proyecto
   */
  async afterCreate(event) {
    const { result } = event;
    
    const hitosIniciales = [
      { nombre: 'Conceptualización (Diseño)', orden: 1 },
      { nombre: 'Planificación (Técnico)', orden: 2 },
      { nombre: 'Visualización 3D', orden: 3 },
      { nombre: 'Adquisición de Materiales', orden: 4 },
      { nombre: 'Ejecución (Obra Gris)', orden: 5 },
      { nombre: 'Acabados y Decoración', orden: 6 },
      { nombre: 'Entrega Final', orden: 7 }
    ];
    
    console.log(`📝 Creando ${hitosIniciales.length} hitos para proyecto ID: ${result.id}`);
    
    for (const hito of hitosIniciales) {
      await strapi.entityService.create('api::hito.hito', {
        data: {
          ...hito,
          proyecto: result.id,
          estado_completado: false,
          publishedAt: new Date() // Si draftAndPublish está activo
        }
      });
    }
    
    console.log('✅ Hitos creados exitosamente');
  }
};
