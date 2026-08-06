const { createCoreController } = require('@strapi/strapi').factories;
const { requierePermisoObra } = require('../../../utils/permisos-obra');
const { registrarHistorial, calcularCambios } = require('../../../utils/historial');

module.exports = {
  async getPartidas(ctx) {
    const { obraId } = ctx.params;

    if (!obraId) {
      return ctx.badRequest('obraId is required');
    }

    if (!(await requierePermisoObra(ctx, obraId, 'partidas', 'read'))) return;

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

    if (!(await requierePermisoObra(ctx, obraId, 'partidas', 'read'))) return;

    try {
      const partida = await strapi.entityService.findOne('api::partida.partida', parseInt(partidaId), {
        populate: ['obra']
      });

      if (!partida || partida.obra?.id !== parseInt(obraId)) {
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

    const usuarioActor = await requierePermisoObra(ctx, obraId, 'partidas', 'create');
    if (!usuarioActor) return;

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

      await registrarHistorial({
        obra,
        usuario: usuarioActor,
        modulo: 'partidas',
        accion: 'CREAR',
        descripcion: `Creó la partida ${partida.codigo} — ${partida.descripcion}`,
      });

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

    const usuarioActor = await requierePermisoObra(ctx, obraId, 'partidas', 'update');
    if (!usuarioActor) return;

    try {
      // Verify partida belongs to obra
      const partida = await strapi.entityService.findOne('api::partida.partida', parseInt(partidaId), {
        populate: ['obra']
      });
      if (!partida || partida.obra?.id !== parseInt(obraId)) {
        return ctx.notFound('Partida not found or does not belong to this obra');
      }

      // Validation
      if (precioUnitario < 0 || cantidadPresupuestada < 0) {
        return ctx.badRequest('cantidadPresupuestada and precioUnitario must be ≥ 0');
      }

      const montoPresupuestado = cantidadPresupuestada * precioUnitario;

      // If price changed, register in history before updating
      if (precioUnitario !== undefined && precioUnitario !== partida.precioUnitario) {
        await strapi.service('api::partida.partida').updatePrecioWithHistory(parseInt(partidaId), precioUnitario);
      }

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

      const { cambios, resumen } = calcularCambios(partida, updatedPartida, [
        { key: 'codigo', label: 'Código' },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'unidad', label: 'Unidad' },
        { key: 'cantidadPresupuestada', label: 'Cantidad presupuestada' },
        { key: 'precioUnitario', label: 'Precio unitario', formatear: (v) => `$${v ?? 0}` },
      ]);
      if (resumen) {
        await registrarHistorial({
          obra: { id: parseInt(obraId), nombre: partida.obra?.nombre },
          usuario: usuarioActor,
          modulo: 'partidas',
          accion: 'EDITAR',
          descripcion: `Editó la partida ${updatedPartida.codigo}: ${resumen}`,
          cambios,
        });
      }

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

    const usuarioActor = await requierePermisoObra(ctx, obraId, 'partidas', 'delete');
    if (!usuarioActor) return;

    try {
      // Verify partida belongs to obra
      const partida = await strapi.entityService.findOne('api::partida.partida', parseInt(partidaId), {
        populate: ['obra']
      });
      if (!partida || partida.obra?.id !== parseInt(obraId)) {
        return ctx.notFound('Partida not found or does not belong to this obra');
      }

      await strapi.entityService.delete('api::partida.partida', parseInt(partidaId));

      console.log(`[PARTIDA] Deleted: ${partidaId}`);

      await registrarHistorial({
        obra: { id: parseInt(obraId), nombre: partida.obra?.nombre },
        usuario: usuarioActor,
        modulo: 'partidas',
        accion: 'ELIMINAR',
        descripcion: `Eliminó la partida ${partida.codigo} — ${partida.descripcion}`,
      });

      return ctx.send({ data: { id: parseInt(partidaId), message: 'Partida deleted successfully' } });
    } catch (error) {
      console.error('[ERROR] deletePartida:', error);
      ctx.throw(500, 'Error deleting partida');
    }
  }
};
