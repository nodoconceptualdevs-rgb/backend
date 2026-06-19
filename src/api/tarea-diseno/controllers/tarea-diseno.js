const { createCoreController } = require('@strapi/strapi').factories;

// Las relaciones oneToMany (mappedBy) no se pueden popular via populate en Strapi v5.
// Solución: query directa con filters: { tarea: id } para cada relación hija.
const POPULATE_DIRECTO = {
  arquitectos: true,
  cliente: true,
  proyecto: true,
  hito: true,
  archivos: true,
};

async function getTareaCompleta(strapi, numericId) {
  const [tarea, reprogramaciones, rechazos, comentarios] = await Promise.all([
    strapi.entityService.findOne('api::tarea-diseno.tarea-diseno', numericId, {
      populate: POPULATE_DIRECTO,
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

async function getFindAllTareas(strapi) {
  const tareas = await strapi.entityService.findMany('api::tarea-diseno.tarea-diseno', {
    populate: POPULATE_DIRECTO,
    sort: ['estado:asc', 'orden:asc'],
  });
  if (!tareas || tareas.length === 0) return [];
  return Promise.all(
    tareas.map(async (t) => {
      const [reprogramaciones, rechazos, comentarios] = await Promise.all([
        strapi.entityService.findMany('api::reprogramacion-tarea.reprogramacion-tarea', {
          filters: { tarea: t.id },
          sort: { createdAt: 'asc' },
        }),
        strapi.entityService.findMany('api::rechazo-tarea.rechazo-tarea', {
          filters: { tarea: t.id },
          sort: { createdAt: 'asc' },
        }),
        strapi.entityService.findMany('api::comentario-tarea.comentario-tarea', {
          filters: { tarea: t.id },
          populate: { autor: true },
          sort: { createdAt: 'asc' },
        }),
      ]);
      return { ...t, reprogramaciones: reprogramaciones || [], rechazos: rechazos || [], comentarios: comentarios || [] };
    })
  );
}

module.exports = createCoreController('api::tarea-diseno.tarea-diseno', ({ strapi }) => ({

  async create(ctx) {
    const { data: bodyData } = ctx.request.body;
    if (bodyData.fechaEntregaEstimada && !bodyData.fechaEntregaOriginal) {
      bodyData.fechaEntregaOriginal = bodyData.fechaEntregaEstimada;
    }
    const created = await strapi.entityService.create('api::tarea-diseno.tarea-diseno', {
      data: bodyData,
    });
    const result = await getTareaCompleta(strapi, created.id);
    ctx.send({ data: result });
  },

  async find(ctx) {
    const results = await getFindAllTareas(strapi);
    ctx.send({ data: results });
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const result = await getTareaCompleta(strapi, parseInt(id, 10));
    if (!result) return ctx.notFound();
    ctx.send({ data: result });
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data: updateData } = ctx.request.body;
    const numericId = parseInt(id, 10);
    await strapi.entityService.update('api::tarea-diseno.tarea-diseno', numericId, { data: updateData });
    const result = await getTareaCompleta(strapi, numericId);
    ctx.send({ data: result });
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const numericId = parseInt(id, 10);

    const [comentarios, reprogramaciones, rechazos] = await Promise.all([
      strapi.entityService.findMany('api::comentario-tarea.comentario-tarea', { filters: { tarea: numericId } }),
      strapi.entityService.findMany('api::reprogramacion-tarea.reprogramacion-tarea', { filters: { tarea: numericId } }),
      strapi.entityService.findMany('api::rechazo-tarea.rechazo-tarea', { filters: { tarea: numericId } }),
    ]);

    await Promise.all([
      ...comentarios.map(c => strapi.entityService.delete('api::comentario-tarea.comentario-tarea', c.id)),
      ...reprogramaciones.map(r => strapi.entityService.delete('api::reprogramacion-tarea.reprogramacion-tarea', r.id)),
      ...rechazos.map(r => strapi.entityService.delete('api::rechazo-tarea.rechazo-tarea', r.id)),
    ]);

    const result = await strapi.entityService.delete('api::tarea-diseno.tarea-diseno', numericId);
    ctx.send({ data: result });
  },

  async updateEstado(ctx) {
    const { id } = ctx.params;
    const { estado } = ctx.request.body.data;
    const numericId = parseInt(id, 10);

    const updateData = { estado };
    if (estado === 'EN_PROCESO') updateData.fechaInicio = new Date().toISOString();
    if (estado === 'COMPLETADA') updateData.fechaCompletacion = new Date().toISOString();

    await strapi.entityService.update('api::tarea-diseno.tarea-diseno', numericId, { data: updateData });
    const result = await getTareaCompleta(strapi, numericId);
    ctx.send({ data: result });
  },

  async reordenar(ctx) {
    const { tareas } = ctx.request.body.data;

    await Promise.all(
      tareas.map(({ id, orden }) =>
        strapi.entityService.update('api::tarea-diseno.tarea-diseno', id, { data: { orden } })
      )
    );

    const results = await getFindAllTareas(strapi);
    ctx.send({ data: results });
  },

}));
