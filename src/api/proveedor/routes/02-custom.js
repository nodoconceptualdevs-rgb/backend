'use strict';

module.exports = {
  routes: [
    {
      method: 'PATCH',
      path: '/proveedores/:id/toggle-activo',
      handler: 'proveedor.toggleActivo',
      config: { policies: [], middlewares: [] },
    },
  ],
};
