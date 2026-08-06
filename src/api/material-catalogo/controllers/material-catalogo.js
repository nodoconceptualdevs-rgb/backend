'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { obtenerUsuarioDesdeToken } = require('../../../utils/permisos-obra');

function calcularEstadoStock(stockActual, stockMinimo) {
  if (!stockMinimo || stockMinimo <= 0) return 'NORMAL';
  if (stockActual === 0) return 'SIN_STOCK';
  if (stockActual < stockMinimo / 2) return 'CRITICO';
  if (stockActual < stockMinimo) return 'BAJO';
  return 'NORMAL';
}

function generarCodigoParaId(id) {
  return `MAT-${String(id).padStart(6, '0')}`;
}

module.exports = createCoreController('api::material-catalogo.material-catalogo', ({ strapi }) => ({

  async find(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Debes estar autenticado');

    const { data, meta } = await super.find(ctx);

    const materialesConEstado = data.map((item) => {
      const m = item.attributes || item;
      const stockActual = m.stockActual ?? 0;
      const stockMinimo = m.stockMinimo ?? null;
      const precioPromedio = m.precioPromedio ?? 0;
      return {
        ...item,
        estadoStock: calcularEstadoStock(stockActual, stockMinimo),
        valorTotalStock: stockActual * precioPromedio,
      };
    });

    return ctx.send({ data: materialesConEstado, meta });
  },

  async findOne(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Debes estar autenticado');
    return super.findOne(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Debes estar autenticado');
    if (user.role?.type !== 'admin' && user.role?.type !== 'gerente_de_proyecto') {
      return ctx.forbidden('Sin permisos para crear materiales');
    }
    const { data } = await super.create(ctx);
    if (!data.codigo) {
      const updated = await strapi.entityService.update(
        'api::material-catalogo.material-catalogo', data.id,
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
      return ctx.forbidden('Sin permisos para actualizar materiales');
    }
    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Debes estar autenticado');
    if (user.role?.type !== 'admin') {
      return ctx.forbidden('Solo administradores pueden eliminar materiales');
    }
    return super.delete(ctx);
  },

  async generarCodigo(ctx) {
    // ruta con auth: false (nunca se habilitó en el panel de Roles);
    // se valida el JWT a mano, mismo patrón que permisos-obra.js
    const user = await obtenerUsuarioDesdeToken(ctx);
    if (!user) return ctx.unauthorized('Debes estar autenticado');
    if (user.role?.type !== 'admin' && user.role?.type !== 'gerente_de_proyecto') {
      return ctx.forbidden('Sin permisos para generar códigos de materiales');
    }

    const { id } = ctx.params;
    const material = await strapi.entityService.findOne(
      'api::material-catalogo.material-catalogo', id
    );
    if (!material) return ctx.notFound('Material no encontrado');

    if (material.codigo) {
      return ctx.send({ data: material });
    }

    const updated = await strapi.entityService.update(
      'api::material-catalogo.material-catalogo', id,
      { data: { codigo: generarCodigoParaId(id) } }
    );
    return ctx.send({ data: updated });
  },

  async decrementar(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Debes estar autenticado');
    if (user.role?.type !== 'admin' && user.role?.type !== 'gerente_de_proyecto') {
      return ctx.forbidden('Sin permisos para modificar stock');
    }

    const { id } = ctx.params;
    const { cantidad } = ctx.request.body;

    if (!cantidad || cantidad <= 0) {
      return ctx.badRequest('La cantidad debe ser un número positivo');
    }

    const material = await strapi.entityService.findOne(
      'api::material-catalogo.material-catalogo', id
    );
    if (!material) return ctx.notFound('Material no encontrado');

    const nuevoStock = Math.max(0, (material.stockActual || 0) - cantidad);

    const updated = await strapi.entityService.update(
      'api::material-catalogo.material-catalogo', id,
      { data: { stockActual: nuevoStock } }
    );

    return ctx.send({ data: updated });
  },
}));
