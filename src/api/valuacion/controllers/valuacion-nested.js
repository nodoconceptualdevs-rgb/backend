'use strict';

module.exports = {
  async getValuaciones(ctx) {
    const { obraId } = ctx.params;

    try {
      const valuaciones = await strapi.entityService.findMany('api::valuacion.valuacion', {
        filters: { obra: parseInt(obraId) },
        sort: { numero: 'asc' },
      });

      return ctx.send({ data: valuaciones });
    } catch (error) {
      console.error('[ERROR] getValuaciones:', error);
      ctx.throw(500, 'Error obteniendo valuaciones');
    }
  },

  async createValuacion(ctx) {
    const { obraId } = ctx.params;
    const body = ctx.request.body?.data || ctx.request.body || {};

    try {
      const obra = await strapi.entityService.findOne('api::obra.obra', parseInt(obraId));
      if (!obra) return ctx.notFound('Obra no encontrada');

      const reportesPendientes = await strapi.entityService.findMany('api::reporte.reporte', {
        filters: { obra: parseInt(obraId), valuacionId: null },
        fields: ['id'],
      });

      if (reportesPendientes.length === 0) {
        return ctx.badRequest('No hay reportes pendientes para concretar');
      }

      const existentes = await strapi.entityService.findMany('api::valuacion.valuacion', {
        filters: { obra: parseInt(obraId) },
        fields: ['id'],
      });
      const numero = existentes.length + 1;

      const nuevaValuacion = await strapi.entityService.create('api::valuacion.valuacion', {
        data: {
          numero,
          fecha: body.fecha || new Date().toISOString().split('T')[0],
          notas: body.notas || null,
          lineas: body.lineas || [],
          totalPresupuesto:      body.totalPresupuesto      || 0,
          totalEjecutado:        body.totalEjecutado        || 0,
          totalAumentos:         body.totalAumentos         || 0,
          totalDisminuciones:    body.totalDisminuciones    || 0,
          totalExtras:           body.totalExtras           || 0,
          presupuestoModificado: body.presupuestoModificado || 0,
          costoManoObra:         body.costoManoObra         || 0,
          costoMateriales:       body.costoMateriales       || 0,
          costoTotal:            body.costoTotal            || 0,
          obra: parseInt(obraId),
        },
      });

      await Promise.all(
        reportesPendientes.map((r) =>
          strapi.entityService.update('api::reporte.reporte', r.id, {
            data: { valuacionId: nuevaValuacion.id },
          })
        )
      );

      console.log(`[VALUACION] Creada V${numero} para obra ${obraId}, ${reportesPendientes.length} reportes marcados`);
      return ctx.send({ data: nuevaValuacion });
    } catch (error) {
      console.error('[ERROR] createValuacion:', error);
      ctx.throw(500, 'Error creando valuación');
    }
  },
};
