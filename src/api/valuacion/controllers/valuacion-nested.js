'use strict';

const { requierePermisoObra } = require('../../../utils/permisos-obra');
const { registrarHistorial } = require('../../../utils/historial');
const { revertirEfectosReporte } = require('../../../utils/reporte-efectos');

module.exports = {
  async getValuaciones(ctx) {
    const { obraId } = ctx.params;

    if (!(await requierePermisoObra(ctx, obraId, 'valuaciones', 'read'))) return;

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

    const usuarioActor = await requierePermisoObra(ctx, obraId, 'valuaciones', 'create');
    if (!usuarioActor) return;

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

      await registrarHistorial({
        obra,
        usuario: usuarioActor,
        modulo: 'valuaciones',
        accion: 'CREAR',
        descripcion: `Concretó la valuación V${numero} (${reportesPendientes.length} reportes)`,
      });

      return ctx.send({ data: nuevaValuacion });
    } catch (error) {
      console.error('[ERROR] createValuacion:', error);
      ctx.throw(500, 'Error creando valuación');
    }
  },

  // Elimina una valuación completa (el "cierre") junto con todos los reportes
  // que agrupaba, revirtiendo en cada uno el avance de partida y el consumo de
  // presupuesto que habían aplicado — es decir, como si esos reportes nunca se
  // hubieran registrado. Devuelve los materiales de cada reporte eliminado para
  // que el frontend reponga el stock de inventario que habían consumido.
  async deleteValuacion(ctx) {
    const { obraId, valuacionId } = ctx.params;

    if (!obraId || !valuacionId) return ctx.badRequest('obraId and valuacionId are required');

    const usuarioActor = await requierePermisoObra(ctx, obraId, 'valuaciones', 'create');
    if (!usuarioActor) return;

    try {
      const obra = await strapi.entityService.findOne('api::obra.obra', parseInt(obraId));
      if (!obra) return ctx.notFound('Obra no encontrada');

      const valuacion = await strapi.entityService.findOne('api::valuacion.valuacion', parseInt(valuacionId), {
        populate: ['obra'],
      });
      if (!valuacion || valuacion.obra?.id !== parseInt(obraId)) {
        return ctx.notFound('Valuación no encontrada o no pertenece a esta obra');
      }

      const reportes = await strapi.entityService.findMany('api::reporte.reporte', {
        filters: { obra: parseInt(obraId), valuacionId: parseInt(valuacionId) },
        populate: ['partida'],
      });

      for (const reporte of reportes) {
        await revertirEfectosReporte(parseInt(obraId), reporte);
        await strapi.entityService.delete('api::reporte.reporte', reporte.id);
      }

      await strapi.entityService.delete('api::valuacion.valuacion', parseInt(valuacionId));

      console.log(`[VALUACION] Deleted: V${valuacion.numero} for obra ${obraId}, ${reportes.length} reportes eliminados en cascada`);

      await registrarHistorial({
        obra,
        usuario: usuarioActor,
        modulo: 'valuaciones',
        accion: 'ELIMINAR',
        descripcion: `Eliminó la valuación V${valuacion.numero} y sus ${reportes.length} reporte(s)`,
      });

      return ctx.send({
        data: {
          id: parseInt(valuacionId),
          reportesEliminados: reportes.map((r) => ({ id: r.id, materiales: r.materiales || [] })),
        },
      });
    } catch (error) {
      console.error('[ERROR] deleteValuacion:', error);
      ctx.throw(500, 'Error deleting valuación');
    }
  },
};
