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

module.exports = createCoreController('api::reprogramacion-tarea.reprogramacion-tarea', ({ strapi }) => ({

  async create(ctx) {
    const { tarea: tareaId, fechaNueva, motivo } = ctx.request.body.data;

    const tareaActual = await strapi.entityService.findOne(
      'api::tarea-diseno.tarea-diseno',
      tareaId,
      { fields: ['fechaEntregaEstimada'] }
    );
    const fechaAnterior = tareaActual?.fechaEntregaEstimada;

    await strapi.entityService.create('api::reprogramacion-tarea.reprogramacion-tarea', {
      data: { tarea: tareaId, fechaAnterior, fechaNueva, motivo, registradoEn: new Date().toISOString() },
    });

    await strapi.entityService.update('api::tarea-diseno.tarea-diseno', tareaId, {
      data: { fechaEntregaEstimada: fechaNueva },
    });

    const updated = await getTareaCompleta(strapi, tareaId);
    ctx.send({ data: updated });
  },

}));
