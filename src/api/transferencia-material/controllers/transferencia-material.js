'use strict';

const { requierePermisoObra, requiereAdmin } = require('../../../utils/permisos-obra');
const { registrarHistorial } = require('../../../utils/historial');

// Replica la misma derivación que usa el frontend (ObraDetalleView) para
// "stock disponible" de un material en una obra: comprado - consumido,
// ajustado por transferencias previas hacia/desde esa obra.
async function calcularDisponibleEnObra(strapi, obraId, materialId) {
  const facturas = await strapi.entityService.findMany('api::factura-compra.factura-compra', {
    filters: { obra: { id: obraId } },
    populate: { items: true },
  });
  let comprado = 0;
  for (const f of facturas) {
    if (f.inhabilitada || f.estado === 'ANULADA') continue;
    for (const item of f.items || []) {
      if (item.materialId === materialId) comprado += item.cantidad;
    }
  }

  const reportes = await strapi.entityService.findMany('api::reporte.reporte', {
    filters: { obra: { id: obraId } },
  });
  let consumido = 0;
  for (const r of reportes) {
    for (const mat of r.materiales || []) {
      if (mat.materialId === materialId) consumido += mat.cantidad;
    }
  }

  const transferencias = await strapi.entityService.findMany('api::transferencia-material.transferencia-material', {
    filters: {
      material: { id: materialId },
      $or: [{ obraOrigen: { id: obraId } }, { obraDestino: { id: obraId } }],
    },
    populate: { obraOrigen: { fields: ['id'] }, obraDestino: { fields: ['id'] } },
  });
  let transferidoSaliente = 0;
  let transferidoEntrante = 0;
  for (const t of transferencias) {
    if (t.obraOrigen?.id === obraId) transferidoSaliente += t.cantidad;
    if (t.obraDestino?.id === obraId) transferidoEntrante += t.cantidad;
  }

  return comprado - consumido - transferidoSaliente + transferidoEntrante;
}

module.exports = {
  async crear(ctx) {
    const { materialId, cantidad, obraOrigenId, obraDestinoId, nota } = ctx.request.body?.data || {};

    if (!materialId) return ctx.badRequest('materialId es requerido');
    if (!cantidad || cantidad <= 0) return ctx.badRequest('La cantidad debe ser mayor a 0');
    if (!obraOrigenId && !obraDestinoId) return ctx.badRequest('Debe indicar obra de origen y/o destino');
    if (obraOrigenId && obraDestinoId && Number(obraOrigenId) === Number(obraDestinoId)) {
      return ctx.badRequest('La obra de origen y destino no pueden ser la misma');
    }

    let usuarioActor = null;

    if (obraOrigenId) {
      usuarioActor = await requierePermisoObra(ctx, obraOrigenId, 'inventario', 'update');
      if (!usuarioActor) return;
    }
    if (obraDestinoId) {
      const usuarioDestino = await requierePermisoObra(ctx, obraDestinoId, 'inventario', 'create');
      if (!usuarioDestino) return;
      usuarioActor = usuarioActor || usuarioDestino;
    }
    if (!usuarioActor) {
      usuarioActor = await requiereAdmin(ctx);
      if (!usuarioActor) return;
    }

    const material = await strapi.entityService.findOne('api::material-catalogo.material-catalogo', materialId);
    if (!material) return ctx.notFound('Material no encontrado');

    let obraOrigen = null;
    let obraDestino = null;

    if (obraOrigenId) {
      obraOrigen = await strapi.entityService.findOne('api::obra.obra', obraOrigenId);
      if (!obraOrigen) return ctx.notFound('Obra de origen no encontrada');
      const disponible = await calcularDisponibleEnObra(strapi, Number(obraOrigenId), Number(materialId));
      if (cantidad > disponible + 0.0001) {
        return ctx.badRequest(`Solo hay ${disponible} ${material.unidad} disponibles de "${material.nombre}" en esa obra`);
      }
    }
    if (obraDestinoId) {
      obraDestino = await strapi.entityService.findOne('api::obra.obra', obraDestinoId);
      if (!obraDestino) return ctx.notFound('Obra de destino no encontrada');
    }

    const creada = await strapi.entityService.create('api::transferencia-material.transferencia-material', {
      data: {
        material: materialId,
        materialNombre: material.nombre,
        unidad: material.unidad,
        cantidad,
        obraOrigen: obraOrigenId || null,
        obraOrigenNombre: obraOrigen?.nombre || null,
        obraDestino: obraDestinoId || null,
        obraDestinoNombre: obraDestino?.nombre || null,
        usuario: usuarioActor.id,
        usuarioNombre: usuarioActor.name || usuarioActor.username || null,
        nota: nota || null,
      },
    });

    const origenTexto = obraOrigen ? obraOrigen.nombre : 'Inventario General de Nodo';
    const destinoTexto = obraDestino ? obraDestino.nombre : 'Inventario General de Nodo';

    if (obraOrigen) {
      await registrarHistorial({
        obra: obraOrigen,
        usuario: usuarioActor,
        modulo: 'inventario',
        accion: 'EDITAR',
        descripcion: `Transfirió ${cantidad} ${material.unidad} de "${material.nombre}" a ${destinoTexto}`,
      });
    }
    if (obraDestino) {
      await registrarHistorial({
        obra: obraDestino,
        usuario: usuarioActor,
        modulo: 'inventario',
        accion: 'EDITAR',
        descripcion: `Recibió ${cantidad} ${material.unidad} de "${material.nombre}" desde ${origenTexto}`,
      });
    }

    return ctx.send({ data: creada }, 201);
  },

  async obtenerPorObra(ctx) {
    const { obraId } = ctx.params;
    if (!(await requierePermisoObra(ctx, obraId, 'inventario', 'read'))) return;

    try {
      const transferencias = await strapi.entityService.findMany('api::transferencia-material.transferencia-material', {
        filters: {
          $or: [{ obraOrigen: { id: Number(obraId) } }, { obraDestino: { id: Number(obraId) } }],
        },
        populate: {
          material: { fields: ['id'] },
          obraOrigen: { fields: ['id'] },
          obraDestino: { fields: ['id'] },
        },
        sort: { createdAt: 'desc' },
      });
      return ctx.send({ data: transferencias });
    } catch (error) {
      console.error('[ERROR] obtenerPorObra transferencias:', error);
      ctx.throw(500, 'Error obteniendo transferencias');
    }
  },
};
