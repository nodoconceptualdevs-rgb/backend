const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::partida.partida', ({ strapi }) => ({
  async updatePrecio(ctx) {
    const { id } = ctx.params;
    const { precio_nuevo } = ctx.request.body;

    // Validación básica
    if (typeof precio_nuevo !== 'number' || precio_nuevo < 0) {
      return ctx.badRequest('precio_nuevo debe ser un número ≥ 0');
    }

    try {
      // Verificar que partida existe
      const partida = await strapi.entityService.findOne('api::partida.partida', id);
      if (!partida) {
        return ctx.notFound('Partida no encontrada');
      }

      // Usar el service para actualizar con histórico
      const partidaActualizada = await strapi.service('api::partida.partida').updatePrecioWithHistory(id, precio_nuevo);

      console.log(`[PARTIDA] Precio actualizado: partida ${id}, nuevo precio ${precio_nuevo}`);

      return ctx.send({ data: partidaActualizada });
    } catch (error) {
      console.error('[ERROR] updatePrecio:', error);
      ctx.throw(500, 'Error actualizando precio de partida');
    }
  }
}));
