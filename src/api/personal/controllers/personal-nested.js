'use strict';

module.exports = {
  async getPersonal(ctx) {
    const { obraId } = ctx.params;
    if (!obraId) return ctx.badRequest('obraId is required');

    try {
      const personal = await strapi.entityService.findMany('api::personal.personal', {
        filters: { obra: { id: parseInt(obraId) } },
        orderBy: { createdAt: 'asc' },
      });
      return ctx.send({ data: personal });
    } catch (error) {
      console.error('[ERROR] getPersonal:', error);
      ctx.throw(500, 'Error fetching personal');
    }
  },

  async createPersonal(ctx) {
    const { obraId } = ctx.params;
    const { nombre, cargo, costoPorHora } = ctx.request.body.data || {};

    if (!obraId) return ctx.badRequest('obraId is required');
    if (!nombre || !cargo || costoPorHora === undefined) {
      return ctx.badRequest('nombre, cargo and costoPorHora are required');
    }

    try {
      const obra = await strapi.entityService.findOne('api::obra.obra', parseInt(obraId));
      if (!obra) return ctx.notFound('Obra not found');

      const personal = await strapi.entityService.create('api::personal.personal', {
        data: { nombre, cargo, costoPorHora, obra: parseInt(obraId) },
      });

      console.log(`[PERSONAL] Created: ${personal.id} for obra ${obraId}`);
      return ctx.send({ data: personal }, 201);
    } catch (error) {
      console.error('[ERROR] createPersonal:', error);
      ctx.throw(500, 'Error creating personal');
    }
  },

  async updatePersonal(ctx) {
    const { obraId, personalId } = ctx.params;
    const { nombre, cargo, costoPorHora } = ctx.request.body.data || {};

    if (!obraId || !personalId) return ctx.badRequest('obraId and personalId are required');

    try {
      const [existing] = await strapi.entityService.findMany('api::personal.personal', {
        filters: { id: parseInt(personalId), obra: { id: parseInt(obraId) } },
      });
      if (!existing) return ctx.notFound('Personal not found or does not belong to this obra');

      const updated = await strapi.entityService.update('api::personal.personal', parseInt(personalId), {
        data: { nombre, cargo, costoPorHora },
      });

      return ctx.send({ data: updated });
    } catch (error) {
      console.error('[ERROR] updatePersonal:', error);
      ctx.throw(500, 'Error updating personal');
    }
  },

  async deletePersonal(ctx) {
    const { obraId, personalId } = ctx.params;

    if (!obraId || !personalId) return ctx.badRequest('obraId and personalId are required');

    try {
      const [existing] = await strapi.entityService.findMany('api::personal.personal', {
        filters: { id: parseInt(personalId), obra: { id: parseInt(obraId) } },
      });
      if (!existing) return ctx.notFound('Personal not found or does not belong to this obra');

      await strapi.entityService.delete('api::personal.personal', parseInt(personalId));
      return ctx.send({ data: { id: parseInt(personalId) } });
    } catch (error) {
      console.error('[ERROR] deletePersonal:', error);
      ctx.throw(500, 'Error deleting personal');
    }
  },
};
