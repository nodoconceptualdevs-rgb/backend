'use strict';

const { obtenerUsuarioDesdeToken, requiereAdmin } = require('../../../utils/permisos-obra');

module.exports = {
  // Desglosa el stock de cada material entre las obras que lo tienen
  // reservado (comprado - consumido - transferido, igual que la vista de
  // cada obra) y el "Inventario General de Nodo" (lo que sobra del stock
  // total tras restar lo reservado por obras).
  async distribucion(ctx) {
    if (!(await requiereAdmin(ctx))) return;

    try {
      const [materiales, facturas, reportes, transferencias, obras] = await Promise.all([
        strapi.entityService.findMany('api::material-catalogo.material-catalogo', {}),
        strapi.entityService.findMany('api::factura-compra.factura-compra', { populate: { items: true } }),
        strapi.entityService.findMany('api::reporte.reporte', {}),
        strapi.entityService.findMany('api::transferencia-material.transferencia-material', {
          populate: {
            material: { fields: ['id'] },
            obraOrigen: { fields: ['id'] },
            obraDestino: { fields: ['id'] },
          },
        }),
        strapi.entityService.findMany('api::obra.obra', { fields: ['id', 'nombre'] }),
      ]);

      const comprado = new Map();
      const consumido = new Map();
      const transferSaliente = new Map();
      const transferEntrante = new Map();
      const sumar = (map, materialId, obraId, cantidad) => {
        const key = `${materialId}:${obraId}`;
        map.set(key, (map.get(key) || 0) + cantidad);
      };

      for (const f of facturas) {
        if (f.inhabilitada || f.estado === 'ANULADA' || !f.obraId) continue;
        for (const item of f.items || []) sumar(comprado, item.materialId, f.obraId, item.cantidad);
      }
      for (const r of reportes) {
        if (!r.obraId) continue;
        for (const mat of r.materiales || []) sumar(consumido, mat.materialId, r.obraId, mat.cantidad);
      }
      for (const t of transferencias) {
        const materialId = t.material?.id;
        if (!materialId) continue;
        if (t.obraOrigen?.id) sumar(transferSaliente, materialId, t.obraOrigen.id, t.cantidad);
        if (t.obraDestino?.id) sumar(transferEntrante, materialId, t.obraDestino.id, t.cantidad);
      }

      const filas = [];
      for (const mat of materiales) {
        let totalObras = 0;
        for (const obra of obras) {
          const key = `${mat.id}:${obra.id}`;
          const disponible = Math.max(0,
            (comprado.get(key) || 0)
            - (consumido.get(key) || 0)
            - (transferSaliente.get(key) || 0)
            + (transferEntrante.get(key) || 0)
          );
          if (disponible > 0) {
            filas.push({ materialId: mat.id, obraId: obra.id, obraNombre: obra.nombre, cantidad: disponible });
            totalObras += disponible;
          }
        }
        const nodo = Math.max(0, (mat.stockActual || 0) - totalObras);
        if (nodo > 0) {
          filas.push({ materialId: mat.id, obraId: null, obraNombre: null, cantidad: nodo });
        }
      }

      return ctx.send({
        data: {
          obras: obras.map((o) => ({ id: o.id, nombre: o.nombre })),
          filas,
        },
      });
    } catch (error) {
      console.error('[ERROR] inventario-distribucion:', error);
      return ctx.internalServerError('Error al calcular la distribución de inventario');
    }
  },

  async resumen(ctx) {
    const user = await obtenerUsuarioDesdeToken(ctx);
    if (!user) {
      return ctx.unauthorized('Debes estar autenticado');
    }

    try {
      const [facturas, materiales] = await Promise.all([
        strapi.entityService.findMany('api::factura-compra.factura-compra', {
          filters: { inhabilitada: false },
        }),
        strapi.entityService.findMany('api::material-catalogo.material-catalogo', {}),
      ]);

      const facturasActivas = facturas.filter((f) => f.estado !== 'ANULADA');

      const montoPagado = facturasActivas
        .filter((f) => f.estado === 'PAGADA')
        .reduce((sum, f) => sum + (f.total || 0), 0);

      const montoPendiente = facturasActivas
        .filter((f) => f.estado === 'APROBADA')
        .reduce((sum, f) => sum + (f.total || 0), 0);

      const materialesBajoMinimo = materiales.filter(
        (m) => m.stockMinimo != null && m.stockMinimo > 0 && m.stockActual < m.stockMinimo
      ).length;

      const valorTotalStock = materiales.reduce(
        (sum, m) => sum + ((m.stockActual || 0) * (m.precioPromedio || 0)),
        0
      );

      return ctx.send({
        data: {
          totalFacturas: facturasActivas.length,
          montoPagado,
          montoPendiente,
          totalMateriales: materiales.length,
          materialesBajoMinimo,
          valorTotalStock,
        },
      });
    } catch (error) {
      console.error('[ERROR] inventario-resumen:', error);
      return ctx.internalServerError('Error al calcular el resumen de inventario');
    }
  },
};
