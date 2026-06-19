'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

const ESTADOS_VALIDOS = ['DISPONIBLE', 'EN_USO', 'MANTENIMIENTO', 'DESCARTADA'];

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
    return super.create(ctx);
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
