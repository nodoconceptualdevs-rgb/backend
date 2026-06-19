const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::obra.obra', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Debes estar autenticado');
    }

    try {
      let obras;

      if (user.role.type === 'admin') {
        obras = await strapi.entityService.findMany('api::obra.obra', {
          populate: { proyecto: true },
          orderBy: { createdAt: 'desc' }
        });
      } else if (user.role.type === 'gerente_de_proyecto') {
        const proyectosDelGerente = await strapi.entityService.findMany('api::proyecto.proyecto', {
          filters: { gerentes: { id: user.id } },
          fields: ['id']
        });

        const idsProyectos = proyectosDelGerente.map(p => p.id);

        if (idsProyectos.length === 0) {
          return ctx.send({ data: [] });
        }

        obras = await strapi.entityService.findMany('api::obra.obra', {
          filters: { proyecto: { id: { $in: idsProyectos } } },
          populate: { proyecto: true },
          orderBy: { createdAt: 'desc' }
        });
      } else {
        return ctx.forbidden('No tienes permiso para ver obras');
      }

      return ctx.send({ data: obras });
    } catch (error) {
      console.error('[ERROR] find obras:', error);
      ctx.throw(500, 'Error obteniendo obras');
    }
  },

  async create(ctx) {
    const user = ctx.state.user;

    if (!user || (user.role.type !== 'admin' && user.role.type !== 'gerente_de_proyecto')) {
      return ctx.forbidden('Solo administradores y gerentes pueden crear obras');
    }

    try {
      const obra = await strapi.entityService.create('api::obra.obra', {
        data: ctx.request.body.data,
        populate: { proyecto: true }
      });

      console.log(`[OBRA] Obra creada: ${obra.id} por usuario ${user.id} (${user.role.type})`);

      return ctx.send({ data: obra });
    } catch (error) {
      console.error('[ERROR] crear-obra:', error);
      ctx.throw(500, 'Error creando obra');
    }
  }
}));
