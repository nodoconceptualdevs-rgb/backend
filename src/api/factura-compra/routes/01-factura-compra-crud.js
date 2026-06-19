'use strict';

module.exports = {
  routes: [
    { method: 'GET',    path: '/factura-compras',     handler: 'factura-compra.find',    config: { auth: false } },
    { method: 'GET',    path: '/factura-compras/:id', handler: 'factura-compra.findOne', config: { auth: false } },
    { method: 'POST',   path: '/factura-compras',     handler: 'factura-compra.create',  config: { auth: false } },
    { method: 'PUT',    path: '/factura-compras/:id', handler: 'factura-compra.update',  config: { auth: false } },
    { method: 'DELETE', path: '/factura-compras/:id', handler: 'factura-compra.delete',  config: { auth: false } },
  ],
};
