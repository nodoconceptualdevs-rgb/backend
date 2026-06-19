'use strict';

module.exports = {
  async findByPartida(ctx) {
    const { partidaId } = ctx.params;

    if (!partidaId) {
      return ctx.badRequest('partidaId is required');
    }

    try {
      const entries = await strapi.db
        .query('api::partida-precio-historial.partida-precio-historial')
        .findMany({
          where: { partida: { id: parseInt(partidaId) } },
          orderBy: { fecha_inicio: 'desc' },
        });

      return ctx.send({ data: entries });
    } catch (error) {
      console.error('[ERROR] findByPartida historial:', error);
      ctx.throw(500, 'Error fetching historial de precios');
    }
  },
};
