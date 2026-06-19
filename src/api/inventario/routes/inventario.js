'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/inventario/resumen',
      handler: 'inventario.resumen',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
