// Importar la versión CommonJS compatible
const { customAlphabet } = require('nanoid/non-secure');

// Genera IDs seguros sin caracteres ambiguos
const nanoid = customAlphabet('0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', 16);

module.exports = {
  /**
   * Genera token NFC único antes de crear el proyecto
   */
  async beforeCreate(event) {
    const { data } = event.params;
    
    // Si no tiene token, generar uno único
    if (!data.token_nfc) {
      data.token_nfc = nanoid();
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
