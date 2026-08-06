const { createCoreController } = require('@strapi/strapi').factories;
const { registrarHistorial, calcularCambios } = require('../../../utils/historial');

// Campos seguros del usuario a exponer al popular `gerentes` (evita filtrar
// password, resetPasswordToken, confirmationToken, etc.)
const GERENTE_FIELDS = ['id', 'username', 'email', 'name'];

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
      // Procesar populate desde query params
      const queryPopulate = ctx.query.populate || {};
      const populate = {};

      if (queryPopulate.proyecto !== undefined) {
        populate.proyecto = true;
      }
      if (queryPopulate.gerentes !== undefined) {
        populate.gerentes = { fields: GERENTE_FIELDS };
      }
      populate.capataz = { fields: ['id', 'nombre', 'cargo'] };

      // Si no hay populate especificado, usa defaults
      if (Object.keys(populate).length === 1) {
        populate.proyecto = true;
        populate.gerentes = { fields: GERENTE_FIELDS };
      }

      let queryOptions = {
        populate,
        orderBy: ctx.query.orderBy || { createdAt: 'desc' }
      };

      // Aplicar filtro de visibilidad según rol
      if (user.role.type === 'admin') {
        // Los admins ven todas las obras
      } else if (user.role.type === 'gerente_de_proyecto') {
        const proyectosDelGerente = await strapi.entityService.findMany('api::proyecto.proyecto', {
          filters: { gerentes: { id: user.id } },
          fields: ['id']
        });

        const idsProyectos = proyectosDelGerente.map(p => p.id);

        queryOptions.filters = {
          $or: [
            { proyecto: { id: { $in: idsProyectos } } },
            { gerentes: { id: user.id } }
          ]
        };
      } else {
        return ctx.forbidden('No tienes permiso para ver obras');
      }

      const obras = await strapi.entityService.findMany('api::obra.obra', queryOptions);
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
        populate: { proyecto: true, gerentes: true, capataz: { fields: ['id', 'nombre', 'cargo'] } }
      });

      console.log(`[OBRA] Obra creada: ${obra.id} por usuario ${user.id} (${user.role.type})`);

      await registrarHistorial({
        obra,
        usuario: user,
        modulo: 'obra',
        accion: 'CREAR',
        descripcion: `Creó la obra ${obra.nombre}`,
      });

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

    // ctx.params.id en la ruta de update() es el documentId (así llama el
    // frontend siempre) — entityService.findOne espera el id numérico y no
    // lo resuelve, así que usamos el Document Service de Strapi v5.
    const antes = await strapi.documents('api::obra.obra').findOne({
      documentId: id,
      populate: {
        proyecto: true,
        gerentes: { fields: ['id', 'username'] },
        capataz: { fields: ['id', 'nombre'] },
      },
    });

    // Delegar al core controller con populate personalizado (mismo
    // whitelist de campos seguros de gerentes que usa find(), para no
    // exponer provider/confirmed/blocked/role/timestamps innecesariamente)
    ctx.query.populate = {
      proyecto: 'true',
      gerentes: { fields: GERENTE_FIELDS },
      capataz: { fields: ['id', 'nombre', 'cargo'] },
    };
    const result = await super.update(ctx);

    if (antes && result?.data) {
      const despues = result.data;

      const { cambios, resumen } = calcularCambios(antes, despues, [
        { key: 'estado', label: 'Estado' },
        { key: 'presupuesto_total', label: 'Presupuesto', formatear: (v) => `$${v ?? 0}` },
      ]);
      if (resumen) {
        await registrarHistorial({
          obra: despues,
          usuario: user,
          modulo: 'obra',
          accion: data.estado !== undefined && antes.estado !== data.estado ? 'CAMBIO_ESTADO' : 'EDITAR',
          descripcion: `Editó la obra: ${resumen}`,
          cambios,
        });
      }

      const proyectoAntes = antes.proyecto?.id ?? null;
      const proyectoDespues = despues.proyecto?.id ?? null;
      if (proyectoAntes !== proyectoDespues) {
        await registrarHistorial({
          obra: despues,
          usuario: user,
          modulo: 'obra',
          accion: 'EDITAR',
          descripcion: proyectoDespues
            ? `Vinculó el proyecto (id ${proyectoDespues})`
            : `Desvinculó el proyecto (id ${proyectoAntes})`,
        });
      }

      const capatazAntes = antes.capataz?.id ?? null;
      const capatazDespues = despues.capataz?.id ?? null;
      if (capatazAntes !== capatazDespues) {
        await registrarHistorial({
          obra: despues,
          usuario: user,
          modulo: 'obra',
          accion: 'EDITAR',
          descripcion: capatazDespues
            ? `Asignó a ${despues.capataz?.nombre ?? 'un trabajador'} como capataz`
            : `Quitó al capataz de la obra`,
        });
      }

      const idsAntes = new Set((antes.gerentes || []).map((g) => g.id));
      const idsDespues = new Set((despues.gerentes || []).map((g) => g.id));
      const agregados = (despues.gerentes || []).filter((g) => !idsAntes.has(g.id));
      const quitados = (antes.gerentes || []).filter((g) => !idsDespues.has(g.id));
      if (agregados.length > 0 || quitados.length > 0) {
        const partes = [];
        if (agregados.length > 0) partes.push(`agregó a ${agregados.map((g) => g.username).join(', ')}`);
        if (quitados.length > 0) partes.push(`quitó a ${quitados.map((g) => g.username).join(', ')}`);
        await registrarHistorial({
          obra: despues,
          usuario: user,
          modulo: 'equipo',
          accion: 'EDITAR',
          descripcion: `Equipo: ${partes.join('; ')}`,
        });
      }
    }

    return result;
  }
}));
