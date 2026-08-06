'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/inventario/resumen',
      handler: 'inventario.resumen',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'GET',
      path: '/inventario/distribucion',
      handler: 'inventario.distribucion',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
