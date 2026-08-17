const { requierePermisoObra } = require('../../../utils/permisos-obra');
const { registrarHistorial } = require('../../../utils/historial');
const { ajustarPartidaPorMonto, ajustarPresupuestoConsumido, revertirEfectosReporte } = require('../../../utils/reporte-efectos');

module.exports = {
  async getReportes(ctx) {
    const { obraId } = ctx.params;

    if (!obraId) return ctx.badRequest('obraId is required');

    if (!(await requierePermisoObra(ctx, obraId, 'reportes', 'read'))) return;

    try {
      const reportes = await strapi.entityService.findMany('api::reporte.reporte', {
        filters: { obra: { id: parseInt(obraId) } },
        populate: ['partida', 'imagenes'],
        orderBy: [{ fecha: 'desc' }, { createdAt: 'desc' }],
      });

      // Normalize: add partidaId from relation
      const data = reportes.map((r) => ({
        ...r,
        partidaId: r.partida?.id ?? null,
        partida: undefined,
        imagenes: r.imagenes ? r.imagenes.map((img) => ({
          id: img.id,
          name: img.name,
          url: img.url,
          mime: img.mime,
          size: img.size,
        })) : [],
      }));

      return ctx.send({ data });
    } catch (error) {
      console.error('[ERROR] getReportes:', error);
      ctx.throw(500, 'Error fetching reportes');
    }
  },

  async createReporte(ctx) {
    const { obraId } = ctx.params;
    let data = ctx.request.body.data;

    // Si data es un string (JSON), parsearlo
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return ctx.badRequest('Invalid JSON in data field');
      }
    }

    const {
      partidaId,
      fecha,
      montoAplicado,
      observaciones,
      personal,
      materiales,
      costoManoObra,
      costoMateriales,
      costoTotal,
      existingImageIds,
      loteId,
    } = data;

    if (!obraId || !partidaId || !fecha || montoAplicado === undefined) {
      return ctx.badRequest('obraId, partidaId, fecha and montoAplicado are required');
    }

    const usuarioActor = await requierePermisoObra(ctx, obraId, 'reportes', 'create');
    if (!usuarioActor) return;

    if (montoAplicado <= 0) {
      return ctx.badRequest('montoAplicado debe ser mayor a 0');
    }

    try {
      const obra = await strapi.entityService.findOne('api::obra.obra', parseInt(obraId));
      if (!obra) return ctx.notFound('Obra not found');

      const [partida] = await strapi.entityService.findMany('api::partida.partida', {
        filters: { id: parseInt(partidaId), obra: { id: parseInt(obraId) } },
      });
      if (!partida) return ctx.badRequest('Partida does not belong to this obra');

      if ((partida.avancePorcentaje || 0) >= 100) {
        return ctx.badRequest('Esta partida ya está ejecutada al 100%. Crea una partida extra para trabajo adicional.');
      }

      // Derive % from $ amount
      const montoPresupuestado = (partida.cantidadPresupuestada || 0) * (partida.precioUnitario || 0);
      const avanceLogrado = montoPresupuestado > 0 ? (montoAplicado / montoPresupuestado) * 100 : 0;

      const reporte = await strapi.entityService.create('api::reporte.reporte', {
        data: {
          fecha,
          avanceLogrado,
          montoAplicado,
          observaciones: observaciones || '',
          personal: personal || [],
          materiales: materiales || [],
          costoManoObra: costoManoObra || 0,
          costoMateriales: costoMateriales || 0,
          costoTotal: costoTotal || 0,
          obraNombre: obra.nombre,
          partidaCodigo: partida.codigo,
          partidaDescripcion: partida.descripcion,
          loteId: loteId || null,
          obra: parseInt(obraId),
          partida: parseInt(partidaId),
        },
      });

      // Manejar imágenes nuevas subidas como multipart
      const files = ctx.request.files?.imagenes;
      if (files && (Array.isArray(files) ? files.length > 0 : files)) {
        try {
          const imagenesToUpload = Array.isArray(files) ? files : [files];
          for (const file of imagenesToUpload) {
            await strapi.plugins.upload.services.upload.upload({
              files: file,
              ref: 'api::reporte.reporte',
              refId: reporte.id,
              field: 'imagenes',
            });
          }
        } catch (uploadError) {
          console.error('[ERROR] Upload imagenes:', uploadError);
        }
      }

      // Linkear imágenes existentes de la biblioteca
      if (existingImageIds && existingImageIds.length > 0) {
        try {
          const ids = existingImageIds.map(id => parseInt(id));
          await strapi.entityService.update('api::reporte.reporte', reporte.id, {
            data: { imagenes: ids },
          });
        } catch (linkError) {
          console.error('[ERROR] Link existing images:', linkError);
        }
      }

      // Update partida: use montoAplicado to derive quantity increment
      await ajustarPartidaPorMonto(parseInt(partidaId), montoAplicado);

      // Update obra: increment presupuesto_consumido
      await ajustarPresupuestoConsumido(parseInt(obraId), costoTotal || 0);

      console.log(`[REPORTE] Created: ${reporte.id} for obra ${obraId}, partida ${partidaId}`);

      await registrarHistorial({
        obra,
        usuario: usuarioActor,
        modulo: 'reportes',
        accion: 'CREAR',
        descripcion: `Registró un reporte diario en la partida ${partida.codigo} por $${montoAplicado}`,
      });

      return ctx.send({ data: { ...reporte, partidaId: parseInt(partidaId) } }, 201);
    } catch (error) {
      console.error('[ERROR] createReporte:', error);
      ctx.throw(500, 'Error creating reporte');
    }
  },

  async updateReporte(ctx) {
    const { obraId, reporteId } = ctx.params;
    let data = ctx.request.body.data;

    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return ctx.badRequest('Invalid JSON in data field');
      }
    }

    const {
      partidaId,
      fecha,
      montoAplicado,
      observaciones,
      personal,
      materiales,
      costoManoObra,
      costoMateriales,
      costoTotal,
      existingImageIds,
    } = data || {};

    if (!obraId || !reporteId) return ctx.badRequest('obraId and reporteId are required');
    if (!partidaId || !fecha || montoAplicado === undefined) {
      return ctx.badRequest('partidaId, fecha and montoAplicado are required');
    }
    if (montoAplicado <= 0) {
      return ctx.badRequest('montoAplicado debe ser mayor a 0');
    }

    const usuarioActor = await requierePermisoObra(ctx, obraId, 'reportes', 'create');
    if (!usuarioActor) return;

    try {
      const reporte = await strapi.entityService.findOne('api::reporte.reporte', parseInt(reporteId), {
        populate: ['obra', 'partida'],
      });

      if (!reporte || reporte.obra?.id !== parseInt(obraId)) {
        return ctx.notFound('Reporte not found or does not belong to this obra');
      }

      if (reporte.valuacionId) {
        return ctx.badRequest('No se puede editar un reporte que ya fue incluido en una valuación');
      }

      const [partidaDestinoPrevia] = await strapi.entityService.findMany('api::partida.partida', {
        filters: { id: parseInt(partidaId), obra: { id: parseInt(obraId) } },
      });
      if (!partidaDestinoPrevia) {
        return ctx.badRequest('Partida no encontrada o no pertenece a esta obra');
      }

      // Revertir el efecto del monto anterior sobre su partida original
      if (reporte.partida?.id) {
        await ajustarPartidaPorMonto(reporte.partida.id, -(reporte.montoAplicado || 0));
      }

      // Verificar que la partida destino (ya sin el aporte anterior) admita el nuevo monto
      const partidaDestino = await strapi.entityService.findOne('api::partida.partida', parseInt(partidaId));
      if ((partidaDestino.avancePorcentaje || 0) >= 100) {
        if (reporte.partida?.id) await ajustarPartidaPorMonto(reporte.partida.id, reporte.montoAplicado || 0);
        return ctx.badRequest('Esta partida ya está ejecutada al 100%. Crea una partida extra para trabajo adicional.');
      }

      const montoPresupuestado = (partidaDestino.cantidadPresupuestada || 0) * (partidaDestino.precioUnitario || 0);
      const avanceLogrado = montoPresupuestado > 0 ? (montoAplicado / montoPresupuestado) * 100 : 0;

      const reporteActualizado = await strapi.entityService.update('api::reporte.reporte', parseInt(reporteId), {
        data: {
          fecha,
          avanceLogrado,
          montoAplicado,
          observaciones: observaciones || '',
          personal: personal || [],
          materiales: materiales || [],
          costoManoObra: costoManoObra || 0,
          costoMateriales: costoMateriales || 0,
          costoTotal: costoTotal || 0,
          partidaCodigo: partidaDestino.codigo,
          partidaDescripcion: partidaDestino.descripcion,
          partida: parseInt(partidaId),
          // Reemplaza la lista completa de imágenes por la que envía el cliente
          // (ya refleja las que se quitaron); las nuevas subidas se agregan abajo.
          imagenes: Array.isArray(existingImageIds) ? existingImageIds.map((id) => parseInt(id)) : [],
        },
      });

      // Manejar imágenes nuevas subidas como multipart
      const files = ctx.request.files?.imagenes;
      if (files && (Array.isArray(files) ? files.length > 0 : files)) {
        try {
          const imagenesToUpload = Array.isArray(files) ? files : [files];
          for (const file of imagenesToUpload) {
            await strapi.plugins.upload.services.upload.upload({
              files: file,
              ref: 'api::reporte.reporte',
              refId: reporteActualizado.id,
              field: 'imagenes',
            });
          }
        } catch (uploadError) {
          console.error('[ERROR] Upload imagenes:', uploadError);
        }
      }

      // Aplicar el nuevo monto a la partida destino
      await ajustarPartidaPorMonto(parseInt(partidaId), montoAplicado);

      // Revertir el consumo de presupuesto anterior y aplicar el nuevo
      await ajustarPresupuestoConsumido(parseInt(obraId), -(reporte.costoTotal || 0));
      await ajustarPresupuestoConsumido(parseInt(obraId), costoTotal || 0);

      console.log(`[REPORTE] Updated: ${reporteId} for obra ${obraId}, partida ${partidaId}`);

      await registrarHistorial({
        obra: { id: parseInt(obraId), nombre: reporte.obra?.nombre },
        usuario: usuarioActor,
        modulo: 'reportes',
        accion: 'ACTUALIZAR',
        descripcion: `Editó un reporte diario del ${fecha}`,
      });

      return ctx.send({ data: { ...reporteActualizado, partidaId: parseInt(partidaId) } });
    } catch (error) {
      console.error('[ERROR] updateReporte:', error);
      ctx.throw(500, 'Error updating reporte');
    }
  },

  async deleteReporte(ctx) {
    const { obraId, reporteId } = ctx.params;

    if (!obraId || !reporteId) return ctx.badRequest('obraId and reporteId are required');

    // No existe una bandera "delete" propia para reportes en el modelo de
    // permisos (solo read/create) — se gatea bajo "create", la única
    // bandera de escritura disponible para este módulo.
    const usuarioActor = await requierePermisoObra(ctx, obraId, 'reportes', 'create');
    if (!usuarioActor) return;

    try {
      const reporte = await strapi.entityService.findOne('api::reporte.reporte', parseInt(reporteId), {
        populate: ['obra', 'partida'],
      });

      if (!reporte || reporte.obra?.id !== parseInt(obraId)) {
        return ctx.notFound('Reporte not found or does not belong to this obra');
      }

      if (reporte.partida?.id) {
        await ajustarPartidaPorMonto(reporte.partida.id, -(reporte.montoAplicado || 0));
      }
      await ajustarPresupuestoConsumido(parseInt(obraId), -(reporte.costoTotal || 0));

      await strapi.entityService.delete('api::reporte.reporte', parseInt(reporteId));

      console.log(`[REPORTE] Deleted: ${reporteId}`);

      await registrarHistorial({
        obra: { id: parseInt(obraId), nombre: reporte.obra?.nombre },
        usuario: usuarioActor,
        modulo: 'reportes',
        accion: 'ELIMINAR',
        descripcion: reporte.valuacionId
          ? `Eliminó un reporte diario del ${reporte.fecha} (ya estaba incluido en una valuación)`
          : `Eliminó un reporte diario del ${reporte.fecha}`,
      });

      return ctx.send({ data: { id: parseInt(reporteId) } });
    } catch (error) {
      console.error('[ERROR] deleteReporte:', error);
      ctx.throw(500, 'Error deleting reporte');
    }
  },

  // Elimina de una sola vez todos los reportes de un mismo envío (mismo loteId) —
  // es decir, "el reporte" tal como lo vive el usuario, aunque internamente sea
  // un registro por partida. Revierte el avance/presupuesto de cada uno.
  async deleteLote(ctx) {
    const { obraId, loteId } = ctx.params;

    if (!obraId || !loteId) return ctx.badRequest('obraId and loteId are required');

    const usuarioActor = await requierePermisoObra(ctx, obraId, 'reportes', 'create');
    if (!usuarioActor) return;

    try {
      const reportes = await strapi.entityService.findMany('api::reporte.reporte', {
        filters: { obra: parseInt(obraId), loteId },
        populate: ['obra', 'partida'],
      });

      if (reportes.length === 0) {
        return ctx.notFound('No se encontraron reportes para ese lote en esta obra');
      }

      const obraNombre = reportes[0].obra?.nombre;
      const fecha = reportes[0].fecha;

      for (const reporte of reportes) {
        await revertirEfectosReporte(parseInt(obraId), reporte);
        await strapi.entityService.delete('api::reporte.reporte', reporte.id);
      }

      console.log(`[REPORTE] Deleted lote ${loteId}: ${reportes.length} reportes`);

      await registrarHistorial({
        obra: { id: parseInt(obraId), nombre: obraNombre },
        usuario: usuarioActor,
        modulo: 'reportes',
        accion: 'ELIMINAR',
        descripcion: `Eliminó un reporte diario del ${fecha} (${reportes.length} partida(s))`,
      });

      return ctx.send({
        data: {
          loteId,
          eliminados: reportes.map((r) => ({ id: r.id, materiales: r.materiales || [] })),
        },
      });
    } catch (error) {
      console.error('[ERROR] deleteLote:', error);
      ctx.throw(500, 'Error deleting lote');
    }
  },
};
