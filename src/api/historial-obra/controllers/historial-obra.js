'use strict';

const { requierePermisoObra, requiereAdmin } = require('../../../utils/permisos-obra');

module.exports = {
  async obtenerHistorialObra(ctx) {
    const { obraId } = ctx.params;
    if (!(await requierePermisoObra(ctx, obraId, 'historial', 'read'))) return;

    try {
      const eventos = await strapi.entityService.findMany('api::historial-obra.historial-obra', {
        filters: { obra: { id: parseInt(obraId) } },
        sort: { createdAt: 'desc' },
      });
      return ctx.send({ data: eventos });
    } catch (error) {
      console.error('[ERROR] obtenerHistorialObra:', error);
      ctx.throw(500, 'Error obteniendo historial');
    }
  },

  async obtenerHistorialGlobal(ctx) {
    if (!(await requiereAdmin(ctx))) return;

    try {
      const eventos = await strapi.entityService.findMany('api::historial-obra.historial-obra', {
        sort: { createdAt: 'desc' },
        limit: 500,
      });
      return ctx.send({ data: eventos });
    } catch (error) {
      console.error('[ERROR] obtenerHistorialGlobal:', error);
      ctx.throw(500, 'Error obteniendo historial global');
    }
  },
};
