'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::proveedor.proveedor', ({ strapi }) => ({

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
      return ctx.forbidden('Solo administradores pueden gestionar proveedores');
    }
    return super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Debes estar autenticado');
    if (user.role?.type !== 'admin' && user.role?.type !== 'gerente_de_proyecto') {
      return ctx.forbidden('Solo administradores pueden gestionar proveedores');
    }
    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Debes estar autenticado');
    if (user.role?.type !== 'admin') {
      return ctx.forbidden('Solo administradores pueden eliminar proveedores');
    }
    return super.delete(ctx);
  },

  async toggleActivo(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Debes estar autenticado');
    if (user.role?.type !== 'admin' && user.role?.type !== 'gerente_de_proyecto') {
      return ctx.forbidden('Sin permisos para esta acción');
    }

    const { id } = ctx.params;
    const proveedor = await strapi.entityService.findOne('api::proveedor.proveedor', id);
    if (!proveedor) return ctx.notFound('Proveedor no encontrado');

    const updated = await strapi.entityService.update('api::proveedor.proveedor', id, {
      data: { activo: !proveedor.activo },
    });

    return ctx.send({ data: updated });
  },
}));
