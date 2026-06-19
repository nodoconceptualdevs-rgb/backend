'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

let cache = { data: null, timestamp: 0 };
const CACHE_DURATION = 10000; // 10 segundos

module.exports = createCoreController('api::unidad-medida.unidad-medida', ({ strapi }) => ({
  async find(ctx) {
    const now = Date.now();
    if (cache.data && now - cache.timestamp < CACHE_DURATION) {
      return { data: cache.data };
    }

    const result = await super.find(ctx);
    cache = { data: result.data, timestamp: now };
    return result;
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Debes estar autenticado');
    if (user.role?.type !== 'admin' && user.role?.type !== 'gerente_de_proyecto') {
      return ctx.forbidden('Sin permisos para crear unidades de medida');
    }

    const { nombre, abreviatura } = ctx.request.body?.data || {};
    if (!nombre?.trim()) return ctx.badRequest('El nombre es requerido');

    // Evitar duplicados
    const normalizado = nombre.trim().toLowerCase();
    const existe = await strapi.entityService.findMany('api::unidad-medida.unidad-medida', {
      filters: { nombre: normalizado },
    });
    if (existe.length > 0) return ctx.send({ data: existe[0] });

    ctx.request.body.data = { nombre: normalizado, abreviatura: abreviatura?.trim() || normalizado };
    return super.create(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user || user.role?.type !== 'admin') return ctx.forbidden('Solo administradores pueden eliminar unidades');
    return super.delete(ctx);
  },
}));
