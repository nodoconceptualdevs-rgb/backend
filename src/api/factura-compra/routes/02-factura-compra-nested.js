'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/obras/:obraId/factura-compras',
      handler: 'factura-compra.getFacturasByObra',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/obras/:obraId/factura-compras',
      handler: 'factura-compra.createFacturaForObra',
      config: { auth: false },
    },
  ],
};
