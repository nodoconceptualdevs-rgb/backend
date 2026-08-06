'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { requierePermisoObra, requiereAdmin, obtenerUsuarioDesdeToken } = require('../../../utils/permisos-obra');
const { registrarHistorial, calcularCambios } = require('../../../utils/historial');

// Cuando una factura se aprueba, incrementa el stock de cada material
async function actualizarStockDesdeItems(strapi, items) {
  for (const item of items) {
    const material = await strapi.entityService.findOne(
      'api::material-catalogo.material-catalogo',
      item.materialId,
      { populate: { historialPrecios: true } }
    );

    if (!material) {
      console.warn(`[INVENTARIO] Material ${item.materialId} no encontrado, se omite`);
      continue;
    }

    const stockAnterior = material.stockActual || 0;
    const precioAnterior = material.precioPromedio || 0;
    const nuevoStock = stockAnterior + item.cantidad;

    // Promedio ponderado
    const nuevoPrecio = nuevoStock > 0
      ? ((stockAnterior * precioAnterior) + (item.cantidad * item.precioUnitario)) / nuevoStock
      : item.precioUnitario;

    const historialActual = material.historialPrecios || [];
    const nuevoHistorial = [
      ...historialActual,
      {
        fecha: new Date().toISOString(),
        precio: item.precioUnitario,
        cantidad: item.cantidad,
      },
    ];

    await strapi.entityService.update(
      'api::material-catalogo.material-catalogo',
      item.materialId,
      {
        data: {
          stockActual: nuevoStock,
          precioPromedio: Math.round(nuevoPrecio * 100) / 100,
          ultimaCompra: new Date().toISOString(),
          historialPrecios: nuevoHistorial,
        },
      }
    );
  }
}

// Cuando una factura se anula, revierte el stock de cada material
async function revertirStockDesdeItems(strapi, items) {
  for (const item of items) {
    const material = await strapi.entityService.findOne(
      'api::material-catalogo.material-catalogo',
      item.materialId,
      { populate: { historialPrecios: true } }
    );

    if (!material) {
      console.warn(`[INVENTARIO] Material ${item.materialId} no encontrado, se omite reversión`);
      continue;
    }

    const stockAnterior = material.stockActual || 0;
    const precioAnterior = material.precioPromedio || 0;
    const nuevoStock = Math.max(0, stockAnterior - item.cantidad);

    // Recalcular precio promedio si quedan unidades
    let nuevoPrecio = precioAnterior;
    if (nuevoStock > 0 && stockAnterior > 0) {
      // Usar la fórmula inversa: revertir el promedio ponderado
      nuevoPrecio = ((stockAnterior * precioAnterior) - (item.cantidad * item.precioUnitario)) / nuevoStock;
    } else if (nuevoStock === 0) {
      nuevoPrecio = 0;
    }

    // Remover la última entrada del historial que corresponde a esta transacción
    const historialActual = material.historialPrecios || [];
    // Buscar la entrada más reciente con esta cantidad y precio aproximado
    const nuevoHistorial = historialActual.filter((h, index) => {
      // Mantener todo el historial excepto la última entrada que coincida
      if (h.cantidad === item.cantidad &&
          Math.abs(h.precio - item.precioUnitario) < 0.01 &&
          index === historialActual.length - 1) {
        return false; // Eliminar la última entrada matching
      }
      return true;
    });

    await strapi.entityService.update(
      'api::material-catalogo.material-catalogo',
      item.materialId,
      {
        data: {
          stockActual: nuevoStock,
          precioPromedio: Math.round(nuevoPrecio * 100) / 100,
          historialPrecios: nuevoHistorial,
        },
      }
    );
  }
}

module.exports = createCoreController('api::factura-compra.factura-compra', ({ strapi }) => ({

  // ─── Nested: GET /obras/:obraId/factura-compras ───────────────────────────
  async getFacturasByObra(ctx) {
    const { obraId } = ctx.params;
    if (!obraId) return ctx.badRequest('obraId is required');
    if (!(await requierePermisoObra(ctx, obraId, 'inventario', 'read'))) return;
    try {
      const facturas = await strapi.entityService.findMany('api::factura-compra.factura-compra', {
        filters: { obra: { id: parseInt(obraId) } },
        populate: { items: true, proveedor: true },
        orderBy: { createdAt: 'desc' },
      });
      return ctx.send({ data: facturas });
    } catch (error) {
      console.error('[ERROR] getFacturasByObra:', error);
      ctx.throw(500, 'Error fetching facturas');
    }
  },

  // ─── Nested: POST /obras/:obraId/factura-compras ──────────────────────────
  async createFacturaForObra(ctx) {
    const { obraId } = ctx.params;
    if (!obraId) return ctx.badRequest('obraId is required');
    const usuarioActor = await requierePermisoObra(ctx, obraId, 'inventario', 'create');
    if (!usuarioActor) return;
    try {
      const obra = await strapi.entityService.findOne('api::obra.obra', parseInt(obraId));
      if (!obra) return ctx.notFound('Obra not found');

      const data = ctx.request.body.data || {};

      if (!data.numero || data.numero.trim() === '') {
        const ahora = new Date();
        const year = ahora.getFullYear();
        const dia = String(ahora.getDate()).padStart(2, '0');
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy); manana.setDate(manana.getDate() + 1);
        const facturasHoy = await strapi.entityService.findMany('api::factura-compra.factura-compra', {
          filters: { createdAt: { $gte: hoy.toISOString(), $lt: manana.toISOString() } },
          sort: { createdAt: 'desc' }, limit: 1,
        });
        let secuencial = 1;
        if (facturasHoy.length > 0) {
          const match = facturasHoy[0].numero.match(/\d+-\d+-(\d+)/);
          if (match) secuencial = parseInt(match[1]) + 1;
        }
        data.numero = `${year}-${dia}${mes}-${String(secuencial).padStart(4, '0')}`;
      }

      const factura = await strapi.entityService.create('api::factura-compra.factura-compra', {
        data: { ...data, obra: parseInt(obraId), obraId: parseInt(obraId), obraNombre: obra.nombre },
        populate: { items: true, proveedor: true },
      });

      if (factura.estado === 'APROBADA' && factura.items?.length > 0) {
        await actualizarStockDesdeItems(strapi, factura.items);
      }

      console.log(`[FACTURA] Created: ${factura.id} for obra ${obraId}`);

      await registrarHistorial({
        obra,
        usuario: usuarioActor,
        modulo: 'inventario',
        accion: 'CREAR',
        descripcion: `Creó la factura ${factura.numero}`,
      });

      return ctx.send({ data: factura }, 201);
    } catch (error) {
      console.error('[ERROR] createFacturaForObra:', error);
      ctx.throw(500, 'Error creating factura');
    }
  },

  async find(ctx) {
    if (!(await requiereAdmin(ctx))) return;
    return super.find(ctx);
  },

  async findOne(ctx) {
    if (!(await requiereAdmin(ctx))) return;
    return super.findOne(ctx);
  },

  async create(ctx) {
    if (!(await requiereAdmin(ctx))) return;
    try {
      const data = ctx.request.body.data;

      // Generar número secuencial si no se proporciona
      if (!data.numero || data.numero.trim() === '') {
        const ahora = new Date();
        const year = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const dia = String(ahora.getDate()).padStart(2, '0');
        const diaMes = dia + mes; // DDMM

        // Buscar últimas facturas del día
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const mañana = new Date(hoy);
        mañana.setDate(mañana.getDate() + 1);

        const facturasHoy = await strapi.entityService.findMany('api::factura-compra.factura-compra', {
          filters: {
            createdAt: { $gte: hoy.toISOString(), $lt: mañana.toISOString() }
          },
          sort: { createdAt: 'desc' },
          limit: 1,
        });

        let secuencial = 1;
        if (facturasHoy.length > 0) {
          const ultimoNumero = facturasHoy[0].numero;
          const matches = ultimoNumero.match(/\d+-\d+-(\d+)/);
          if (matches) {
            secuencial = parseInt(matches[1]) + 1;
          }
        }

        data.numero = `${year}-${diaMes}-${String(secuencial).padStart(4, '0')}`;
      } else {
        // Validar formato personalizado si se proporciona
        const numeroTrimmed = data.numero.trim();
        if (!/^\d{4}-\d{4}-\d{4}$/.test(numeroTrimmed)) {
          return ctx.badRequest('El número de factura debe tener el formato: YYYY-DDMM-XXXX (ej: 2026-1706-0001)');
        }

        // Verificar que no exista duplicado
        const existe = await strapi.entityService.findMany('api::factura-compra.factura-compra', {
          filters: { numero: numeroTrimmed },
        });
        if (existe.length > 0) {
          return ctx.badRequest(`Ya existe una factura con el número "${numeroTrimmed}"`);
        }

        data.numero = numeroTrimmed;
      }

      const factura = await strapi.entityService.create('api::factura-compra.factura-compra', {
        data,
        populate: { items: true, proveedor: true },
      });

      if (factura.estado === 'APROBADA' && factura.items?.length > 0) {
        await actualizarStockDesdeItems(strapi, factura.items);
      }

      return ctx.send({ data: factura });
    } catch (error) {
      console.error('[ERROR] crear-factura:', error);
      return ctx.internalServerError('Error al crear la factura');
    }
  },

  async update(ctx) {
    const { id } = ctx.params;
    const existente = await strapi.entityService.findOne(
      'api::factura-compra.factura-compra', id, { populate: { items: true, obra: true } }
    );
    if (!existente) return ctx.notFound('Factura no encontrada');

    const usuarioActor = await requierePermisoObra(ctx, existente.obra?.id, 'inventario', 'update');
    if (!usuarioActor) return;

    try {
      const actualizada = await strapi.entityService.update(
        'api::factura-compra.factura-compra', id,
        { data: ctx.request.body.data, populate: { items: true, proveedor: true } }
      );

      // Si cambia a APROBADA desde otro estado, actualizar stock
      const nuevoEstado = ctx.request.body.data?.estado;
      if (nuevoEstado === 'APROBADA' && existente.estado !== 'APROBADA' && actualizada.items?.length > 0) {
        await actualizarStockDesdeItems(strapi, actualizada.items);
      }

      const { cambios, resumen } = calcularCambios(existente, actualizada, [
        { key: 'estado', label: 'Estado' },
        { key: 'numero', label: 'Número' },
      ]);
      if (resumen) {
        await registrarHistorial({
          obra: existente.obra,
          usuario: usuarioActor,
          modulo: 'inventario',
          accion: 'EDITAR',
          descripcion: `Editó la factura ${actualizada.numero}: ${resumen}`,
          cambios,
        });
      }

      return ctx.send({ data: actualizada });
    } catch (error) {
      console.error('[ERROR] actualizar-factura:', error);
      return ctx.internalServerError('Error al actualizar la factura');
    }
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const factura = await strapi.entityService.findOne('api::factura-compra.factura-compra', id, {
      populate: { items: true, obra: true }
    });
    if (!factura) return ctx.notFound('Factura no encontrada');
    const usuarioActor = await requiereAdmin(ctx);
    if (!usuarioActor) return;

    // Revertir stock si la factura estaba aprobada, para no dejar unidades huérfanas
    if (factura.estado === 'APROBADA' && factura.items?.length > 0) {
      await revertirStockDesdeItems(strapi, factura.items);
    }

    const deleted = await strapi.entityService.delete('api::factura-compra.factura-compra', id);

    await registrarHistorial({
      obra: factura.obra,
      usuario: usuarioActor,
      modulo: 'inventario',
      accion: 'ELIMINAR',
      descripcion: `Eliminó la factura ${factura.numero}`,
    });

    return ctx.send({ data: deleted });
  },

  async anular(ctx) {
    const { id } = ctx.params;
    const factura = await strapi.entityService.findOne('api::factura-compra.factura-compra', id, {
      populate: { items: true, obra: true }
    });
    if (!factura) return ctx.notFound('Factura no encontrada');
    const usuarioActor = await requierePermisoObra(ctx, factura.obra?.id, 'inventario', 'update');
    if (!usuarioActor) return;
    if (factura.estado === 'ANULADA') return ctx.badRequest('La factura ya está anulada');

    // Si la factura estaba aprobada, revertir stock antes de anularla
    if (factura.estado === 'APROBADA' && factura.items?.length > 0) {
      await revertirStockDesdeItems(strapi, factura.items);
    }

    const updated = await strapi.entityService.update('api::factura-compra.factura-compra', id, {
      data: { estado: 'ANULADA' },
    });

    await registrarHistorial({
      obra: factura.obra,
      usuario: usuarioActor,
      modulo: 'inventario',
      accion: 'ELIMINAR',
      descripcion: `Anuló la factura ${factura.numero}`,
    });

    return ctx.send({ data: updated });
  },

  async inhabilitar(ctx) {
    const { id } = ctx.params;
    const factura = await strapi.entityService.findOne('api::factura-compra.factura-compra', id, {
      populate: { obra: true },
    });
    if (!factura) return ctx.notFound('Factura no encontrada');
    const usuarioActor = await requierePermisoObra(ctx, factura.obra?.id, 'inventario', 'update');
    if (!usuarioActor) return;

    const updated = await strapi.entityService.update('api::factura-compra.factura-compra', id, {
      data: { inhabilitada: true },
    });

    await registrarHistorial({
      obra: factura.obra,
      usuario: usuarioActor,
      modulo: 'inventario',
      accion: 'EDITAR',
      descripcion: `Inhabilitó la factura ${factura.numero}`,
    });

    return ctx.send({ data: updated });
  },

  async cambiarEstado(ctx) {
    const { id } = ctx.params;
    const { estado } = ctx.request.body;
    const estadosValidos = ['APROBADA', 'PAGADA', 'ANULADA'];
    if (!estadosValidos.includes(estado)) {
      return ctx.badRequest(`Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`);
    }

    const factura = await strapi.entityService.findOne(
      'api::factura-compra.factura-compra', id, { populate: { items: true, obra: true } }
    );
    if (!factura) return ctx.notFound('Factura no encontrada');
    const usuarioActor = await requierePermisoObra(ctx, factura.obra?.id, 'inventario', 'update');
    if (!usuarioActor) return;

    const updated = await strapi.entityService.update('api::factura-compra.factura-compra', id, {
      data: { estado },
      populate: { items: true },
    });

    // Si transiciona a APROBADA, actualizar stock
    if (estado === 'APROBADA' && factura.estado !== 'APROBADA' && updated.items?.length > 0) {
      await actualizarStockDesdeItems(strapi, updated.items);
    }

    await registrarHistorial({
      obra: factura.obra,
      usuario: usuarioActor,
      modulo: 'inventario',
      accion: 'CAMBIO_ESTADO',
      descripcion: `Cambió el estado de la factura ${factura.numero}: ${factura.estado} → ${estado}`,
      cambios: { estado: { anterior: factura.estado, nuevo: estado } },
    });

    return ctx.send({ data: updated });
  },

  async proximoNumero(ctx) {
    const user = await obtenerUsuarioDesdeToken(ctx);
    if (!user) return ctx.unauthorized('Debes estar autenticado');

    try {
      const ahora = new Date();
      const year = ahora.getFullYear();
      const mes = String(ahora.getMonth() + 1).padStart(2, '0');
      const dia = String(ahora.getDate()).padStart(2, '0');
      const diaMes = dia + mes; // DDMM

      // Buscar últimas facturas del día
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const mañana = new Date(hoy);
      mañana.setDate(mañana.getDate() + 1);

      const facturasHoy = await strapi.entityService.findMany('api::factura-compra.factura-compra', {
        filters: {
          createdAt: { $gte: hoy.toISOString(), $lt: mañana.toISOString() }
        },
        sort: { createdAt: 'desc' },
        limit: 1,
      });

      let secuencial = 1;
      if (facturasHoy.length > 0) {
        const ultimoNumero = facturasHoy[0].numero;
        const matches = ultimoNumero.match(/\d+-\d+-(\d+)/);
        if (matches) {
          secuencial = parseInt(matches[1]) + 1;
        }
      }

      const proximoNumero = `${year}-${diaMes}-${String(secuencial).padStart(4, '0')}`;
      return ctx.send({ data: { numero: proximoNumero } });
    } catch (error) {
      console.error('[ERROR] proximoNumero:', error);
      return ctx.internalServerError('Error al generar número de factura');
    }
  },
}));
