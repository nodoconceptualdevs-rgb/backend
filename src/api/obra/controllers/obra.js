const { createCoreController } = require('@strapi/strapi').factories;

/**
 * Verifica la regla 1:1 entre proyecto y obra.
 * Devuelve true si el proyecto objetivo ya tiene una obra vinculada
 * (excluyendo, opcionalmente, la obra que se está editando).
 */
async function proyectoYaTieneObra(strapi, proyectoId, obraIdExcluir = null) {
  if (!proyectoId) return false;

  const obrasVinculadas = await strapi.entityService.findMany('api::obra.obra', {
    filters: { proyecto: { id: proyectoId } },
    fields: ['id', 'documentId']
  });

  // La ruta v5 puede llegar con documentId o id numérico; excluimos por ambos.
  return obrasVinculadas.some(
    (o) =>
      String(o.id) !== String(obraIdExcluir) &&
      String(o.documentId) !== String(obraIdExcluir)
  );
}

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
          populate: { proyecto: true, gerentes: true },
          orderBy: { createdAt: 'desc' }
        });
      } else if (user.role.type === 'gerente_de_proyecto') {
        const proyectosDelGerente = await strapi.entityService.findMany('api::proyecto.proyecto', {
          filters: { gerentes: { id: user.id } },
          fields: ['id']
        });

        const idsProyectos = proyectosDelGerente.map(p => p.id);

        obras = await strapi.entityService.findMany('api::obra.obra', {
          filters: {
            $or: [
              { proyecto: { id: { $in: idsProyectos } } },
              { gerentes: { id: user.id } }
            ]
          },
          populate: { proyecto: true, gerentes: true },
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
      const data = { ...ctx.request.body.data };

      if (user.role.type === 'gerente_de_proyecto') {
        const gerentesExistentes = Array.isArray(data.gerentes) ? data.gerentes : [];
        data.gerentes = Array.from(new Set([...gerentesExistentes, user.id]));
      }

      // Guardia 1:1 — un proyecto solo puede tener una obra vinculada
      const proyectoId = data.proyecto?.id ?? data.proyecto;
      if (await proyectoYaTieneObra(strapi, proyectoId)) {
        return ctx.badRequest('Este proyecto ya tiene una obra vinculada');
      }

      const obra = await strapi.entityService.create('api::obra.obra', {
        data,
        populate: { proyecto: true, gerentes: true }
      });

      console.log(`[OBRA] Obra creada: ${obra.id} por usuario ${user.id} (${user.role.type})`);

      return ctx.created({ data: obra });
    } catch (error) {
      console.error('[ERROR] crear-obra:', error);
      ctx.throw(500, 'Error creando obra');
    }
  },

  async update(ctx) {
    const user = ctx.state.user;

    if (!user || (user.role.type !== 'admin' && user.role.type !== 'gerente_de_proyecto')) {
      return ctx.forbidden('Solo administradores y gerentes pueden editar obras');
    }

    const { id } = ctx.params;
    const data = ctx.request.body.data || {};

    // Guardia 1:1 — solo si se intenta (re)vincular a un proyecto
    if (data.proyecto !== undefined && data.proyecto !== null) {
      const proyectoId = data.proyecto?.id ?? data.proyecto;
      if (await proyectoYaTieneObra(strapi, proyectoId, id)) {
        return ctx.badRequest('Este proyecto ya tiene una obra vinculada');
      }
    }

    // Delegar en el core controller para preservar la semántica documentId de Strapi v5
    return await super.update(ctx);
  }
}));
