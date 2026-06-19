'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/factura-compras/generar-numero',
      handler: 'factura-compra.proximoNumero',
      config: { auth: false },
    },
    {
      method: 'PATCH',
      path: '/factura-compras/:id/anular',
      handler: 'factura-compra.anular',
      config: { auth: false },
    },
    {
      method: 'PATCH',
      path: '/factura-compras/:id/inhabilitar',
      handler: 'factura-compra.inhabilitar',
      config: { auth: false },
    },
    {
      method: 'PATCH',
      path: '/factura-compras/:id/estado',
      handler: 'factura-compra.cambiarEstado',
      config: { auth: false },
    },
  ],
};
