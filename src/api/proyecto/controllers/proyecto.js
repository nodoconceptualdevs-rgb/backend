const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::proyecto.proyecto', ({ strapi }) => ({
  /**
   * Endpoint personalizado para autenticación vía token NFC
   * POST /api/proyectos/auth-nfc
   * 
   * SEGURIDAD:
   * - Valida token NFC válido
   * - No expone información sensible
   * - Registra intentos fallidos
   * - Devuelve respuesta genérica para fallos
   */
  async authNFC(ctx) {
    const { token } = ctx.request.body;

    // Validación 1: Token requerido
    if (!token || typeof token !== 'string') {
      return ctx.badRequest('Token NFC requerido');
    }

    // Validación 2: Formato de token (16 caracteres alfanuméricos)
    if (!/^[0-9A-Za-z]{16}$/.test(token)) {
      console.warn(`[SECURITY] Intento de auth-nfc con token inválido: ${token.substring(0, 5)}...`);
      return ctx.notFound('Proyecto no encontrado');
    }

    try {
      // Buscar proyecto por token NFC
      const proyecto = await strapi.db.query('api::proyecto.proyecto').findOne({
        where: { token_nfc: token },
        populate: {
          cliente: {
            select: ['id', 'username', 'email']
          },
          gerente_proyecto: {
            select: ['id', 'username', 'email']
          },
          hitos: {
            populate: {
              contenido: {
                populate: ['galeria_fotos', 'videos_walkthrough', 'documentacion']
              }
            },
            orderBy: { orden: 'desc' }
          },
          comentarios: {
            populate: {
              autor: {
                select: ['id', 'username']
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!proyecto) {
        console.warn(`[SECURITY] Intento de auth-nfc con token inexistente`);
        // Respuesta genérica para no revelar información
        return ctx.notFound('Proyecto no encontrado');
      }

      // Validación 3: Proyecto debe estar activo
      if (!proyecto.estado_general) {
        console.warn(`[SECURITY] Intento de acceso a proyecto inactivo: ${proyecto.id}`);
        return ctx.notFound('Proyecto no encontrado');
      }

      // Calcular progreso del proyecto
      const totalHitos = proyecto.hitos.length;
      const hitosCompletados = proyecto.hitos.filter(h => h.estado_completado).length;
      const progreso = totalHitos > 0 ? Math.round((hitosCompletados / totalHitos) * 100) : 0;

      // Log de acceso exitoso
      console.log(`[AUTH-NFC] Acceso exitoso al proyecto: ${proyecto.id} (${proyecto.nombre_proyecto})`);

      return ctx.send({
        data: {
          ...proyecto,
          progreso
        }
      });
    } catch (error) {
      console.error('[ERROR] auth-nfc:', error);
      // No exponer detalles del error
      ctx.throw(500, 'Error procesando solicitud');
    }
  },

  /**
   * Sobrescribir find para filtrar por gerente si no es admin
   */
  async find(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Debes estar autenticado');
    }

    // Si es admin, puede ver todos los proyectos
    if (user.role.type === 'admin' || user.role.type === 'gerente_proyecto') {
      // Filtrar solo proyectos asignados al gerente
      if (user.role.type !== 'admin') {
        ctx.query.filters = {
          ...ctx.query.filters,
          gerente_proyecto: {
            id: user.id
          }
        };
      }

      return await super.find(ctx);
    }

    // Clientes solo ven sus proyectos
    ctx.query.filters = {
      ...ctx.query.filters,
      cliente: {
        id: user.id
      }
    };

    return await super.find(ctx);
  },

  /**
   * Sobrescribir findOne para validar acceso
   */
  async findOne(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Debes estar autenticado');
    }

    const proyecto = await strapi.entityService.findOne('api::proyecto.proyecto', id, {
      populate: {
        gerente_proyecto: true,
        cliente: true,
        hitos: {
          populate: {
            contenido: {
              populate: ['galeria_fotos', 'videos_walkthrough', 'documentacion']
            }
          }
        }
      }
    });

    if (!proyecto) {
      return ctx.notFound('Proyecto no encontrado');
    }

    // Verificar acceso
    const esAdmin = user.role.type === 'admin';
    const esGerente = proyecto.gerente_proyecto?.id === user.id;
    const esCliente = proyecto.cliente?.id === user.id;

    if (!esAdmin && !esGerente && !esCliente) {
      return ctx.forbidden('No tienes permiso para ver este proyecto');
    }

    return ctx.send({ data: proyecto });
  }
}));
