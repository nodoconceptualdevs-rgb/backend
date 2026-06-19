const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::comentario-tarea.comentario-tarea', ({ strapi }) => {
  const coreController = createCoreController('api::comentario-tarea.comentario-tarea');
  const coreStrapi = coreController({ strapi });

  return {
    ...coreStrapi,

    async create(ctx) {
      const { data } = ctx.request.body;
      const usuario = ctx.state.user;

      if (!usuario) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      const comentarioData = {
        ...data,
        autor: usuario.id,
      };

      const result = await strapi.entityService.create('api::comentario-tarea.comentario-tarea', {
        data: comentarioData,
        populate: { autor: true },
      });

      ctx.send({ data: result });
    },

    async delete(ctx) {
      const { id } = ctx.params;
      const result = await strapi.entityService.delete(
        'api::comentario-tarea.comentario-tarea',
        parseInt(id, 10)
      );
      ctx.send({ data: result });
    },
  };
});
