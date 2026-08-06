'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { obtenerUsuarioDesdeToken } = require('../../../utils/permisos-obra');

const ESTADOS_VALIDOS = ['DISPONIBLE', 'EN_USO', 'MANTENIMIENTO', 'DESCARTADA'];

function generarCodigoParaId(id) {
  return `HER-${String(id).padStart(6, '0')}`;
}

module.exports = createCoreController('api::herramienta.herramienta', ({ strapi }) => ({

  async find(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Debes estar autenticado');
    return super.find(ctx);
  },

  async findOne(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Debes estar autenticado');
    return super.findOne(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Debes estar autenticado');
    if (user.role?.type !== 'admin' && user.role?.type !== 'gerente_de_proyecto') {
      return ctx.forbidden('Sin permisos para crear herramientas');
    }
    const { data } = await super.create(ctx);
    if (!data.codigo) {
      const updated = await strapi.entityService.update(
        'api::herramienta.herramienta', data.id,
        { data: { codigo: generarCodigoParaId(data.id) } }
      );
      return ctx.send({ data: updated });
    }
    return ctx.send({ data });
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Debes estar autenticado');
    if (user.role?.type !== 'admin' && user.role?.type !== 'gerente_de_proyecto') {
      return ctx.forbidden('Sin permisos para actualizar herramientas');
    }
    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Debes estar autenticado');
    if (user.role?.type !== 'admin' && user.role?.type !== 'gerente_de_proyecto') {
      return ctx.forbidden('Sin permisos para eliminar herramientas');
    }
    return super.delete(ctx);
  },

  async generarCodigo(ctx) {
    // ruta con auth: false (nunca se habilitó en el panel de Roles);
    // se valida el JWT a mano, mismo patrón que permisos-obra.js
    const user = await obtenerUsuarioDesdeToken(ctx);
    if (!user) return ctx.unauthorized('Debes estar autenticado');
    if (user.role?.type !== 'admin' && user.role?.type !== 'gerente_de_proyecto') {
      return ctx.forbidden('Sin permisos para generar códigos de herramientas');
    }

    const { id } = ctx.params;
    const herramienta = await strapi.entityService.findOne('api::herramienta.herramienta', id);
    if (!herramienta) return ctx.notFound('Herramienta no encontrada');

    if (herramienta.codigo) {
      return ctx.send({ data: herramienta });
    }

    const updated = await strapi.entityService.update(
      'api::herramienta.herramienta', id,
      { data: { codigo: generarCodigoParaId(id) } }
    );
    return ctx.send({ data: updated });
  },

  async updateEstado(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Debes estar autenticado');
    if (user.role?.type !== 'admin' && user.role?.type !== 'gerente_de_proyecto') {
      return ctx.forbidden('Sin permisos para cambiar estado de herramientas');
    }

    const { id } = ctx.params;
    const { estado, obraId, obraNombre } = ctx.request.body;

    if (!ESTADOS_VALIDOS.includes(estado)) {
      return ctx.badRequest(`Estado inválido. Debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    }

    const herramienta = await strapi.entityService.findOne('api::herramienta.herramienta', id);
    if (!herramienta) return ctx.notFound('Herramienta no encontrada');

    const updateData = { estado };
    if (estado === 'EN_USO' && obraId) {
      updateData.ultimoUsoFecha = new Date().toISOString();
      updateData.ultimoUsoObraId = obraId;
      updateData.ultimoUsoObraNombre = obraNombre || '';
    }

    const updated = await strapi.entityService.update('api::herramienta.herramienta', id, {
      data: updateData,
    });

    return ctx.send({ data: updated });
  },
}));
