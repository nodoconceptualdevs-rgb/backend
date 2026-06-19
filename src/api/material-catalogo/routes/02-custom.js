'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/material-catalogos/:id/decrementar',
      handler: 'material-catalogo.decrementar',
      config: { policies: [], middlewares: [] },
    },
  ],
};
