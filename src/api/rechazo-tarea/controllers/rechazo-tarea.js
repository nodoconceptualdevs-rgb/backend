const { createCoreController } = require('@strapi/strapi').factories;

async function getTareaCompleta(strapi, numericId) {
  const [tarea, reprogramaciones, rechazos, comentarios] = await Promise.all([
    strapi.entityService.findOne('api::tarea-diseno.tarea-diseno', numericId, {
      populate: { arquitectos: true, cliente: true, proyecto: true, hito: true, archivos: true },
    }),
    strapi.entityService.findMany('api::reprogramacion-tarea.reprogramacion-tarea', {
      filters: { tarea: numericId },
      sort: { createdAt: 'asc' },
    }),
    strapi.entityService.findMany('api::rechazo-tarea.rechazo-tarea', {
      filters: { tarea: numericId },
      sort: { createdAt: 'asc' },
    }),
    strapi.entityService.findMany('api::comentario-tarea.comentario-tarea', {
      filters: { tarea: numericId },
      populate: { autor: true },
      sort: { createdAt: 'asc' },
    }),
  ]);
  if (!tarea) return null;
  return { ...tarea, reprogramaciones: reprogramaciones || [], rechazos: rechazos || [], comentarios: comentarios || [] };
}

module.exports = createCoreController('api::rechazo-tarea.rechazo-tarea', ({ strapi }) => ({

  async create(ctx) {
    const { tarea: tareaId, motivo, categoria } = ctx.request.body.data;

    await strapi.entityService.create('api::rechazo-tarea.rechazo-tarea', {
      data: { tarea: tareaId, motivo, categoria, registradoEn: new Date().toISOString() },
    });

    const tareaActual = await strapi.entityService.findOne(
      'api::tarea-diseno.tarea-diseno', tareaId, { fields: ['contadorRechazos'] }
    );
    const contadorNuevo = (tareaActual?.contadorRechazos || 0) + 1;

    await strapi.entityService.update('api::tarea-diseno.tarea-diseno', tareaId, {
      data: { contadorRechazos: contadorNuevo },
    });

    const updated = await getTareaCompleta(strapi, tareaId);
    ctx.send({ data: updated });
  },

}));
