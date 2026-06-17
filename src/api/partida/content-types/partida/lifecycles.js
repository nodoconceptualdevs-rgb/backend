module.exports = {
  async afterCreate({ result }) {
    try {
      // Crear primer registro en histórico cuando se crea la partida
      await strapi.entityService.create('api::partida-precio-historial.partida-precio-historial', {
        data: {
          partida: result.id,
          precio: result.precio_actual,
          fecha_inicio: new Date().toISOString(),
          fecha_fin: null
        }
      });

      console.log(`[PARTIDA] Historia de precios creada automáticamente para partida ${result.id}`);
    } catch (error) {
      console.error('[ERROR] afterCreate partida:', error);
      throw error;
    }
  }
};
