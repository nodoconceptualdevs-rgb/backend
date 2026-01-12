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
    const { token, jwt } = ctx.request.body;

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
          clientes: {
            select: ['id', 'username', 'email']
          },
          gerentes: {
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
                select: ['id', 'name', 'username', 'email'],
                populate: {
                  role: {
                    select: ['id', 'name', 'type']
                  }
                }
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

      // Validación 4: Verificar si el proyecto requiere autenticación
      if (!proyecto.es_publico) {
        // Proyecto privado - verificar JWT token
        if (!jwt) {
          console.warn(`[SECURITY] Intento de acceso a proyecto privado sin autenticación: ${proyecto.id}`);
          return ctx.send({
            requiresAuth: true,
            message: 'Este proyecto requiere autenticación'
          });
        }

        // Verificar y decodificar JWT
        try {
          const { verify } = require('jsonwebtoken');
          const decoded = verify(jwt, strapi.config.get('plugin.users-permissions.jwtSecret'));
          
          // Buscar usuario
          const user = await strapi.query('plugin::users-permissions.user').findOne({
            where: { id: decoded.id },
            populate: ['role']
          });

          if (!user) {
            return ctx.unauthorized('Token de autenticación inválido');
          }

          // Verificar que el usuario tenga acceso al proyecto
          const esAdmin = user.role?.type === 'admin';
          const esGerente = proyecto.gerentes?.some(g => g.id === user.id);
          const esCliente = proyecto.clientes?.some(c => c.id === user.id);

          if (!esAdmin && !esGerente && !esCliente) {
            console.warn(`[SECURITY] Usuario ${user.id} intentó acceder a proyecto privado ${proyecto.id} sin permisos`);
            return ctx.forbidden('No tienes permiso para ver este proyecto');
          }

          console.log(`[AUTH-NFC] Acceso autenticado al proyecto privado: ${proyecto.id} por usuario: ${user.id}`);
        } catch (error) {
          console.error('[ERROR] Verificación JWT:', error);
          return ctx.unauthorized('Token de autenticación inválido');
        }
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

    // Admin puede ver todos los proyectos sin filtros adicionales
    if (user.role.type === 'admin') {
      return await super.find(ctx);
    }

    try {
      // Gerente de Proyecto: solo ve proyectos donde es gerente
      if (user.role.type === 'gerente_de_proyecto') {
        // Buscar proyectos usando entityService directamente
        const proyectos = await strapi.entityService.findMany('api::proyecto.proyecto', {
          filters: {
            gerentes: {
              id: user.id
            }
          },
          populate: {
            hitos: {
              populate: ['contenido']
            },
            clientes: true,
            gerentes: true
          }
        });

        return ctx.send({ data: proyectos });
      }

      // Clientes: solo ven proyectos donde son cliente
      const proyectos = await strapi.entityService.findMany('api::proyecto.proyecto', {
        filters: {
          clientes: {
            id: user.id
          }
        },
        populate: {
          hitos: {
            populate: ['contenido']
          },
          clientes: true,
          gerentes: true
        }
      });

      return ctx.send({ data: proyectos });
    } catch (error) {
      console.error('[ERROR] find proyectos:', error);
      ctx.throw(500, 'Error obteniendo proyectos');
    }
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
        gerentes: true,
        clientes: true,
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
    const esGerente = proyecto.gerentes?.some(g => g.id === user.id);
    const esCliente = proyecto.clientes?.some(c => c.id === user.id);

    if (!esAdmin && !esGerente && !esCliente) {
      return ctx.forbidden('No tienes permiso para ver este proyecto');
    }

    return ctx.send({ data: proyecto });
  },

  /**
   * Regenerar token NFC de un proyecto
   * POST /api/proyectos/:id/regenerar-token
   */
  async regenerarToken(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    // Solo admin puede regenerar tokens
    if (!user || user.role.type !== 'admin') {
      return ctx.forbidden('Solo administradores pueden regenerar tokens');
    }

    try {
      // Usar crypto nativo en lugar de nanoid
      const crypto = require('crypto');
      const nuevoToken = crypto.randomBytes(12).toString('base64').replace(/[+/=]/g, '').slice(0, 16);

      const proyecto = await strapi.entityService.update('api::proyecto.proyecto', id, {
        data: {
          token_nfc: nuevoToken
        }
      });

      console.log(`[SECURITY] Token regenerado para proyecto ${id} por usuario ${user.id}`);

      return ctx.send({
        data: {
          id: proyecto.id,
          token_nfc: proyecto.token_nfc
        },
        message: 'Token regenerado exitosamente'
      });
    } catch (error) {
      console.error('[ERROR] regenerar-token:', error);
      ctx.throw(500, 'Error regenerando token');
    }
  },

  /**
   * Crear nuevo proyecto
   * POST /api/proyectos
   */
  async create(ctx) {
    const user = ctx.state.user;

    // Solo admin puede crear proyectos
    if (!user || user.role.type !== 'admin') {
      return ctx.forbidden('Solo administradores pueden crear proyectos');
    }

    const { nombre_proyecto, fecha_inicio, estado_general, clientes, gerentes } = ctx.request.body.data;

    try {
      // Generar token NFC único usando crypto nativo
      const crypto = require('crypto');
      const tokenNFC = crypto.randomBytes(12).toString('base64').replace(/[+/=]/g, '').slice(0, 16);

      // Crear proyecto sin hitos
      const proyecto = await strapi.entityService.create('api::proyecto.proyecto', {
        data: {
          nombre_proyecto,
          fecha_inicio,
          estado_general: estado_general || 'En Planificación',
          token_nfc: tokenNFC,
          clientes,
          gerentes
        }
      });

      // Obtener proyecto completo con relaciones
      const proyectoCompleto = await strapi.entityService.findOne('api::proyecto.proyecto', proyecto.id, {
        populate: {
          gerentes: true,
          clientes: true,
          hitos: true
        }
      });

      console.log(`[PROYECTO] Proyecto creado: ${proyecto.id} por usuario ${user.id}`);

      return ctx.send({ data: proyectoCompleto });
    } catch (error) {
      console.error('[ERROR] crear-proyecto:', error);
      ctx.throw(500, 'Error creando proyecto');
    }
  },

  /**
   * Actualizar proyecto
   * PUT /api/proyectos/:id
   */
  async update(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Debes estar autenticado');
    }

    // Verificar permisos
    const proyecto = await strapi.entityService.findOne('api::proyecto.proyecto', id, {
      populate: { gerentes: true }
    });

    if (!proyecto) {
      return ctx.notFound('Proyecto no encontrado');
    }

    const esAdmin = user.role.type === 'admin';
    const esGerente = proyecto.gerentes?.some(g => g.id === user.id);

    if (!esAdmin && !esGerente) {
      return ctx.forbidden('No tienes permiso para editar este proyecto');
    }

    try {
      const proyectoActualizado = await strapi.entityService.update('api::proyecto.proyecto', id, {
        data: ctx.request.body.data,
        populate: {
          gerentes: true,
          clientes: true,
          hitos: {
            populate: {
              contenido: {
                populate: ['galeria_fotos', 'videos_walkthrough', 'documentacion']
              }
            }
          }
        }
      });

      return ctx.send({ data: proyectoActualizado });
    } catch (error) {
      console.error('[ERROR] actualizar-proyecto:', error);
      ctx.throw(500, 'Error actualizando proyecto');
    }
  }
}));
