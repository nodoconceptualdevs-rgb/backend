const { generateSecureToken } = require('../../utils/token-generator');

module.exports = {
  /**
   * Genera token NFC único antes de crear el proyecto
   * CRÍTICO: generateSecureToken es infalible y SIEMPRE retorna un token válido
   */
  async beforeCreate(event) {
    const { data } = event.params;

    // Si no tiene token, generar uno (generateSecureToken NUNCA falla)
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

    // CRÍTICO: Validar que el proyecto tiene token
    if (!result.token_nfc) {
      console.error('❌ CRÍTICO: Proyecto creado sin token_nfc:', result.id);
      throw new Error('El proyecto fue creado sin token NFC. Esto es un error crítico.');
    }

    console.log(`✅ Proyecto ${result.id} creado con token: ${result.token_nfc}`);

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
