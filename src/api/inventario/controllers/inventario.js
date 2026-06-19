'use strict';

module.exports = {
  async resumen(ctx) {
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
