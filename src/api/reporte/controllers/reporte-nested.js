module.exports = {
  async getReportes(ctx) {
    const { obraId } = ctx.params;

    if (!obraId) return ctx.badRequest('obraId is required');

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
    } = data;

    if (!obraId || !partidaId || !fecha || montoAplicado === undefined) {
      return ctx.badRequest('obraId, partidaId, fecha and montoAplicado are required');
    }

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
      const precioUnit = partida.precioUnitario || 0;
      const incremento = precioUnit > 0 ? montoAplicado / precioUnit : 0;
      if (incremento > 0) {
        const nuevaCantidad = Math.min(
          (partida.cantidadEjecutada || 0) + incremento,
          partida.cantidadPresupuestada || 0
        );
        const nuevoMonto = nuevaCantidad * precioUnit;
        const nuevoAvance = (partida.cantidadPresupuestada || 0) > 0
          ? (nuevaCantidad / partida.cantidadPresupuestada) * 100
          : 0;

        await strapi.entityService.update('api::partida.partida', parseInt(partidaId), {
          data: {
            cantidadEjecutada: nuevaCantidad,
            montoEjecutado: nuevoMonto,
            avancePorcentaje: Math.min(nuevoAvance, 100),
          },
        });
      }

      // Update obra: increment presupuesto_consumido
      if (costoTotal > 0) {
        await strapi.entityService.update('api::obra.obra', parseInt(obraId), {
          data: {
            presupuesto_consumido: (obra.presupuesto_consumido || 0) + costoTotal,
          },
        });
      }

      console.log(`[REPORTE] Created: ${reporte.id} for obra ${obraId}, partida ${partidaId}`);
      return ctx.send({ data: { ...reporte, partidaId: parseInt(partidaId) } }, 201);
    } catch (error) {
      console.error('[ERROR] createReporte:', error);
      ctx.throw(500, 'Error creating reporte');
    }
  },

  async deleteReporte(ctx) {
    const { obraId, reporteId } = ctx.params;

    if (!obraId || !reporteId) return ctx.badRequest('obraId and reporteId are required');

    try {
      const reporte = await strapi.entityService.findOne('api::reporte.reporte', parseInt(reporteId), {
        populate: ['obra'],
      });

      if (!reporte || reporte.obra?.id !== parseInt(obraId)) {
        return ctx.notFound('Reporte not found or does not belong to this obra');
      }

      await strapi.entityService.delete('api::reporte.reporte', parseInt(reporteId));

      console.log(`[REPORTE] Deleted: ${reporteId}`);
      return ctx.send({ data: { id: parseInt(reporteId) } });
    } catch (error) {
      console.error('[ERROR] deleteReporte:', error);
      ctx.throw(500, 'Error deleting reporte');
    }
  },
};
