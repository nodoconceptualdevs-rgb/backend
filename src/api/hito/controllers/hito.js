const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::hito.hito', ({ strapi }) => ({
  /**
   * Crear hito
   * POST /api/hitos
   */
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Debes estar autenticado');
    }

    const { proyecto: proyectoId } = ctx.request.body.data;

    // Verificar que el proyecto existe y el usuario tiene permisos
    const proyecto = await strapi.entityService.findOne('api::proyecto.proyecto', proyectoId, {
      populate: { gerentes: true }
    });

    if (!proyecto) {
      return ctx.notFound('Proyecto no encontrado');
    }

    const esAdmin = user.role.type === 'admin';
    const esGerente = proyecto.gerentes?.some(g => g.id === user.id) || false;

    if (!esAdmin && !esGerente) {
      return ctx.forbidden('No tienes permiso para agregar hitos a este proyecto');
    }

    try {
      const hito = await strapi.entityService.create('api::hito.hito', {
        data: ctx.request.body.data,
        populate: {
          contenido: {
            populate: ['galeria_fotos', 'videos_walkthrough', 'documentacion']
          }
        }
      });

      return ctx.send({ data: hito });
    } catch (error) {
      console.error('[ERROR] crear-hito:', error);
      ctx.throw(500, 'Error creando hito');
    }
  },

  /**
   * Actualizar hito
   * PUT /api/hitos/:id
   */
  async update(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Debes estar autenticado');
    }

    // Obtener hito con proyecto
    const hito = await strapi.entityService.findOne('api::hito.hito', id, {
      populate: {
        proyecto: {
          populate: { gerentes: true }
        }
      }
    });

    if (!hito) {
      return ctx.notFound('Hito no encontrado');
    }

    const esAdmin = user.role.type === 'admin';
    const esGerente = hito.proyecto?.gerentes?.some(g => g.id === user.id) || false;

    if (!esAdmin && !esGerente) {
      return ctx.forbidden('No tienes permiso para editar este hito');
    }

    try {
      // Si se marca como completado, actualizar fecha
      const updateData = { ...ctx.request.body.data };
      if (updateData.estado_completado && !hito.fecha_actualizacion) {
        updateData.fecha_actualizacion = new Date();
      } else if (!updateData.estado_completado) {
        updateData.fecha_actualizacion = null;
      }

      const hitoActualizado = await strapi.entityService.update('api::hito.hito', id, {
        data: updateData,
        populate: {
          contenido: {
            populate: ['galeria_fotos', 'videos_walkthrough', 'documentacion']
          }
        }
      });

      return ctx.send({ data: hitoActualizado });
    } catch (error) {
      console.error('[ERROR] actualizar-hito:', error);
      ctx.throw(500, 'Error actualizando hito');
    }
  },

  /**
   * Eliminar hito
   * DELETE /api/hitos/:id
   */
  async delete(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Debes estar autenticado');
    }

    // Obtener hito con proyecto
    const hito = await strapi.entityService.findOne('api::hito.hito', id, {
      populate: {
        proyecto: {
          populate: { gerentes: true }
        }
      }
    });

    if (!hito) {
      return ctx.notFound('Hito no encontrado');
    }

    const esAdmin = user.role.type === 'admin';
    const esGerente = hito.proyecto?.gerentes?.some(g => g.id === user.id) || false;

    if (!esAdmin && !esGerente) {
      return ctx.forbidden('No tienes permiso para eliminar este hito');
    }

    try {
      await strapi.entityService.delete('api::hito.hito', id);
      return ctx.send({ data: { id } });
    } catch (error) {
      console.error('[ERROR] eliminar-hito:', error);
      ctx.throw(500, 'Error eliminando hito');
    }
  },

  /**
   * Reordenar hitos
   * POST /api/hitos/reordenar
   * Body: { data: { proyectoId: number, hitos: Array<{ id: number, orden: number }> } }
   */
  async reordenar(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Debes estar autenticado');
    }

    const { proyectoId, hitos } = ctx.request.body.data || ctx.request.body;

    if (!proyectoId || !Array.isArray(hitos) || hitos.length === 0) {
      return ctx.badRequest('Datos inválidos. Se requiere proyectoId y array de hitos');
    }

    try {
      // Verificar que el proyecto existe y el usuario tiene permisos
      const proyecto = await strapi.entityService.findOne('api::proyecto.proyecto', proyectoId, {
        populate: { gerentes: true }
      });

      if (!proyecto) {
        return ctx.notFound('Proyecto no encontrado');
      }

      const esAdmin = user.role.type === 'admin';
      const esGerente = proyecto.gerentes?.some(g => g.id === user.id) || false;

      if (!esAdmin && !esGerente) {
        return ctx.forbidden('No tienes permiso para reordenar hitos de este proyecto');
      }

      // Validar que no hay órdenes duplicados
      const ordenes = hitos.map(h => h.orden);
      const ordenesUnicos = new Set(ordenes);
      
      if (ordenes.length !== ordenesUnicos.size) {
        return ctx.badRequest('Hay órdenes duplicados en la solicitud');
      }

      // Actualizar todos los hitos en una transacción
      const promesas = hitos.map(({ id, orden }) => 
        strapi.entityService.update('api::hito.hito', id, {
          data: { orden }
        })
      );

      await Promise.all(promesas);

      // Obtener todos los hitos actualizados del proyecto
      const hitosActualizados = await strapi.entityService.findMany('api::hito.hito', {
        filters: { proyecto: proyectoId },
        populate: {
          contenido: {
            populate: ['galeria_fotos', 'videos_walkthrough', 'documentacion']
          }
        },
        sort: { orden: 'asc' }
      });

      console.log(`[HITOS] Reordenados ${hitos.length} hitos del proyecto ${proyectoId}`);

      return ctx.send({ 
        data: hitosActualizados,
        message: 'Hitos reordenados exitosamente'
      });
    } catch (error) {
      console.error('[ERROR] reordenar-hitos:', error);
      ctx.throw(500, 'Error reordenando hitos');
    }
  }
}));
