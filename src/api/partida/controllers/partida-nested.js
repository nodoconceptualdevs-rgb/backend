const { createCoreController } = require('@strapi/strapi').factories;

module.exports = {
  async getPartidas(ctx) {
    const { obraId } = ctx.params;

    if (!obraId) {
      return ctx.badRequest('obraId is required');
    }

    try {
      const partidas = await strapi.entityService.findMany('api::partida.partida', {
        filters: {
          obra: {
            id: parseInt(obraId)
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      return ctx.send({ data: partidas });
    } catch (error) {
      console.error('[ERROR] getPartidas:', error);
      ctx.throw(500, 'Error fetching partidas');
    }
  },

  async getPartida(ctx) {
    const { obraId, partidaId } = ctx.params;

    if (!obraId || !partidaId) {
      return ctx.badRequest('obraId and partidaId are required');
    }

    try {
      const partida = await strapi.entityService.findOne('api::partida.partida', parseInt(partidaId));

      if (!partida || partida.obra !== parseInt(obraId)) {
        return ctx.notFound('Partida not found or does not belong to this obra');
      }

      return ctx.send({ data: partida });
    } catch (error) {
      console.error('[ERROR] getPartida:', error);
      ctx.throw(500, 'Error fetching partida');
    }
  },

  async createPartida(ctx) {
    const { obraId } = ctx.params;
    const { codigo, descripcion, unidad, cantidadPresupuestada, precioUnitario, esExtra } = ctx.request.body.data;

    if (!obraId) {
      return ctx.badRequest('obraId is required');
    }

    // Validations
    if (!codigo || !descripcion || !unidad || cantidadPresupuestada === undefined || precioUnitario === undefined) {
      return ctx.badRequest('codigo, descripcion, unidad, cantidadPresupuestada, and precioUnitario are required');
    }

    if (precioUnitario < 0 || cantidadPresupuestada < 0) {
      return ctx.badRequest('cantidadPresupuestada and precioUnitario must be ≥ 0');
    }

    try {
      // Verify obra exists
      const obra = await strapi.entityService.findOne('api::obra.obra', parseInt(obraId));
      if (!obra) {
        return ctx.notFound('Obra not found');
      }

      const montoPresupuestado = cantidadPresupuestada * precioUnitario;

      const partida = await strapi.entityService.create('api::partida.partida', {
        data: {
          codigo,
          descripcion,
          unidad,
          cantidadPresupuestada,
          precioUnitario,
          montoPresupuestado,
          cantidadEjecutada: 0,
          montoEjecutado: 0,
          avancePorcentaje: 0,
          esExtra: esExtra || false,
          obra: parseInt(obraId)
        }
      });

      console.log(`[PARTIDA] Created: ${partida.id} for obra ${obraId}`);

      return ctx.send({ data: partida }, 201);
    } catch (error) {
      console.error('[ERROR] createPartida:', error);
      ctx.throw(500, 'Error creating partida');
    }
  },

  async updatePartida(ctx) {
    const { obraId, partidaId } = ctx.params;
    const { codigo, descripcion, unidad, cantidadPresupuestada, precioUnitario, esExtra } = ctx.request.body.data;

    if (!obraId || !partidaId) {
      return ctx.badRequest('obraId and partidaId are required');
    }

    try {
      // Verify partida belongs to obra
      const partida = await strapi.entityService.findOne('api::partida.partida', parseInt(partidaId));
      if (!partida || partida.obra !== parseInt(obraId)) {
        return ctx.notFound('Partida not found or does not belong to this obra');
      }

      // Validation
      if (precioUnitario < 0 || cantidadPresupuestada < 0) {
        return ctx.badRequest('cantidadPresupuestada and precioUnitario must be ≥ 0');
      }

      const montoPresupuestado = cantidadPresupuestada * precioUnitario;

      const updatedPartida = await strapi.entityService.update('api::partida.partida', parseInt(partidaId), {
        data: {
          codigo,
          descripcion,
          unidad,
          cantidadPresupuestada,
          precioUnitario,
          montoPresupuestado,
          esExtra
        }
      });

      console.log(`[PARTIDA] Updated: ${partidaId}`);

      return ctx.send({ data: updatedPartida });
    } catch (error) {
      console.error('[ERROR] updatePartida:', error);
      ctx.throw(500, 'Error updating partida');
    }
  },

  async deletePartida(ctx) {
    const { obraId, partidaId } = ctx.params;

    if (!obraId || !partidaId) {
      return ctx.badRequest('obraId and partidaId are required');
    }

    try {
      // Verify partida belongs to obra
      const partida = await strapi.entityService.findOne('api::partida.partida', parseInt(partidaId));
      if (!partida || partida.obra !== parseInt(obraId)) {
        return ctx.notFound('Partida not found or does not belong to this obra');
      }

      await strapi.entityService.delete('api::partida.partida', parseInt(partidaId));

      console.log(`[PARTIDA] Deleted: ${partidaId}`);

      return ctx.send({ data: { id: parseInt(partidaId), message: 'Partida deleted successfully' } });
    } catch (error) {
      console.error('[ERROR] deletePartida:', error);
      ctx.throw(500, 'Error deleting partida');
    }
  }
};
